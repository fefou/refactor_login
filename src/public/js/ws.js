
console.log('hola, ws.js script!')
const socket = io()



// socket on de json de productos
socket.on("productos", productos=> {
    console.log(productos)
//    let ulProductos=document.querySelector('ul')
//    let liNuevoProducto=document.createElement('li')
//    liNuevoProducto.innerHTML=productos
//    ulProductos.append(liNuevoProducto)
document.location.href='/realtimeproducts'
   
})


