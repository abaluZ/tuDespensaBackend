import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
// imagen para profile
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Cameo -- Web
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import tasksRoutes from "./routes/tasks.routes.js";
import userRoutes from "./routes/users.routes.js";

//Segales -- Aplicacion
import goalRoutes from "./routes/goal.routes.js";
import informationRoutes from "./routes/information.routes.js";
import profileRoutes from './routes/profile.routes.js';
import shoppingListRoutes from "./routes/shoppingList.routes.js";
import despensaRoutes from './routes/despensa.routes.js';
//Veizan --Calorias Aplicación
import caloriesRoutes from "./routes/calories.routes.js";

const app = express();

//Cameo -- Web
console.log("frontend URL:", process.env.IP_LOCAL_FRONTEND);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.IP_LOCAL_FRONTEND || "http://localhost:5173",
    credentials: true,
  })
);

// Rutas de autenticación y usuarios
app.use("/api", authRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api", userRoutes);

// Segales -- Aplicacion
app.use("/api", goalRoutes);
app.use("/api", informationRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', shoppingListRoutes);

// ⬇️ Aquí agregamos la carpeta imgsUsr como carpeta estática
app.use('/imgsUsr', express.static(path.join(__dirname, 'imgsUsr')));

//Cameo -- Web
app.use("/api", caloriesRoutes);

export default app;
