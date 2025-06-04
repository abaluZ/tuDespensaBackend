// Codigo realizado por el equipo
import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { getRecipeRecommendations } from "../controllers/recipe.controller.js";

const router = Router();

// Ruta para obtener recomendaciones de recetas
router.get("/recipes/recommendations", authRequired, getRecipeRecommendations);

export default router; 