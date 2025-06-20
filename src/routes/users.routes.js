// src/routes/user.routes.js o en auth.routes.js

import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import { User } from "../models/user.model.js";
import { getUserProfileApp, upgradeToPremium, downgradeToFree } from "../controllers/user.controller.js";

const router = Router();

// Ruta para la web
router.get("/users/profile", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil" });
  }
});

// Ruta para la app móvil
router.get("/profileApp", authRequired, getUserProfileApp);

// Ruta para actualizar el plan del usuario a Premium
router.put("/users/upgrade-plan", authRequired, upgradeToPremium);

// Ruta para cancelar suscripción y volver a gratuito
router.put("/users/downgrade-plan", authRequired, downgradeToFree);

export default router;
