import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generarJWT_Roles = (uid = '', roles = []) => {
    // Usamos 'uid' para guardar tu ID personalizado y 'roles' para el rol del usuario
    console.log("UID para Token: " + uid);
    
    // Usamos las clave secreta para el token
    let token = jwt.sign({ uid, roles }, process.env.SECRETORPRIVATEKEY, {
        expiresIn: '4h' 
    });
    
    return token;
}