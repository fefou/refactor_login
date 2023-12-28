import mongoose from "mongoose";
const messagesEsquema = new mongoose.Schema({

    user: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      }
    });

export const messagesModelo = mongoose.model("messages", messagesEsquema)