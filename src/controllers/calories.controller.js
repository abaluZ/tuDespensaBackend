import informationModel from "../models/information.model.js";
import goalModel from "../models/goal.model.js";
import { calcularCalorias } from "../utils/calculateCalories.js";

export const getCalories = async (req, res) => {
  const userId = req.user.userId;

  try {
    const info = await informationModel.findOne({ user: userId });
    const goal = await goalModel.findOne({ user: userId });

    if (!info) {
      return res.status(404).json({ 
        message: "No se encontró la información del usuario",
        details: "Por favor, complete su información personal primero"
      });
    }

    if (!goal) {
      return res.status(404).json({ 
        message: "No se encontró el objetivo del usuario",
        details: "Por favor, establezca su objetivo primero"
      });
    }

    // Convertir fecha de nacimiento a edad
    const fechaNacimiento = new Date(info.Edad);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

    // Convertir estatura de metros a centímetros
    const estaturaCm = Number(info.Estatura) * 100;

    // Convertir objetivo a formato esperado
    let objetivoNormalizado = goal.goal.toLowerCase();
    if (objetivoNormalizado === 'bajar de peso') objetivoNormalizado = 'bajar';
    if (objetivoNormalizado === 'subir de peso') objetivoNormalizado = 'subir';
    if (objetivoNormalizado === 'mantener peso') objetivoNormalizado = 'mantener';

    const datosConvertidos = {
      edad: edad,
      peso: Number(info.Peso),
      estatura: estaturaCm,
      genero: info.Genero,
      objetivo: objetivoNormalizado
    };

    console.log("Valores convertidos para el cálculo:");
    console.log(datosConvertidos);

    const resultado = calcularCalorias(datosConvertidos);

    res.status(200).json({
      message: "Cálculo de calorías exitoso",
      data: {
        ...resultado,
        informacionUsuario: {
          edad: edad,
          peso: info.Peso,
          estatura: info.Estatura,
          genero: info.Genero,
          objetivo: goal.goal
        }
      }
    });

  } catch (error) {
    console.error("Error al calcular las calorías:", error);
    
    if (error.message && (
      error.message.includes('válido') || 
      error.message.includes('requeridos') ||
      error.message.includes('debe estar entre') ||
      error.message.includes('valores numéricos')
    )) {
      return res.status(400).json({ 
        message: "Error en los datos proporcionados",
        error: error.message
      });
    }

    res.status(500).json({ 
      message: "Error interno al calcular las calorías",
      error: "Por favor, contacte al administrador del sistema"
    });
  }
};