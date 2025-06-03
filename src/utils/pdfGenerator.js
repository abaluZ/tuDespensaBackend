import PDFDocument from "pdfkit";
import fs from "fs";

/**
 * Generates a PDF report with user information
 * @param {Object} userData - User data object containing personal information
 * @param {string} outputPath - Path where the PDF will be saved
 * @returns {Promise} Promise that resolves when PDF is generated
 */
const generateUserReport = (userData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      // Pipe the PDF into a write stream
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Add title
      doc
        .fontSize(25)
        .font("Helvetica-Bold")
        .text("Informe de Usuario", { align: "center" });

      doc.moveDown(2);

      // Add user information
      doc.fontSize(14).font("Helvetica");

      const userInfo = [
        { label: "Nombre de Usuario:", value: userData.username },
        { label: "Nombre Completo:", value: userData.fullName },
        { label: "Género:", value: userData.gender },
        { label: "Estatura:", value: `${userData.height} cm` },
        { label: "Peso:", value: `${userData.weight} kg` },
        { label: "Edad:", value: `${userData.age} años` },
        { label: "Email:", value: userData.email },
      ];

      userInfo.forEach((info) => {
        if (info.value) {
          doc
            .font("Helvetica-Bold")
            .text(info.label, { continued: true })
            .font("Helvetica")
            .text(` ${info.value}`);

          doc.moveDown(0.5);
        }
      });

      // Add footer with date
      doc.moveDown(2);
      doc
        .fontSize(10)
        .text(
          `Informe generado el: ${new Date().toLocaleDateString("es-ES")}`,
          {
            align: "center",
          }
        );

      // Finalize the PDF
      doc.end();

      stream.on("finish", () => {
        resolve(outputPath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export { generateUserReport };
