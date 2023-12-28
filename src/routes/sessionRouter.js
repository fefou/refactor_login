import { Router } from 'express';
import { usuariosModelo } from '../dao/models/users.model.js';
import crypto from 'crypto'
export const router = Router()


router.post('/login', async (req, res) => {

    let { email, password } = req.body

    // Usuario administrador hardcodeado
    const adminEmail = 'adminCoder@coder.com';
    const adminPassword = 'adminCod3r123';

    if (email === adminEmail && password === adminPassword) {
        // Si las credenciales corresponden al usuario administrador, crea la sesión
        req.session.usuario = {
            nombre: 'Admin',
            email: adminEmail,
            rol: 'admin'
        };
        return res.redirect(`/realtimeproducts?mensajeBienvenida=Bienvenido ${req.session.usuario.nombre}, su rol es ${req.session.usuario.rol}`);
    }

    if (!email || !password) {
        return res.redirect('/login?error=Complete todos los datos')
    }

    password = crypto.createHmac("sha256", "CoderCoder").update(password).digest("hex")

    let usuario = await usuariosModelo.findOne({ email, password })
    if (!usuario) {
        return res.redirect(`/login?error=credenciales incorrectas`)
    }

    req.session.usuario = {
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
    }

    res.redirect(`/realtimeproducts?mensajeBienvenida=Bienvenido ${usuario.nombre}, su rol es ${usuario.rol}`)

})

router.post('/register', async (req, res) => {

    let { nombre, email, password } = req.body
    if (!nombre || !email || !password) {
        return res.redirect('/register?error=Complete todos los datos')
    }

    let existe = await usuariosModelo.findOne({ email })
    if (existe) {
        return res.redirect(`/register?error=El usuario con email ${email} ya existe`)
    }

    password = crypto.createHmac("sha256", "CoderCoder").update(password).digest("hex")

    let usuario
    try {
        usuario = await usuariosModelo.create({ nombre, email, password })
        res.redirect(`/login?mensaje=Usuario ${email}registrado correctamente`)
    } catch (error) {
        res.redirect(`/register?error=Error inesperado. Reintente en unos minutos`)
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.redirect('/?error=Error al cerrar sesión')
        }
        res.redirect('/login')
    })
})