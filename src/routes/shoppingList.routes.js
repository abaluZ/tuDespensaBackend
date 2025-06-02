// Codigo realizado por Segales
// routes/shoppingList.routes.js
import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { createOrUpdateShoppingList, getShoppingList } from "../controllers/shoppingList.controller.js";

const router = Router();

router.post('/shopping-list', authRequired, createOrUpdateShoppingList);
router.get('/shopping-list', authRequired, getShoppingList);

export default router;