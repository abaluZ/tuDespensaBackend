// Codigo realizado por Cameo
import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, verificationCode) => {
    console.log("Iniciando envío de correo a:", email);
    console.log("Configuración de correo:", {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? "Configurada" : "No configurada"
    });

    try {
        // Configurar el transporte SMTP
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        console.log("Transporter configurado");

        // Configurar el contenido del correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verificación de cuenta - TuDespensa",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50; text-align: center;">Verificación de cuenta - TuDespensa</h2>
                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 5px;">
                        <p style="font-size: 16px;">Tu código de verificación es:</p>
                        <h1 style="color: #2196F3; text-align: center; font-size: 32px; letter-spacing: 5px;">${verificationCode}</h1>
                        <p style="font-size: 14px; color: #666;">Este código expirará en 10 minutos.</p>
                        <p style="font-size: 14px; color: #666;">Por favor, ingrésalo en la aplicación para completar tu registro.</p>
                    </div>
                    <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                        Este es un correo automático, por favor no responder.
                    </p>
                </div>
            `,
        };

        console.log("Opciones de correo configuradas");

        // Enviar el correo
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente a:", email);
    } catch (error) {
        console.error("Error detallado al enviar el correo:", error);
        if (error.code === 'EAUTH') {
            console.error("Error de autenticación. Verifica las credenciales de correo.");
        }
        throw new Error("No se pudo enviar el correo de verificación: " + error.message);
    }
};

// Para el futuro se debe mejorar el correo que se envia y hacer uno parecido al de TFT, lo podemos
// tomar de ejemplo