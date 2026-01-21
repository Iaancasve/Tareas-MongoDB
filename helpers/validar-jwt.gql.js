import jwt from 'jsonwebtoken';
import UserModel from '../models/user.js';

export const validarJWT_GQL = async (token = '', adminRequired = false) => {
    if (!token) {
        throw new Error('No hay token en la petición');
    }

    try {
        
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

    
        const usuario = await UserModel.findOne({ id: uid });

        if (!usuario) {
            throw new Error('Token no válido - usuario no existe en DB');
        }

        if (adminRequired && usuario.rol !== 'ADMIN') {
            throw new Error('No tienes permisos de administrador para realizar esta acción');
        }

        return usuario;
    } catch (error) {
        throw new Error(error.message || 'Token no válido');
    }
};