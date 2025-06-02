// models/despensa.model.js
import mongoose from "mongoose";

const despensaItemSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  categoria: {
    type: String,
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
  },
  unidad: {
    type: String,
    required: true,
  },
});

const despensaSchema = new mongoose.Schema({
  items: [despensaItemSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Despensa = mongoose.model("Despensa", despensaSchema);
export default Despensa;