import { Router } from 'express';
import controlador from '../controllers/userController.js'
import { validarJWT } from '../middleware/validarJWT.js';
import { esAdmin } from '../middleware/validarRoles.js';

export const router = Router();

// ---  RUTAS DE ADMINISTRACIÓN (Solo ADMIN) ---

// Usuarios y sus tareas 
router.get('/informe-tareas', [validarJWT, esAdmin], controlador.getTareasAgrupadasPorUsuario);

// Crear un nuevo usuario manualmente
router.post('/', [validarJWT, esAdmin], controlador.usuariosPost);

// Actualizar datos de un usuario
router.put('/:id', [validarJWT, esAdmin], controlador.usuariosPut);

// Eliminar un usuario 
router.delete('/:id', [validarJWT, esAdmin], controlador.usuariosDelete);

// Generar usuarios de prueba masivamente
router.post('/faker', [validarJWT, esAdmin], controlador.usuariosGenerarFaker);

// ---  RUTAS DE CONSULTA (Cualquier usuario logueado) ---

// Obtener lista de usuarios 
router.get('/', [validarJWT], controlador.usuariosGet);

// Obtener datos de un usuario específico
router.get('/:id', [validarJWT], controlador.usuarioGet);



export default router;