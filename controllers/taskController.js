import TaskModel from '../models/task.js';
import kleur from 'kleur';

export const taskControlador = {

    //  Crear Tarea (Solo Admin)
    taskPost: async (req, res) => {
        try {
            const nuevaTarea = new TaskModel(req.body);
            await nuevaTarea.save();

            const totalLibres = await TaskModel.countDocuments({ assignedTo: null });
            
            req.io.emit('contador-tareas-libres', totalLibres);
            req.io.emit('tarea-nueva-pura', nuevaTarea); 

            console.log(kleur.magenta().bold('Tarea creada y guardada'));
            res.status(201).json(nuevaTarea);
        } catch (error) {
            res.status(500).json({ msg: 'Error al crear la tarea' });
        }
    },

    //  Obtener todas las tareas (Admin)
    tasksGet: async (req, res) => {
        try {
            const tareas = await TaskModel.find().lean();
            res.status(200).json(tareas);
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener tareas' });
        }
    },

    // Editar Tarea Completa (Solo Admin)
    taskUpdateAdmin: async (req, res) => {
        const { id } = req.params;
        const datos = req.body;
        try {
            const tarea = await TaskModel.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
            if (!tarea) return res.status(404).json({ msg: 'Tarea no encontrada' });
            
            const totalLibres = await TaskModel.countDocuments({ assignedTo: null });

            req.io.emit('contador-tareas-libres', totalLibres);
            req.io.emit('tarea-actualizada-pura', tarea);

            console.log(kleur.yellow().bold(`Tarea ${id} editada por Admin`));
            res.status(200).json(tarea);
        } catch (error) {
            res.status(500).json({ msg: 'Error al editar la tarea' });
        }
    },

    // Asignar tarea a un usuario (Solo admin)
    taskAsignarAdmin: async (req, res) => {
        const { idTarea } = req.params;
        const { idUsuarioDestino } = req.body; 
        try {
            const tarea = await TaskModel.findByIdAndUpdate(
                idTarea, 
                { assignedTo: idUsuarioDestino }, 
                { new: true }
            );
            if (!tarea) return res.status(404).json({ msg: 'Tarea no encontrada' });

            const totalLibres = await TaskModel.countDocuments({ assignedTo: null });
            
            req.io.emit('contador-tareas-libres', totalLibres);
            req.io.emit('tarea-actualizada-pura', tarea);

            console.log(kleur.yellow().bold(`Admin asignó tarea ${idTarea} a usuario ${idUsuarioDestino}`));
            res.status(200).json(tarea);
        } catch (error) {
            res.status(500).json({ msg: 'Error en la asignación forzada' });
        }
    },

    // Coger tarea si esta libre
    taskCogerUsuario: async (req, res) => {
        const { idTarea } = req.params;
        const uidToken = req.uid; 
        try {
            const tareaPrevia = await TaskModel.findById(idTarea);
            if (!tareaPrevia) return res.status(404).json({ msg: 'Tarea no existe' });
            if (tareaPrevia.assignedTo) return res.status(400).json({ msg: 'Tarea ya ocupada' });

            const tarea = await TaskModel.findByIdAndUpdate(
                idTarea, 
                { assignedTo: uidToken }, 
                { new: true }
            );

            const totalLibres = await TaskModel.countDocuments({ assignedTo: null });
            
            req.io.emit('contador-tareas-libres', totalLibres);
            req.io.emit('tarea-actualizada-pura', tarea);

            console.log(kleur.blue().bold(`Usuario ${uidToken} cogió la tarea ${idTarea}`));
            res.status(200).json(tarea);
        } catch (error) {
            res.status(500).json({ msg: 'Error al coger la tarea' });
        }
    },

    // Tareas SIN ASIGNAR, ordenadas por duración y dificultad
    tasksSinAsignar: async (req, res) => {
        try {
            const tareas = await TaskModel.find({ assignedTo: null })
                .sort({ duration: 1, difficulty: 1 })
                .lean();
            res.status(200).json(tareas);
        } catch (error) {
            res.status(500).json({ msg: 'Error al obtener tareas disponibles' });
        }
    },

    // Cambiar estado de la tarea (usuario que tenga la tarea)
    taskCambiarEstado: async (req, res) => {
        const { id } = req.params; 
        const { nuevoEstado } = req.body;
        const uidToken = req.uid; 
        const rolToken = req.roles; 

        // Validar que el nuevo estado sea uno de los permitidos
        const estadosPermitidos = TaskModel.estados;
        if (!estadosPermitidos.includes(nuevoEstado)) {
            return res.status(400).json({ 
                msg: `Estado no válido. Los estados permitidos son: ${estadosPermitidos.join(', ')}` 
            });
        }

        try {
            // Buscamos la tarea primero para verificar quién es el dueño
            const tarea = await TaskModel.findById(id);

            if (!tarea) {
                return res.status(404).json({ msg: 'Tarea no encontrada' });
            }

            // Solo el dueño de la tarea (o un ADMIN) puede cambiar el estado
            if (tarea.assignedTo !== uidToken && !rolToken.includes('ADMIN')) {
                return res.status(403).json({ 
                    msg: 'No tienes permiso para cambiar el estado de una tarea que no tienes asignada.' 
                });
            }

            // Si todo sta bien actualizamos
            tarea.status = nuevoEstado;
            await tarea.save();
            
            req.io.emit('tarea-actualizada-pura', tarea);
            
            console.log(kleur.blue().bold(`Tarea ${id} actualizada a: ${nuevoEstado} por ${uidToken}`));
            
            res.status(200).json(tarea);

        } catch (error) {
            res.status(500).json({ msg: 'Error al actualizar el estado' });
        }
    },

    // Tareas por Usuario y Dificultad
    tasksPorUsuarioYDificultad: async (req, res) => {
        const { idUsuario, dificultad } = req.params;
        try {
            const query = { assignedTo: idUsuario };
            if (dificultad && dificultad !== 'null') query.difficulty = dificultad;
            const tareas = await TaskModel.find(query).lean();
            res.status(200).json(tareas);
        } catch (error) {
            res.status(500).json({ msg: 'Error al filtrar tareas' });
        }
    },

    // Contador tareas XL
    countMaxDificultad: async (req, res) => {
        try {
            const total = await TaskModel.countDocuments({ difficulty: 'XL' });
            res.status(200).json({ totalXL: total });
        } catch (error) {
            res.status(500).json({ msg: 'Error en el conteo' });
        }
    },

    // Filtrar por rango de dificultad
    tasksPorRangoDificultad: async (req, res) => {
        const { min, max } = req.query;
        const orden = TaskModel.dificultades
        try {
            const rango = orden.slice(orden.indexOf(min), orden.indexOf(max) + 1);
            const tareas = await TaskModel.find({ difficulty: { $in: rango } }).sort({ difficulty: 1 });
            res.status(200).json(tareas);
        } catch (error) {
            res.status(500).json({ msg: 'Error al filtrar por rango' });
        }
    },

    // Resumen por estado para el usuario logueado
    tasksResumenCliente: async (req, res) => {
        try {
            // Buscamos todas las tareas asignadas al usuario del token
            const misTareas = await TaskModel.find({ assignedTo: req.uid }).lean();

            // Calculamos el total de tareas que tiene
            const totalTareas = misTareas.length;

            // Saber cuántas tiene de cada estado de forma rápida
            const porHacer = misTareas.filter(t => t.status === 'por hacer').length;
            const haciendo = misTareas.filter(t => t.status === 'haciendo').length;
            const hechas = misTareas.filter(t => t.status === 'hecha').length;

            res.status(200).json({
                total: totalTareas,
                stats: { porHacer, haciendo, hechas },
                tareas: misTareas 
            });
        } catch (error) {
            res.status(500).json({ msg: 'Error al generar el resumen detallado' });
        }
    },

    // Inserción masiva de tareas 
    tasksGenerarFaker: async (req, res) => {
        try {
            const { n = 10 } = req.body;
            const dificultades = TaskModel.dificultades
            const estados = TaskModel.estados
            const descripciones = ['Reparar DNS', 'DB Update', 'Security Logs', 'SQL Opt', 'Docker Migration'];
            const tareasNuevas = [];
            for (let i = 0; i < n; i++) {
                tareasNuevas.push({
                    description: descripciones[Math.floor(Math.random() * descripciones.length)] + ` ${Date.now()}`,
                    duration: Math.floor(Math.random() * 10) + 1,
                    difficulty: dificultades[Math.floor(Math.random() * dificultades.length)],
                    status: estados[Math.floor(Math.random() * estados.length)],
                    assignedTo: null
                });
            }
            const docs = await TaskModel.insertMany(tareasNuevas);

            const totalLibres = await TaskModel.countDocuments({ assignedTo: null });
            
            req.io.emit('contador-tareas-libres', totalLibres);
            docs.forEach(tarea => req.io.emit('tarea-nueva-pura', tarea));

            res.status(201).json({ msg: `${n} tareas creadas` });
        } catch (error) {
            res.status(500).json({ msg: 'Error en Faker' });
        }
    }
};

export default taskControlador;