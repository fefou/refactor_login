import fs from 'fs'

class ProductManager {

    constructor(rutaArchivo) {
        // this.productos = []
        this.path=rutaArchivo
    }

    getProducts() {
        if (fs.existsSync(this.path)) {
            return JSON.parse(fs.readFileSync(this.path, "utf-8"))
        } else {
            return []
        }
    }

    getProductById(id) {
        let productos = this.getProducts();

        let index = productos.findIndex((producto) =>{
            return producto.id === id
        })

        if (index === -1){
            console.log(`no existe el producto con id ${id}`)
            return
        }
        return productos[index]
    }


    addProduct(title, description, price, thumbnail, code, stock) {
        let productos = this.getProducts()

        let id = 1
        if (productos.length > 0) {
            id = productos[productos.length - 1].id + 1
        }

        let existe = productos.find(u => u.code === code)
        if (existe) {
            console.log(` El código ${code} ya existe.`)
            return
        }
        productos.push({
            id, title, description, price, thumbnail, code, stock
        })

        fs.writeFileSync(this.path, JSON.stringify(productos, null, 5))

    }

    deleteProduct(id){
        let productos= this.getProducts()
        let indice=productos.findIndex(p=>p.id ===id)
        if (indice === -1){
            console.log(`El producto con id ${id} no existe en la base de datos`)
            return
        }

        productos.splice(indice, 1)

        fs.writeFileSync(this.path, JSON.stringify(productos, null, 5))
    }

    updateProduct(id, objeto){
        let productos= this.getProducts()
        let indice=productos.findIndex(p=>p.id ===id)
        if (indice === -1){
            console.log(`El producto con id ${id} no existe en la base de datos`)
            return
        }

        productos[indice]={
            ...productos[indice],
            ...objeto,
            id
        }


        fs.writeFileSync(this.path, JSON.stringify(productos, null, 5))
    }

    
    

}

const pm=new ProductManager('./src/json/productos.json')

export default pm