import { Router } from "express";
import {
  generateShoppingHistoryReport,
  completeShoppingList,
} from "../controllers/shoppingHistoryController.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.get("/report", authRequired, generateShoppingHistoryReport);
router.post("/complete/:listId", authRequired, completeShoppingList);

export default router;
