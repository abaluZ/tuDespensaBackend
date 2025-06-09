import mongoose from "mongoose";

const recipeHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tipo_comida: {
    type: String,
    enum: ['desayuno', 'almuerzo', 'cena', 'postre'],
    required: true,
  },
  recetas: [
    {
      nombre: String,
      ingredientes: [mongoose.Schema.Types.Mixed],
      ingredientes_disponibles: [mongoose.Schema.Types.Mixed],
      ingredientes_a_comprar: [mongoose.Schema.Types.Mixed],
      preparacion: [String],
      tiempo_preparacion: String,
      informacion_nutricional: mongoose.Schema.Types.Mixed,
      beneficios: [String],
      fecha_generada: { type: Date, default: Date.now },
    }
  ],
  fecha: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export default mongoose.model("RecipeHistory", recipeHistorySchema); 