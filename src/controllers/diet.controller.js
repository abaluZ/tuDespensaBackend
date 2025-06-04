// Codigo realizado por el equipo
import Diet from "../models/diet.model.js";

// Crear y guardar la información de la dieta del usuario
export const createDiet = async (req, res) => {
    const { type_diet } = req.body;
    console.log("Tipo de dieta recibido:", type_diet);
    console.log("Usuario logueado:", req.user);

    const userId = req.user.userId;

    try {
        // Verificar si el usuario ya tiene una dieta registrada
        const existingDiet = await Diet.findOne({ user: userId });
        if (existingDiet) {
            // Actualizar la dieta existente
            existingDiet.type_diet = type_diet;
            const updatedDiet = await existingDiet.save();
            return res.status(200).json({ 
                message: "Tipo de dieta actualizado exitosamente", 
                data: updatedDiet 
            });
        }

        // Crear nueva dieta si no existe
        const newDiet = new Diet({
            type_diet,
            user: userId,
        });

        const savedDiet = await newDiet.save();
        console.log("Tipo de dieta guardado:", savedDiet);

        res.status(201).json({ 
            message: "Tipo de dieta guardado exitosamente", 
            data: savedDiet 
        });
    } catch (error) {
        console.error("Error al guardar el tipo de dieta:", error);
        res.status(500).json({ 
            message: "Error al guardar el tipo de dieta", 
            error 
        });
    }
};

// Obtener la dieta del usuario
export const getDiet = async (req, res) => {
    const userId = req.user.userId;

    try {
        const diet = await Diet.findOne({ user: userId });
        if (!diet) {
            return res.status(404).json({ 
                message: "No se encontró información de dieta para este usuario" 
            });
        }

        res.json(diet);
    } catch (error) {
        console.error("Error al obtener el tipo de dieta:", error);
        res.status(500).json({ 
            message: "Error al obtener el tipo de dieta", 
            error 
        });
    }
}; 