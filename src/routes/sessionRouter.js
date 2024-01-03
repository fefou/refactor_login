import { Router } from 'express';
import { usuariosModelo } from '../dao/models/users.model.js';
import { creaHash } from '../utils.js';
import { validaPassword } from '../utils.js';
// import crypto from 'crypto'
import passport from 'passport';

export const router = Router()

router.get('/github', passport.authenticate('github', {}), (req, res) => { })

router.get('/callbackGithub', passport.authenticate('github', { failureRedirect: "/api/sessions/errorGithub" }), (req, res) => {

    console.log(req.user)
    req.session.ususario = req.user
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        message: "Acceso OK", usuario: req.user

    });

});

router.get('/errorGithub', (req, res) => {

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
        error: "Error al autenticar con Github"
    });
})

router.get('/errorLogin', (req, res) => {
    return res.redirect('/login?error=Error en el proceso de login')
})

router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/errorLogin' }), async (req, res) => {

    // let { email, password } = req.body

    // // Usuario administrador hardcodeado
    // const adminEmail = 'adminCoder@coder.com';
    // const adminPassword = 'adminCod3r123';

    // if (email === adminEmail && password === adminPassword) {
    //     // Si las credenciales corresponden al usuario administrador, crea la sesión
    //     req.session.usuario = {
    //         nombre: 'Admin',
    //         email: adminEmail,
    //         rol: 'admin'
    //     };
    //     return res.redirect(`/realtimeproducts?mensajeBienvenida=Bienvenido ${req.session.usuario.nombre}, su rol es ${req.session.usuario.rol}`);
    // }

    // if (!email || !password) {
    //     return res.redirect('/login?error=Complete todos los datos')
    // }

    // let usuario = await usuariosModelo.findOne({ email })
    // if (!usuario) {
    //     return res.redirect(`/login?error=usuario incorrecto`)
    // }
    // if (!validaPassword(usuario, password)) {
    //     return res.redirect(`/login?error=password incorrecta`)
    // }

    console.log(req.user)

    req.session.usuario = {
        nombre: req.user.nombre, email: req.user.email, rol: req.user.rol
    }

    res.redirect(`/realtimeproducts?mensajeBienvenida=Bienvenido ${req.user.nombre}, su rol es ${req.user.rol}`)

})

router.get('/errorRegistro', (req, res) => {
    return res.redirect('/register?error=Error en el proceso de registro')
})

router.post('/register', passport.authenticate('registro', { failureRedirect: '/api/sessions/errorRegistro' }), async (req, res) => {

    let { email } = req.body

    // let { nombre, email, password } = req.body
    // if (!nombre || !email || !password) {
    //     return res.redirect('/register?error=Complete todos los datos')
    // }

    // let existe = await usuariosModelo.findOne({ email })
    // if (existe) {
    //     return res.redirect(`/register?error=El usuario con email ${email} ya existe`)
    // }

    // password=creaHash(password)

    // let usuario
    // try {
    //     usuario = await usuariosModelo.create({ nombre, email, password })
    //     res.redirect(`/login?mensaje=Usuario ${email}registrado correctamente`)
    // } catch (error) {
    //     res.redirect(`/register?error=Error inesperado. Reintente en unos minutos`)
    // }

    res.redirect(`/login?mensaje=Usuario ${email}registrado correctamente`)
})

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            return res.redirect('/?error=Error al cerrar sesión')
        }
        res.redirect('/login')
    })
})