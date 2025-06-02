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

//Segales -- Aplicacion
import goalRoutes from "./routes/goal.routes.js";
import informationRoutes from "./routes/information.routes.js";
import profileRoutes from './routes/profile.routes.js';
import shoppingListRoutes from "./routes/shoppingList.routes.js";
//Veizan --Calorias Aplicación
import caloriesRoutes from "./routes/calories.routes.js";


//Cameo -- Web
import userRoutes from "./routes/users.routes.js";



const app = express();

//Cameo -- Web
console.log("frontend URL:", process.env.IP_LOCAL_FRONTEND);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    // juntando los codigos de ambos
    // origin: process.env.IP_LOCAL_FRONTEND, -- cameo mejor si solo eso usa este, mejor practica
    // origin: "http://localhost:5173", -- segales
    origin: process.env.IP_LOCAL_FRONTEND || "http://localhost:5173",
    // origin: "https://frontend-production-29e6.up.railway.app",
    credentials: true,
  })
);



app.use("/api", authRoutes);

app.use("/api", tasksRoutes); //prueba de validar token y que este logeado el usuario para entrar ahi

// Segales -- Aplicacion
app.use("/api", goalRoutes);

app.use("/api", informationRoutes);

app.use('/api/profile', profileRoutes);

app.use('/api', shoppingListRoutes);

app.use('/api', shoppingListRoutes);

// ⬇️ Aquí agregamos la carpeta imgsUsr como carpeta estática
app.use('/imgsUsr', express.static(path.join(__dirname, 'imgsUsr')));

//Cameo -- Web
app.use("/api", caloriesRoutes);

export default app;
