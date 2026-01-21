import UserModel from '../models/user.js';

export const usuariosGet = async () => {
    try {
        return await UserModel.find();
    } catch (error) {
        throw new Error('Error al obtener usuarios: ' + error.message);
    }
};