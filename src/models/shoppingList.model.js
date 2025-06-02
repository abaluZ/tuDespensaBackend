// Codigo realizado por Segales
// models/shoppingList.model.js
import mongoose from "mongoose";

const shoppingItemSchema = new mongoose.Schema({
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

const shoppingListSchema = new mongoose.Schema({
  items: [shoppingItemSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const ShoppingList = mongoose.model("ShoppingList", shoppingListSchema);
export default ShoppingList;