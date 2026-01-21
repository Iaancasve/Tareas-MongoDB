import { usuariosGet } from '../controllers/userController_GQL.js';
import { addTask, tasksGetAsignadas } from '../controllers/taskController_GQL.js';
import { validarJWT_GQL } from '../helpers/validar-jwt.gql.js';
import TaskModel from '../models/task.js';

const resolvers = {
    Query: {
        
        getUsers: async (_, __, { token }) => {
            await validarJWT_GQL(token);
            return await usuariosGet();
        },

        
        getTareasAgrupadas: async (_, __, { token }) => {
            await validarJWT_GQL(token);
            return await tasksGetAsignadas();
        },
    },

    Mutation: {
        
        agregarTarea: async (_, args, { token }) => {
            await validarJWT_GQL(token, true);
            return await addTask(args);
        },
    },

    // Para evitar el valor 'null' en las tareas de los usuarios
    User: {
        tasks: async (parent) => {
            return await TaskModel.find({ assignedTo: parent.id });
        }
    }
};

export default resolvers;