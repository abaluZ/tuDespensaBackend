// Codigo realizado por Cameo
import jwt from "jsonwebtoken";
import {TOKEN_SECRET} from "../config.js"

export function createAccessToken(payload) {
    return new Promise((resolve, reject) => {
        // Asegurarse de que el payload tenga el id en el formato correcto
        const tokenPayload = {
            id: payload.id || payload.userId,
        };

        jwt.sign(
            tokenPayload,
            TOKEN_SECRET,
            {
                expiresIn: "1d",
            },
            (err, token) => {
                if (err) reject(err);
                resolve(token);
            }
        );
    });
}
