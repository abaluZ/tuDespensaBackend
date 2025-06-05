import PDFDocument from "pdfkit";
import fs from "fs";
import { calcularCalorias } from "./calculateCalories.js";

const colors = {
  primary: '#2C3E50',    // Azul oscuro
  secondary: '#27AE60',  // Verde
  accent: '#E74C3C',     // Rojo
  text: '#2C3E50',       // Azul oscuro para texto
  lightText: '#7F8C8D',  // Gris para texto secundario
  background: '#ECF0F1'  // Gris muy claro para fondos
};

const drawHeader = (doc, text) => {
  doc.fillColor(colors.primary)
     .fontSize(25)
     .font('Helvetica-Bold')
     .text(text, { align: 'center' });
  
  // Línea decorativa
  const y = doc.y + 10;
  doc.moveTo(50, y)
     .lineTo(doc.page.width - 50, y)
     .strokeColor(colors.secondary)
     .lineWidth(2)
     .stroke();
};

const drawSection = (doc, title) => {
  doc.moveDown(1);
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(colors.primary)
     .text(title, { underline: true });
};

const drawInfoBox = (doc, data) => {
  const boxWidth = doc.page.width - 100;
  const boxHeight = 60;
  const startX = 50;
  const startY = doc.y + 5;

  // Dibujar el fondo
  doc.roundedRect(startX, startY, boxWidth, boxHeight, 5)
     .fillColor(colors.background)
     .fill();

  // Dibujar el contenido
  doc.fillColor(colors.text)
     .fontSize(12)
     .text(data.label, startX + 15, startY + 10)
     .fontSize(18)
     .font('Helvetica-Bold')
     .text(data.value, startX + 15, startY + 30);

  doc.moveDown(2);
};

const drawProgressBar = (doc, title, value, unit, percentage = null) => {
  const barWidth = doc.page.width - 100;
  const barHeight = 25;
  const startX = 50;
  const startY = doc.y;

  // Barra de fondo
  doc.roundedRect(startX, startY, barWidth, barHeight, 5)
     .fillColor(colors.background)
     .fill();

  // Barra de progreso si hay porcentaje
  if (percentage !== null) {
    const progressWidth = (barWidth * percentage) / 100;
    doc.roundedRect(startX, startY, progressWidth, barHeight, 5)
       .fillColor(colors.secondary)
       .fill();
  }

  // Texto
  doc.fillColor(colors.text)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text(
       percentage !== null 
         ? `${title}: ${Math.round(value)}${unit} (${Math.round(percentage)}%)`
         : `${title}: ${Math.round(value)}${unit}`,
       startX + 10,
       startY + 7
     );

  doc.moveDown(1);
};

/**
 * Generates a PDF report with user information
 * @param {Object} userData - User data object containing personal information
 * @param {string} outputPath - Path where the PDF will be saved
 * @returns {Promise} Promise that resolves when PDF is generated
 */
const generateUserReport = (userData, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Título principal
      drawHeader(doc, "Informe de Usuario");
      doc.moveDown(1);

      // Calcular calorías y macronutrientes
      const datosCalculo = {
        edad: userData.calculatedAge || 0,
        peso: Number(userData.weight),
        estatura: Number(userData.height) * 100,
        genero: userData.gender,
        objetivo: userData.goal
      };

      const resultadoCalorias = calcularCalorias(datosCalculo);

      // Información Personal
      drawSection(doc, "Información Personal");
      doc.moveDown(0.5);

      // Grid de información personal
      const infoGrid = [
        [
          { label: "Nombre", value: userData.fullName },
          { label: "Usuario", value: userData.username }
        ],
        [
          { label: "Género", value: userData.gender },
          { label: "Edad", value: `${userData.calculatedAge} años` }
        ],
        [
          { label: "Estatura", value: `${userData.height} m` },
          { label: "Peso", value: `${userData.weight} kg` }
        ]
      ];

      infoGrid.forEach(row => {
        const cellWidth = (doc.page.width - 120) / 2;
        let xPos = 50;

        row.forEach(cell => {
          doc.font('Helvetica-Bold')
             .fontSize(12)
             .fillColor(colors.primary)
             .text(cell.label, xPos, doc.y)
             .font('Helvetica')
             .fontSize(14)
             .fillColor(colors.text)
             .text(cell.value, xPos, doc.y);
          
          xPos += cellWidth + 20;
        });
        
        doc.moveDown(1);
      });

      // Objetivo y Plan Nutricional
      doc.moveDown(1);
      drawSection(doc, "Objetivo y Plan Nutricional");
      doc.moveDown(0.5);

      if (resultadoCalorias && resultadoCalorias.caloriasDiarias) {
        drawInfoBox(doc, {
          label: "Objetivo",
          value: userData.goal ? userData.goal.toUpperCase() : 'NO ESPECIFICADO'
        });

        drawInfoBox(doc, {
          label: "Tipo de Dieta",
          value: userData.type_diet ? userData.type_diet.toUpperCase() : 'NO ESPECIFICADO'
        });

        drawInfoBox(doc, {
          label: "Calorías Diarias Recomendadas",
          value: `${Math.round(resultadoCalorias.caloriasDiarias)} kcal`
        });

        // Macronutrientes
        if (resultadoCalorias.macronutrientes) {
          drawSection(doc, "Distribución de Macronutrientes");
          doc.moveDown(0.5);

          const totalMacros = 
            resultadoCalorias.macronutrientes.proteinas +
            resultadoCalorias.macronutrientes.carbohidratos +
            resultadoCalorias.macronutrientes.grasas;

          ['proteinas', 'carbohidratos', 'grasas'].forEach(macro => {
            const valor = resultadoCalorias.macronutrientes[macro];
            const porcentaje = (valor / totalMacros) * 100;
            drawProgressBar(
              doc,
              macro.charAt(0).toUpperCase() + macro.slice(1),
              valor,
              'g',
              porcentaje
            );
          });
        }

        // Distribución de calorías
        if (resultadoCalorias.distribucionCalorica) {
          doc.moveDown(0.5);
          drawSection(doc, "Distribución de Calorías por Comida");
          doc.moveDown(0.5);

          Object.entries(resultadoCalorias.distribucionCalorica).forEach(([comida, calorias]) => {
            const porcentaje = (calorias / resultadoCalorias.caloriasDiarias) * 100;
            const comidaCapitalizada = comida.charAt(0).toUpperCase() + comida.slice(1);
            drawProgressBar(doc, comidaCapitalizada, calorias, 'kcal', porcentaje);
          });
        }
      }

      // Asegurarnos de que estamos en la última página
      while (doc.y < doc.page.height - 100) {
        doc.y = doc.page.height - 100;
      }

      // Pie de página simple
      doc.fontSize(10)
         .fillColor(colors.lightText)
         .text(
           `Informe generado el: ${new Date().toLocaleDateString("es-ES")}`,
           {
             width: doc.page.width - 100,
             align: 'center',
             lineBreak: false
           }
         );

      doc.end();

      stream.on("finish", () => resolve(outputPath));
      stream.on("error", (error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};

export { generateUserReport };
