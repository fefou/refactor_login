import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productsEsquema = new mongoose.Schema({

    title: {
        type: String,
        require: true,
        max: 100,
    },
    description: String,
    price: {
        type: Number,
        require: true,
        min: 0
    },
    thumbnail: String,
    code: {
        type: Number,
        require: true,
        min: 0,
        unique: true
    },
    stock: {
        type: Number,
        require: true,
        min: 0
    },
    category: {
        type: String,
        require: true,
        max: 100,
    },
    deleted: {
        type: Boolean,
        default: false
    }
})

productsEsquema.plugin(paginate)
export const productsModelo = mongoose.model("products", productsEsquema)