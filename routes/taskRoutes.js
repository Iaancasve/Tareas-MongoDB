import { Router } from 'express';
const router = Router();

// Ruta vacía de prueba
router.get('/test', (req, res) => res.send('Ruta de tareas lista para desarrollo futuro'));

export { router };