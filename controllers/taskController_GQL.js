import TaskModel from '../models/task.js';
import UserModel from '../models/user.js';

export const addTask = async (datos) => {
    try {
        const usuario = await UserModel.findOne({ id: datos.assignedTo });
        if (!usuario) throw new Error("El usuario asignado no existe");

        const nuevaTarea = new TaskModel(datos);
        return await nuevaTarea.save();
    } catch (error) {
        throw new Error("Error al añadir tarea: " + error.message);
    }
};

export const tasksGetAsignadas = async () => {
    try {
        return await TaskModel.aggregate([
            {
                $lookup: {
                    from: 'usuarios', 
                    localField: 'assignedTo',
                    foreignField: 'id',
                    as: 'usuario'
                }
            },
            { $unwind: '$usuario' },
            {
                $group: {
                    _id: '$usuario.username',
                    tareas: {
                        $push: {
                            description: '$description',
                            duration: '$duration'
                        }
                    }
                }
            }
        ]);
    } catch (error) {
        throw new Error('Error en el informe: ' + error.message);
    }     
};