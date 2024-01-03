
import express from 'express'
import productosRouter from './routes/productosRouter.js'
import carritoRouter from './routes/carritoRouter.js'
import { engine } from 'express-handlebars'
import { router as vistasRouter } from './routes/vistasRouter.js'
import { Server } from 'socket.io'
import __dirname from './utils.js'
import path from 'path'
import pm from './manager/productManager.js'
import mongoose from 'mongoose'
import { messagesModelo } from './dao/models/messages.model.js'
import sessions from 'express-session'
import mongoStore from 'connect-mongo'
import { router as sessionRouter } from './routes/sessionRouter.js'

import { inicializarPassport } from './config/config.passport.js'
import passport from 'passport';

const productos = pm.getProducts()
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use(express.static(path.join(__dirname, '/public')))

app.use(sessions({
    secret: "CoderCoder",
    resave: true, saveUninitialized: true,
    store: mongoStore.create(
        {
            mongoUrl: 'mongodb+srv://ffedecairo:CoderCoder@cluster0.uazzwoe.mongodb.net/?retryWrites=true&w=majority',
            mongoOptions: { dbName: 'ecommerce' },
            ttl: 3600

        })
}))

inicializarPassport()
app.use(passport.initialize())
app.use(passport.session())

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './src/views')


app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).render('home');
})


app.use('/api/products', productosRouter)
app.use('/api/carts', carritoRouter)
app.use('/', vistasRouter)
app.use('/api/sessions', sessionRouter)

const serverHTTP = app.listen(port, () => {
    console.log(`Server escuchando en puerto ${port}`);
})

let usuarios = []
let mensajes = []

export const serverSockets = new Server(serverHTTP)

serverSockets.on("connection", socket => {
    console.log(`se conecto un cliente con id ${socket.id}`)


    socket.on('id', email => {

        usuarios.push({ email, id: socket.id })
        socket.broadcast.emit('nuevoUsuario', email)
        socket.emit("Hola", mensajes)
    })

    socket.on('mensaje', datos => {
        mensajes.push(datos)
        serverSockets.emit('nuevoMensaje', datos)

        messagesModelo.create({ user: datos.emisor, message: datos.mensaje })
    })

    socket.on("disconnect", () => {
        let usuario = usuarios.find(u => u.id === socket.id)
        if (usuario) {
            serverSockets.emit('usuarioDesconectado', usuario.email)
        }
    })
})


try {
    await mongoose.connect('mongodb+srv://ffedecairo:CoderCoder@cluster0.uazzwoe.mongodb.net/?retryWrites=true&w=majority', { dbName: 'ecommerce' })

    console.log('DB Online')
} catch (error) {
    console.log(error.message)
}