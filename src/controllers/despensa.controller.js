// controllers/despensa.controller.js
import Despensa from "../models/despensa.model.js";

export const createOrUpdateDespensaList = async (req, res) => {
  const userId = req.user.userId;
  const { items } = req.body;
  try {
    let despensa = await Despensa.findOne({ user: userId });
    if (!despensa) {
      despensa = new Despensa({ user: userId, items });
    } else {
      despensa.items = items;
    }
    const savedList = await despensa.save();
    res.status(200).json({ message: "Lista de despensa guardada/actualizada", data: savedList });
  } catch (error) {
    res.status(500).json({ message: "Error al guardar/actualizar la lista de despensa", details: error });
  }
};

export const getDespensaList = async (req, res) => {
  const userId = req.user.userId;
  try {
    const despensa = await Despensa.findOne({ user: userId });
    if (!despensa) return res.status(404).json({ message: 'Lista de despensa no encontrada' });
    res.json(despensa);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la lista de despensa', error });
  }
};