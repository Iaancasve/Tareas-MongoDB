import { response } from 'express';
import kleur from 'kleur';

export const esAdmin = (req, res, next) => {
    // El validarJWT debe ejecutarse ANTES que este para que req.roles exista
    if (!req.roles) {
        return res.status(500).json({ msg: 'Se quiere verificar el rol sin validar el token primero' });
    }

    if (!req.roles.includes('ADMIN')) {
        console.log(kleur.red().bold(`Intento de acceso denegado a UID: ${req.uid}`));
        return res.status(403).json({ 
            msg: `El usuario con ID ${req.uid} no tiene privilegios de Administrador.` 
        });
    }

    console.log(kleur.green().bold(`Admin ${req.uid} accediendo a zona restringida...`));
    next();
};

export const esUsuario = (req, res, next) => {
    if (!req.roles) {
        return res.status(500).json({ msg: 'Se quiere verificar el rol sin validar el token primero' });
    }

    if (!req.roles.includes('USER')) {
        return res.status(403).json({ 
            msg: 'Esta acción requiere un rol de Usuario estándar.' 
        });
    }

    console.log(kleur.blue().bold(`Usuario ${req.uid} accediendo...`));
    next();
};