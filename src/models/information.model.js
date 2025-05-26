// Codigo realizado por Segales
import mongoose from "mongoose";

const informationSchema = new mongoose.Schema({
    Nombre: {
        type: String,
        required: true,
    },
    Apellidos: {
        type: String,
        required: true,
    },
    Estatura: {
        type: String,
        required: true
    },
    Peso: {
        type: String,
        required: true
    },
    Edad: {
        type: String,
        required: true,
        trim: true,
    },
    Genero: {
        type: String,
        required: true,
        trim: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },    
    //para que lo que vayamos a crear este ligado al usuario logeado, es decir la tarea va ser de dicho usuario
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
},
{
    timestamps: true,
});

export const information = mongoose.model("Information", informationSchema);
export default information;