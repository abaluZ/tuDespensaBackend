// Codigo realizado por el equipo
import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { getRecipeRecommendations } from "../controllers/recipe.controller.js";
import { getRecipeHistory } from "../controllers/recipeHistory.controller.js";

const router = Router();

// Ruta para obtener recomendaciones de recetas
router.get("/recipes/recommendations", authRequired, getRecipeRecommendations);

// Ruta para obtener el historial de recetas IA
router.get("/recipes/history", authRequired, getRecipeHistory);

export default router; 