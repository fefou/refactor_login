import mongoose from "mongoose";

const usuariosEsquema = new mongoose.Schema(
    {
        nombre: String,
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: String,
        rol: {
            type: String,
            default: 'user'
        }

    },
    {
        timestamps: {
            updateAt: "FechaUltMod", createdAt: "FechaAlta"
        }
    }
)

export const usuariosModelo = mongoose.model("usuarios", usuariosEsquema)