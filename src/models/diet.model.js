import mongoose from "mongoose";

const dietSchema = new mongoose.Schema({
    type_diet: {
        type: String,
        enum: ['Estandar', 'Vegetariano'],
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    // Para vincular la dieta con el usuario logueado
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }
},
{
    timestamps: true,
});

export default mongoose.model("Diet", dietSchema); 