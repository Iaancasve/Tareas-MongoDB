import UserModel from '../models/user.js';
import kleur from 'kleur';
import { faker } from '@faker-js/faker';

const controlador = {

    // Obtener todos los usuarios
    usuariosGet: async (req, res) => {
        try {
            const personas = await UserModel.find().lean();
            
            if (personas.length > 0) {
                console.log(kleur.blue().bold('🔵 Listado de usuarios recuperado!'));
                res.status(200).json(personas);
            } else {
                console.log(kleur.yellow().bold('‼️ No hay registros en la colección usuarios'));
                res.status(200).json({ 'msg': 'No se han encontrado registros' });
            }
        } catch (error) {
            console.error(kleur.red().bold('❌ Error al obtener usuarios:'), error);
            res.status(500).json({ 'msg': 'Error al obtener usuarios' });
        }
    },

    // Obtener un usuario por ID
    usuarioGet: async (req, res) => {
        try {
            
            const usuario = await UserModel.findOne({ id: req.params.id });
            
            if (usuario) {
                console.log(kleur.blue().bold(`🔵 Usuario ${req.params.id} encontrado!`));
                res.status(200).json(usuario);
            } else {
                console.log(kleur.yellow().bold('‼️ Usuario no encontrado!'));
                res.status(404).json({ 'msg': 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error(kleur.red().bold('❌ Error al obtener usuario por ID:'), error);
            res.status(500).json({ 'msg': 'Error al obtener usuario por ID' });
        }
    },

    // Crear usuario (Registro manual)
    usuariosPost: async (req, res) => {
        try {
            
            const { id, username, email, password, rol } = req.body;

            const usuario = await UserModel.create({ id, username, email, password, rol });

            console.log(kleur.green().bold('🔵 Usuario registrado correctamente!'));
            res.status(201).json(usuario);
        } catch (error) {
            console.error(kleur.red().bold('❌ Error al registrar usuario:'), error);
            res.status(500).json({ 'msg': 'Error al registrar usuario (posible ID o Email duplicado)' });
        }
    },

    // Actualizar usuario 
    usuariosPut: async (req, res) => {
        try {
            const usuarioActualizado = await UserModel.findOneAndUpdate(
                { id: req.params.id }, 
                req.body, 
                { new: true, runValidators: true }
            );

            if (usuarioActualizado) {
                console.log(kleur.blue().bold('🔵 Usuario actualizado correctamente!'));
                res.status(200).json(usuarioActualizado);
            } else {
                console.log(kleur.yellow().bold('‼️ Usuario no encontrado para actualizar!'));
                res.status(404).json({ 'msg': 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error(kleur.red().bold('❌ Error al actualizar usuario:'), error);
            res.status(500).json({ 'msg': 'Error al actualizar usuario' });
        }
    },

    // Eliminar usuario 
    usuariosDelete: async (req, res) => {
        try {
            const usuarioEliminado = await UserModel.deleteOne({ id: req.params.id });
            
            if (usuarioEliminado.deletedCount > 0) {
                console.log(kleur.red().bold('🔵 Usuario eliminado correctamente!'));
                res.status(200).json(usuarioEliminado);
            } else {
                console.log(kleur.yellow().bold('‼️ Usuario no encontrado para eliminar!'));
                res.status(404).json({ 'msg': 'Usuario no encontrado' });
            }
        } catch (error) {
            console.error(kleur.red().bold('❌ Error al eliminar usuario:'), error);
            res.status(500).json({ 'msg': 'Error al eliminar usuario' });
        }
    },

    // Generar N usuarios aleatorios (Faker)
    usuariosGenerarFaker: async (req, res) => {
        try {
            const { n } = req.body;
            const num = n || 5;
            const usuariosFaker = [];

            for (let i = 0; i < num; i++) {
                usuariosFaker.push({
                    id: faker.string.uuid(), 
                    username: faker.internet.userName(),
                    email: faker.internet.email(),
                    password: 'password123', 
                    rol: 'USER'
                });
            }

            await UserModel.insertMany(usuariosFaker);
            console.log(kleur.magenta().bold(`Se han generado ${num} usuarios con Faker`));
            res.status(201).json({ msg: `Sistema llenado con ${num} usuarios` });
        } catch (error) {
            console.error(kleur.red().bold('❌ Error al generar usuarios Faker:'), error);
            res.status(500).json({ 'msg': 'Error al generar usuarios aleatorios' });
        }
    }
}

export default controlador;