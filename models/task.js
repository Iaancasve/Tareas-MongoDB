import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: [true, 'La descripción de la tarea es obligatoria'],
        trim: true
    },
    duration: {
        type: Number, // En horas
        required: [true, 'La duración en horas es obligatoria']
    },
    difficulty: {
        type: String,
        required: true,
        enum: ['XS', 'S', 'M', 'L', 'XL'] 
    },
    status: {
        type: String,
        required: true,
        enum: ['por hacer', 'haciendo', 'hecha'],
        default: 'por hacer'
    },
    assignedTo: {
        type: String, // Guardaremos el id  del usuario
        default: null // Null significa que la tarea esta sin asignar
    }
}, { 
    collection: 'tareas', 
    versionKey: false, 
    timestamps: true // Para saber cuando se creo la tarea
});

const TaskModel = mongoose.model('Task', taskSchema);

// Los he creado para luego usarlos en el taskController para solo tener que cambiarlos aqui y no en todos los sitios donde los use.
TaskModel.estados = ['por hacer', 'haciendo', 'hecha'];
TaskModel.dificultades = ['XS', 'S', 'M', 'L', 'XL'];

export default TaskModel;