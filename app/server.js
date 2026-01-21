import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from "mongoose";
import kleur from 'kleur';

// Importaciones para GraphQL 
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import typeDefs from '../typeDefs/typeDefs.js';
import resolvers from '../resolvers/resolvers.js';

// Rutas REST
import { router as userRoutes } from '../routes/userRoutes.js';
import { router as taskRoutes } from '../routes/taskRoutes.js';
import { router as authRoutes } from '../routes/authRoutes.js';

dotenv.config();

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.graphQLPath = '/graphql'; 

        // Servidor HTTP para envolver Express y Sockets
        this.server = http.createServer(this.app);

        // Sockets
        this.io = new SocketServer(this.server, {
            cors: { origin: "*" }
        });

        // Paths REST
        this.paths = {
            users: '/api/users',
            tasks: '/api/tasks',
            auth: '/api/auth'
        };

        // Configurar ApolloServer
        this.serverGraphQL = new ApolloServer({
            typeDefs,
            resolvers,
            plugins: [
                {
                    async requestDidStart() {
                        return {
                            async willSendResponse({ response, errors }) {
                                if (errors) {
                                    response.body.singleResult.errors = errors.map(err => ({
                                        message: err.message
                                    }));
                                }
                            },
                        };
                    },
                },
            ],
        });

        this.conectarMongoose();
        this.middlewares();
        this.routes();
        this.sockets();
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
        this.app.use(express.static('public')); 

        
        this.app.use((req, res, next) => {
            req.io = this.io;
            next();
        });
    }

    routes() {
        this.app.use(this.paths.users, userRoutes);
        this.app.use(this.paths.tasks, taskRoutes);
        this.app.use(this.paths.auth, authRoutes);
    }

    
    async applyGraphQLMiddleware() {
        this.app.use(
            this.graphQLPath,
            express.json(),
            expressMiddleware(this.serverGraphQL, {
                context: async ({ req }) => {
                    const token = req.header('x-token');
                    return { token };
                },
            })
        );
    }

    sockets() {
        this.io.on('connection', (socket) => {
            console.log(kleur.yellow('Cliente conectado: ' + socket.id));
            socket.on('disconnect', () => {
                console.log(kleur.yellow('Cliente desconectado'));
            });
        });
    }

    
    async listen() {
        
        await this.serverGraphQL.start();

        
        this.applyGraphQLMiddleware();

        // 3. Levantar el servidor HTTP
        this.server.listen(this.port, () => {
            console.log(kleur.green().bold(`\n🟢 Servidor REST y Sockets en puerto: ${this.port}`));
            console.log(kleur.magenta().bold(`🚀 GraphQL listo en: http://localhost:${this.port}${this.graphQLPath}`));
        });
    }
}

export { Server };