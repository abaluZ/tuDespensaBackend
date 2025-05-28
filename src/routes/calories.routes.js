import express from "express";
import { getCalories } from "../controllers/calories.controller.js";

const router = express.Router();

router.get("/calorias", verifyToken, getCalories);

export default router;
