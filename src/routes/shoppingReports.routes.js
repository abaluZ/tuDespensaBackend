import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import {
  getMostBoughtProducts,
  generateHistoryReport,
} from "../controllers/shoppingReports.controller.js";

const router = Router();

// Ruta para obtener los productos más comprados
router.get("/most-bought", authRequired, getMostBoughtProducts);

// Ruta para generar el reporte de historial
router.get("/history/report", authRequired, generateHistoryReport);

export default router;
