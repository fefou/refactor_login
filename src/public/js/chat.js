console.log('cargo chat js')
const socket = io()
let inputMensaje = document.getElementById('mensaje')
let divMensajes = document.getElementById('mensajes')


Swal.fire({
    title: "Identifiquese",
    input: "text",
    text: "ingrese su email",
    inputValidator: (value) => {
        return !value && 'debe ingresar un email'
    },
    allowOutsideClick: false,
    allowEscapeKey: false,

}).then(resultado => {
    console.log(resultado)
    socket.emit('id', resultado.value)
    inputMensaje.focus()
    document.title = resultado.value
    socket.on('nuevoUsuario', email => {
        // POPUP  CON AVISO
        Swal.fire({
            text: `Se ha conectado ${email}`,
            toast: true,
            position: 'top-right'
        })
    })

    socket.on('Hola', mensajes => {
        mensajes.forEach(mensaje=>{
            let parrafo = document.createElement('p')
        parrafo.innerHTML = `<strong>${mensajes.emisor}</strong> dice: <i>${mensaje.mensaje}</i>`
        parrafo.classList.add('mensaje')
        let br = document.createElement('br')
        divMensajes.append(parrafo, br)
        divMensajes.scrollTop = divMensajes.scrollHeight
        })

    })

    socket.on('usuarioDesconectado', email => {
        Swal.fire({
            text: `Se ha desconectado ${email}`,
            toast: true,
            position: 'top-right'
        })
    })

    socket.on('nuevoMensaje', datos => {
        let parrafo = document.createElement('p')
        parrafo.innerHTML = `<strong>${datos.emisor}</strong> dice: <i>${datos.mensaje}</i>`
        parrafo.classList.add('mensaje')
        let br = document.createElement('br')
        divMensajes.append(parrafo, br)
        divMensajes.scrollTop = divMensajes.scrollHeight

    })

    inputMensaje.addEventListener('keyup', (e) => {
        // console.log(e, e.target.value)
        if (e.key === 'Enter' && e.target.value !== '') {
            socket.emit('mensaje', { emisor: resultado.value, mensaje: e.target.value.trim() })
            e.target.value = ''
        }

    })
})
