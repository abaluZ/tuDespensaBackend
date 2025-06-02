// Codigo realizado por Segales
// controllers/shoppingList.controller.js
import ShoppingList from "../models/shoppingList.model.js";

export const createOrUpdateShoppingList = async (req, res) => {
  const userId = req.user.userId;
  const { items } = req.body;

  try {
    let shoppingList = await ShoppingList.findOne({ user: userId });
    if (!shoppingList) {
      shoppingList = new ShoppingList({ user: userId, items });
    } else {
      shoppingList.items = items;
    }
    const savedList = await shoppingList.save();
    res.status(200).json({ message: "Lista de compras guardada/actualizada", data: savedList });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar/actualizar la lista de compras", details: error });
  }
};

export const getShoppingList = async (req, res) => {
  const userId = req.user.userId;

  try {
    const shoppingList = await ShoppingList.findOne({ user: userId });
    if (!shoppingList) return res.status(404).json({ message: 'Lista de compras no encontrada' });
    res.json(shoppingList);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de compras', error });
  }
};