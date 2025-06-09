import RecipeHistory from "../models/recipeHistory.model.js";

// Obtener el historial de recetas IA agrupado por tipo de comida (máximo 8 por tipo)
export const getRecipeHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const tipos = ['desayuno', 'almuerzo', 'cena', 'postre'];
    const historial = {};
    for (const tipo of tipos) {
      const doc = await RecipeHistory.findOne({ user: userId, tipo_comida: tipo });
      historial[tipo] = doc ? doc.recetas.slice(0, 8) : [];
    }
    res.json({ historial });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial de recetas', error: error.message });
  }
}; 