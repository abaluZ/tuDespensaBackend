import PDFDocument from "pdfkit";

const generateShoppingReport = async (reportData, res) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear un nuevo documento PDF
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      // Configurar headers para la descarga del PDF
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=reporte-compras-${Date.now()}.pdf`
      );

      // Pipe el PDF directamente a la respuesta
      doc.pipe(res);

      // Colores
      const colors = {
        primary: '#34495e',    // Azul oscuro
        secondary: '#2ecc71',  // Verde
        accent: '#e74c3c',     // Rojo
        text: '#2c3e50',       // Gris oscuro
        lightText: '#7f8c8d'   // Gris claro
      };

      // Título con diseño mejorado
      doc
        .fontSize(30)
        .font("Helvetica-Bold")
        .fillColor(colors.primary)
        .text("Reporte de Compras", { align: "center" });
      
      // Línea decorativa
      const pageWidth = doc.page.width - 100;
      doc.moveTo(50, doc.y + 10)
         .lineTo(doc.page.width - 50, doc.y + 10)
         .lineWidth(2)
         .strokeColor(colors.secondary)
         .stroke();
      
      doc.moveDown(2);

      // Información del período con mejor formato
      doc.fontSize(16)
         .font("Helvetica-Bold")
         .fillColor(colors.primary)
         .text("Período Analizado", { align: "center" });
      
      doc.moveDown(0.5);
      
      const inicio = new Date(reportData.estadisticas.periodoAnalisis.inicio);
      const fin = new Date(reportData.estadisticas.periodoAnalisis.fin);
      
      doc.fontSize(12)
         .font("Helvetica")
         .fillColor(colors.text)
         .text(`Del ${inicio.toLocaleDateString()} al ${fin.toLocaleDateString()}`, { align: "center" });
      
      doc.moveDown(2);

      // Estadísticas generales en un cuadro
      doc.rect(50, doc.y, pageWidth, 60)
         .fillColor('#f9f9f9')
         .fill();
      
      const startY = doc.y;
      
      // Primera columna
      doc.fontSize(14)
         .font("Helvetica-Bold")
         .fillColor(colors.primary)
         .text("Total de Listas", 70, startY + 15);
      
      doc.fontSize(20)
         .text(reportData.estadisticas.totalListas, 70, startY + 35);
      
      // Segunda columna
      doc.fontSize(14)
         .text("Productos Únicos", doc.page.width - 220, startY + 15);
      
      doc.fontSize(20)
         .text(reportData.estadisticas.totalProductosUnicos, doc.page.width - 220, startY + 35);

      doc.moveDown(4);

      // Productos más comprados
      if (reportData.productos && reportData.productos.length > 0) {
        doc.fontSize(18)
           .font("Helvetica-Bold")
           .fillColor(colors.primary)
           .text("Productos Más Comprados", { align: "center" });
        
        doc.moveDown();

        // Gráfico de barras mejorado
        const maxBarWidth = pageWidth - 100;
        const barHeight = 30;
        const barSpacing = 45;
        const maxCompras = Math.max(...reportData.productos.map(p => p.vecesComprado));
        
        reportData.productos.forEach((producto, index) => {
          const y = doc.y;
          const barWidth = (producto.vecesComprado / maxCompras) * maxBarWidth;
          
          // Barra de fondo
          doc.rect(100, y, maxBarWidth, barHeight)
             .fillColor('#f0f0f0')
             .fill();
          
          // Barra de progreso
          doc.rect(100, y, barWidth, barHeight)
             .fillColor(colors.secondary)
             .fill();
          
          // Nombre del producto y cantidad
          doc.fontSize(12)
             .font("Helvetica-Bold")
             .fillColor(colors.text)
             .text(producto.nombre, 100, y - 15);
          
          // Información adicional
          doc.fontSize(10)
             .font("Helvetica")
             .fillColor(colors.lightText)
             .text(`${producto.cantidadTotal || 0} ${producto.unidades[0] || 'unidades'} • ${producto.categorias[0] || 'Sin categoría'}`,
                   100 + barWidth + 10, y + (barHeight/2) - 5);
          
          doc.moveDown(2);
        });
      } else {
        doc.fontSize(14)
           .font("Helvetica")
           .fillColor(colors.accent)
           .text("No se encontraron productos para el período seleccionado", {
             align: "center"
           });
      }

      // Pie de página
      doc.moveDown(2);
      
      // Línea decorativa final
      doc.moveTo(50, doc.page.height - 50)
         .lineTo(doc.page.width - 50, doc.page.height - 50)
         .lineWidth(1)
         .strokeColor(colors.secondary)
         .stroke();
      
      doc.fontSize(10)
         .font("Helvetica")
         .fillColor(colors.lightText)
         .text(`Reporte generado el ${new Date().toLocaleDateString()}`, {
           align: "center"
         });

      // Finalizar el PDF
      doc.end();

      // Manejar eventos del stream
      doc.on("end", () => {
        resolve();
      });

      doc.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

export { generateShoppingReport };
