import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; 
import { Server as SocketServer } from 'socket.io'; 
import mongoose from "mongoose";
import kleur from 'kleur';

// Importa tus rutas (asegúrate de crearlas después)
import { router as userRoutes } from '../routes/userRoutes.js';
import { router as taskRoutes } from '../routes/taskRoutes.js';

dotenv.config();

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        
        // Creamos el servidor HTTP para envolver la app de Express
        this.server = http.createServer(this.app);
        
        // Configuramos Socket.io
        this.io = new SocketServer(this.server, {
            cors: { origin: "*" } // Ajustar según necesites en producción
        });

        // Paths
        this.paths = {
            users: '/api/users',
            tasks: '/api/tasks'
        };

        this.conectarMongoose();
        this.middlewares();
        this.routes();
        this.sockets(); // Nueva sección para la lógica de tiempo real
    }

    conectarMongoose() {
        mongoose.set('strictQuery', false);
        mongoose.connect(process.env.DB_URL, {
            dbName: process.env.DB_DATABASE,
        });

        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'Error de conexión:'));
        this.db.once('open', () => {
            console.log(kleur.blue().bold('🔵 Conexión exitosa a MongoDB'));
        });
    }

    middlewares() {
        this.app.use(cors());
        this.app.use(express.json());
        // Middleware para pasar el 'io' a los controllers si lo necesitas
        this.app.use((req, res, next) => {
            req.io = this.io;
            next();
        });
    }

    routes() {
        this.app.use(this.paths.users, userRoutes);
        this.app.use(this.paths.tasks, taskRoutes);
    }

    sockets() {
        this.io.on('connection', (socket) => {
            console.log('Cliente conectado:', socket.id);
            
            socket.on('disconnect', () => {
                console.log('Cliente desconectado');
            });
        });
    }

    listen() {
        // IMPORTANTE: Escuchamos con 'this.server', no con 'this.app'
        this.server.listen(this.port, () => {
            console.log(kleur.green().bold(`🟢 Servidor con Sockets en puerto: ${this.port}`));
        });
    }
}

export { Server };