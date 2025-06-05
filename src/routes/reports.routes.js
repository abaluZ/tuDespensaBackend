import express from "express";
import { generateUserReport } from "../utils/pdfGenerator.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { authRequired } from "../middlewares/validateToken.js";
import { User } from "../models/user.model.js";
import { information } from "../models/information.model.js";
import userGoal from "../models/goal.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * @route GET /api/reports/user-report
 * @description Generate and download a PDF report for the authenticated user
 * @access Private
 */
const generateReport = async (req, res) => {
  try {
    // Get user data from the authenticated request
    const userId = req.user.userId;

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, "../..", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `user-report-${userId}-${Date.now()}.pdf`;
    const outputPath = path.join(reportsDir, filename);

    // Get user data using Mongoose models
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const userInfo = await information.findOne({ user: userId });
    const userGoalInfo = await userGoal.findOne({ user: userId });

    if (!userInfo) {
      return res
        .status(404)
        .json({ message: "Información del usuario no encontrada" });
    }

    // Calcular la edad a partir de la fecha de nacimiento
    const fechaNacimiento = new Date(userInfo.Edad);
    const hoy = new Date();
    const calculatedAge = hoy.getFullYear() - fechaNacimiento.getFullYear();

    // Normalizar el objetivo
    let objetivoNormalizado = userGoalInfo ? userGoalInfo.goal.toLowerCase() : "mantener";
    if (objetivoNormalizado === "bajar de peso") objetivoNormalizado = "bajar";
    if (objetivoNormalizado === "subir de peso") objetivoNormalizado = "subir";
    if (objetivoNormalizado === "mantener peso") objetivoNormalizado = "mantener";

    // Prepare data for PDF generation
    const userData = {
      username: user.username,
      email: user.email,
      fullName: `${userInfo.Nombre} ${userInfo.Apellidos}`,
      gender: userInfo.Genero,
      height: userInfo.Estatura,
      weight: userInfo.Peso,
      calculatedAge: calculatedAge,
      goal: objetivoNormalizado
    };

    // Generate PDF
    await generateUserReport(userData, outputPath);

    // Send file to client
    res.download(outputPath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        return res
          .status(500)
          .json({ message: "Error al descargar el archivo" });
      }

      // Delete file after sending
      fs.unlink(outputPath, (unlinkErr) => {
        if (unlinkErr)
          console.error("Error deleting temporary file:", unlinkErr);
      });
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Error generando el informe" });
  }
};

// Ruta original
router.get("/user-report", authRequired, generateReport);

// Alias para mantener compatibilidad
router.get("/generate", authRequired, generateReport);

export default router;
