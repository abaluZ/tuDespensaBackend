import informationModel from "../models/information.model.js";
import goalModel from "../models/goal.model.js";
import { calcularCalorias } from "../utils/calculateCalories.js";

export const getCalories = async (req, res) => {
  const userId = req.user.userId;

  try {
    const info = await informationModel.findOne({ user: userId });
    const goal = await goalModel.findOne({ user: userId });

    if (!info || !goal) {
      return res.status(404).json({ message: "Falta información o el objetivo del usuario." });
    }

    const calorias = calcularCalorias({
      edad: info.Edad,
      peso: info.Peso,
      estatura: info.Estatura,
      genero: info.Genero,
      objetivo: goal.goal.toLowerCase()
    });

    res.status(200).json({ caloriasRecomendadas: calorias });

  } catch (error) {
    console.error("Error al calcular las calorías:", error);
    res.status(500).json({ message: "Error interno al calcular las calorías", error });
  }
};
