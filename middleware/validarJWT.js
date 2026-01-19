import { response, request } from 'express';
import jwt from 'jsonwebtoken';
import kleur from 'kleur';

export const validarJWT = (req = request, res = response, next) => {
    // Leer el token del header
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {
        // Verificar el token
        const { uid, roles } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        // Guardamos los datos en el objeto 'req'
        req.uid = uid;
        req.roles = roles;

        console.log(kleur.cyan().bold(`Token validado para UID: ${uid}`));
        
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        });
    }
};