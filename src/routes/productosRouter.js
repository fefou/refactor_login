// const { Router } = require('express')
// const routerP = Router()
// const productosJSON = require('../json/productos.json')
// const fs = require('fs')
// const path = require('path')
// let ruta = path.join(__dirname, '..', 'json', 'productos.json')

// ahora en vez de importar con const importamos con import
import { Router } from 'express'
import productosJSON from '../json/productos.json' assert { type: "json" }
import fs from 'fs'
import path from 'path'
import __dirname from '../utils.js'
import { serverSockets } from '../app.js'
import { productsModelo } from '../dao/models/products.model.js'
import mongoose from 'mongoose'

const routerP = Router()
let ruta = path.join(__dirname, 'json', 'productos.json')



function saveProducts(productos) {
    fs.writeFileSync(ruta, JSON.stringify(productos, null, 5))
}



routerP.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    try {
        const totalProducts = await productsModelo.countDocuments({deleted:false});
        const totalPages = Math.ceil(totalProducts / limit);
        const products = await productsModelo.find({deleted:false}).skip(skip).limit(limit);

        const response = {
            status: 'success',
            payload: products,
            totalPages: totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            page: page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/products?page=${page - 1}&limit=${limit}` : null,
            nextLink: page < totalPages ? `/products?page=${page + 1}&limit=${limit}` : null
        };

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(response);
    } catch (error) {
        console.log(error.message);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json({ status: 'error', payload: error.message });
    }
});

routerP.get('/:id',async (req, res) => {

    let {id} = req.params
    if(!mongoose.isValidObjectId(id)){
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Indique un id válido` });
    }
    
    let existe
    try {
        existe = await productsModelo.findOne({deleted:false, _id:id})
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Error al buscar producto`, message: error.message });
    }

    if (!existe) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `No existe producto con id ${id}` });
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ usuario:existe });
})


// POST

routerP.post('/', async(req, res) => {
    let { title, description, price, code, stock, category } = req.body;
    let thumbnails = req.body.thumbnails || [];
    let status = req.body.status !== undefined ? req.body.status : true;

    if (!title || !price || !code || !stock || !category) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `title, price, code, stock y category son datos obligatorios.` });
    }

    let existe=false
    try {        
        existe = await productsModelo.findOne({deleted:false, title, code});
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Error al buscar producto`, message: error.message });
    }

    if (existe) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `El titulo ${title} o codigo ${code} ya existe en BD` });
    }
    
    try {
    let productos = await productsModelo.create({title, description, price, code, stock, category});
           
        let nuevoProducto = {
            title, description, price, code, stock, status, thumbnails
        };
    
        serverSockets.emit("productos", productos)
        res.setHeader('Content-Type', 'application/json');
        return res.status(201).json({payload:nuevoProducto });
        
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Error al crear producto`, message: error.message });
    }
});


// UPDATE

routerP.put('/:id',async (req, res) => {

    let {id} = req.params
    if(!mongoose.isValidObjectId(id)){
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Indique un id válido` });
    }
    
    let existe
    try {
        existe = await productsModelo.findOne({deleted:false, _id:id})
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Error al buscar producto`, message: error.message });
    }

    if (!existe) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `No existe producto con id ${id}` });
    }

    if(req.body._id){
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `No se puede modificar el id` });
    }

    let resultado
    try {
        resultado=await productsModelo.updateOne({deleted:false, _id:id},req.body)
        console.log(resultado)

        if (resultado.modifiedCount>0){
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ payload:"modificación realizada" });

        }else{
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ message:"No se modificó ningún producto" });
        }

    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Error inesperado`, message: error.message });
    }

});


// DELETE 

routerP.delete('/:id',async (req, res) => {

    let { id } = req.params

    if(!mongoose.isValidObjectId(id)){
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `Indique un id válido` });
    }
    
    let existe
    try {
        existe = await productsModelo.findOne({deleted:false, _id:id})
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Error al buscar producto`, message: error.message });
    }

    if (!existe) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).json({ error: `No existe producto con id ${id}` });
    }

    let resultado
    try {
        resultado=await productsModelo.updateOne({deleted:false, _id:id},{$set:{deleted:true}})
        console.log(resultado)

        if (resultado.modifiedCount>0){
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ payload:"Producto Eliminado" });

        }else{
            res.setHeader('Content-Type', 'application/json');
            return res.status(200).json({ message:"No se eliminó ningún producto" });
        }

    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({ error: `Error inesperado`, message: error.message });
    }


});


export default routerP