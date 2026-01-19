import { response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from '../models/user.js';
import { generarJWT_Roles } from '../helpers/generate_jwt.js';
import kleur from 'kleur';

export const login = async (req, res = response) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario en MongoDB por el email
        const usuario = await UserModel.findOne({ email });

        if (!usuario) {
            console.log(kleur.red().bold('‼️ No hay registro de ese usuario.'));
            return res.status(400).json({ msg: 'Login incorrecto - Usuario no existe' });
        }

        // Verificar la contraseña 
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            console.log(kleur.red().bold('‼️ Contraseña incorrecta.'));
            return res.status(400).json({ msg: 'Login incorrecto - Password error' });
        }

    
        // Pasamos el id y el rol para generar el token
        const token = generarJWT_Roles(usuario.id, [usuario.rol]);

        console.log(kleur.green().bold(`✅ Login correcto para: ${usuario.username}`));
        console.log(kleur.gray().italic(`Token generado: ${token}`));

        // Respuesta 
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
}