import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    id:{
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        minlength: 6
    },
    rol: {
        type: String,
        enum: ['ADMIN', 'USER'], 
        default: 'USER'
    }
}, { collection: 'usuarios', versionKey: false });

// Middleware para encriptar antes de guardar
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

const UserModel = mongoose.model('User', userSchema);
export default UserModel;