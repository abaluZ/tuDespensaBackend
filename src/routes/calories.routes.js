import express from "express";
import { getCalories } from "../controllers/calories.controller.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = express.Router();

router.get("/calorias", authRequired, getCalories);

export default router;