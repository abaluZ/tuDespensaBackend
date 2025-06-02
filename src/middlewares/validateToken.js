// Codigo realizado por Cameo 
// Codigo modificado por Segales
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from "../config.js";

export const authRequired = (req, res, next) => {
  // Obtener el token del header Authorization o de las cookies
  const authHeader = req.headers['authorization'];
  const token = authHeader ? authHeader.split(' ')[1] : req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token, autorización denegada" });
  }

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};
