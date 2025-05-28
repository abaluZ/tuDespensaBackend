import express from "express";
import { getCalories } from "../controllers/calories.controller.js";
import { verifyToken } from "../middlewares/authJwt.js"; // si usas JWT

const router = express.Router();

router.get("/calorias", verifyToken, getCalories);

export default router;
