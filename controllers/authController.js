import { response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user.js';
import { generarJWT_Roles } from '../helpers/generate_jwt.js';
import kleur from 'kleur';
import { v4 as uuidv4 } from 'uuid';

export const login = async (req, res = response) => {
    const { email, password } = req.body;

    try {
        
        const usuario = await UserModel.findOne({ email });

        if (!usuario) {
            console.log(kleur.red().bold('‼️ No hay registro de ese usuario.'));
            return res.status(400).json({ msg: 'Login incorrecto - Usuario no existe' });
        }

        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            console.log(kleur.red().bold('‼️ Contraseña incorrecta.'));
            return res.status(400).json({ msg: 'Login incorrecto - Password error' });
        }

        const token = await generarJWT_Roles(usuario.id, [usuario.rol]);

        console.log(kleur.green().bold(`✅ Login correcto para: ${usuario.username}`));

        res.status(200).json({
            usuario: {
                id: usuario.id,
                username: usuario.username,
                rol: usuario.rol
            },
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error en el servidor.' });
    }
}; 

export const registro = async (req, res = response) => {
    
    const { username, email, password } = req.body;

    try {
        
        const existeUsuario = await UserModel.findOne({ $or: [{ email }, { username }] });
        if (existeUsuario) {
            console.log(kleur.red().bold(' Error: Email o Usuario ya registrado.'));
            return res.status(400).json({ msg: 'No se puede completar el registro - Datos duplicados' });
        }

        
        const usuario = new UserModel({ 
            id: uuidv4(), // Generamos el ID de forma automática
            username, 
            email, 
            password, 
            rol: 'USER' 
        });

        
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);

        
        await usuario.save();

        
        const token = await generarJWT_Roles(usuario.id, [usuario.rol]);

        console.log(kleur.green().bold(`Registro exitoso: ${usuario.username} con ID: ${usuario.id}`));

        res.status(201).json({
            usuario: {
                id: usuario.id,
                username: usuario.username,
                rol: usuario.rol
            },
            token
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error crítico en el servidor durante el registro.' });
    }
};