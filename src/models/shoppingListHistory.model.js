import mongoose from "mongoose";

const shoppingItemHistorySchema = new mongoose.Schema({
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
  comprado: {
    type: Boolean,
    default: false,
  },
});

const shoppingListHistorySchema = new mongoose.Schema({
  items: [shoppingItemHistorySchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  completada: {
    type: Boolean,
    default: false,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
  fechaCompletado: {
    type: Date,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  itemsComprados: {
    type: Number,
    default: 0,
  },
});

const ShoppingListHistory = mongoose.model(
  "ShoppingListHistory",
  shoppingListHistorySchema
);
export default ShoppingListHistory;
