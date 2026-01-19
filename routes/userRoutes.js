import { Router } from 'express';
import controlador from '../controllers/userController.js'
export const router = Router();


router.get('/', controlador.usuariosGet);
router.get('/:id', controlador.usuarioGet);
router.post('/', controlador.usuariosPost);
router.put('/:id', controlador.usuariosPut);
router.delete('/:id', controlador.usuariosDelete);
router.post('/faker', controlador.usuariosGenerarFaker);

export default router;