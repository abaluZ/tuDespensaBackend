import express from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { getCalories } from "../controllers/calories.controller.js";

const router = express.Router();

router.get("/calorias", authRequired, getCalories);

export default router;
