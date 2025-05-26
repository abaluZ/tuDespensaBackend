// Codigo realizado por Cameo 
// Codigo modificado por Segales
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from "../config.js";

export const authRequired = (req, res, next) => {
  // Intenta obtener el token desde el header o desde cookies
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
};
