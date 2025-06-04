// Codigo realizado por el equipo
import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { createDiet, getDiet } from "../controllers/diet.controller.js";

const router = Router();

// Ruta para crear/actualizar la dieta del usuario
router.post("/diet", authRequired, createDiet);

// Ruta para obtener la dieta del usuario
router.get("/diet", authRequired, getDiet);

export default router; 