import { Router } from 'express';
import taskControlador from '../controllers/taskController.js';
import { validarJWT } from '../middleware/validarJWT.js';
import { esAdmin } from '../middleware/validarRoles.js';

export const router = Router();

// --- 1. RUTAS DE CONSULTA (Cualquier usuario logueado) ---

// Ver todas las tareas
router.get('/', [validarJWT], taskControlador.tasksGet);

// Ver tareas sin asignar (Disponibles para coger)
router.get('/disponibles', [validarJWT], taskControlador.tasksSinAsignar);

// Ver mis estadísticas (Resumen por estado)
router.get('/mi-resumen', [validarJWT], taskControlador.tasksResumenCliente);

// Filtrar por rango: /api/tasks/rango?min=S&max=L
router.get('/rango', [validarJWT], taskControlador.tasksPorRangoDificultad);

// Ver tareas de un usuario específico (se puede filtrar por dificultad pero no es obligatorio)
router.get('/usuario/:idUsuario/:dificultad?', [validarJWT], taskControlador.tasksPorUsuarioYDificultad);

// Contador de tareas XL
router.get('/count-xl', [validarJWT], taskControlador.countMaxDificultad);


// --- 2. RUTAS DE ACCIÓN PARA EL USUARIO ---

// Coger una tarea libre 
router.put('/coger-tarea/:idTarea', [validarJWT], taskControlador.taskCogerUsuario);

// Cambiar el estado de una tarea (por hacer -> haciendo -> hecha)
router.put('/estado/:id', [validarJWT], taskControlador.taskCambiarEstado);


// --- 3. RUTAS EXCLUSIVAS DEL ADMINISTRADOR ---

// Crear una nueva tarea
router.post('/', [validarJWT, esAdmin], taskControlador.taskPost);

// Editar tarea completa (Cambiar descripción, horas, dificultad, etc.)
router.put('/:id', [validarJWT, esAdmin], taskControlador.taskUpdateAdmin);

// Asignar tarea a un usuario específico
router.put('/admin-asignar/:idTarea', [validarJWT, esAdmin], taskControlador.taskAsignarAdmin);

// Generar tareas masivas (Faker)
router.post('/faker', [validarJWT, esAdmin], taskControlador.tasksGenerarFaker);


export default router;