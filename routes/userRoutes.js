import { Router } from 'express';
import controlador from '../controllers/userController.js'
import { validarJWT } from '../middleware/validarJWT.js';
import { esAdmin } from '../middleware/validarRoles.js';

export const router = Router();

router.get('/', [validarJWT], controlador.usuariosGet);
router.get('/:id', [validarJWT], controlador.usuarioGet);
router.post('/', [validarJWT, esAdmin], controlador.usuariosPost);
router.put('/:id',[validarJWT, esAdmin], controlador.usuariosPut);
router.delete('/:id',[validarJWT, esAdmin], controlador.usuariosDelete);
router.post('/faker',[validarJWT, esAdmin], controlador.usuariosGenerarFaker);

export default router;