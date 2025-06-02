import express from "express";
import { generateUserReport } from "../utils/pdfGenerator.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { authRequired } from "../middlewares/validateToken.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

/**
 * @route GET /api/reports/user-report
 * @description Generate and download a PDF report for the authenticated user
 * @access Private
 */
router.get("/user-report", authRequired, async (req, res) => {
  try {
    // Get user data from the authenticated request
    const user = req.user.id;

    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, "../..", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Generate unique filename
    const filename = `user-report-${user}-${Date.now()}.pdf`;
    const outputPath = path.join(reportsDir, filename);

    // Get user data from database
    // Asumiendo que tienes un modelo de Usuario, ajusta según tu implementación
    const userData = await req.app
      .get("db")
      .collection("users")
      .findOne({ _id: user });

    if (!userData) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

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
});

export default router;
