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

      // Título
      doc
        .fontSize(25)
        .font("Helvetica-Bold")
        .text("Reporte de Compras", { align: "center" });
      doc.moveDown(2);

      // Información del período
      doc.fontSize(14).font("Helvetica-Bold").text("Período de Análisis");
      doc.fontSize(12).font("Helvetica");
      doc.text(`Desde: ${reportData.estadisticas.periodoAnalisis.inicio}`);
      doc.text(`Hasta: ${reportData.estadisticas.periodoAnalisis.fin}`);
      doc.moveDown();

      // Estadísticas generales
      doc.fontSize(14).font("Helvetica-Bold").text("Estadísticas Generales");
      doc.fontSize(12).font("Helvetica");
      doc.text(
        `Total de listas analizadas: ${reportData.estadisticas.totalListas}`
      );
      doc.text(
        `Total de productos únicos: ${reportData.estadisticas.totalProductosUnicos}`
      );
      doc.moveDown(2);

      // Productos más comprados
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Productos Más Comprados", { underline: true });
      doc.moveDown();

      reportData.productos.forEach((producto, index) => {
        doc
          .fontSize(14)
          .font("Helvetica-Bold")
          .text(`${index + 1}. ${producto.nombre}`);
        doc.fontSize(12).font("Helvetica");
        doc.text(`Veces comprado: ${producto.vecesComprado}`);
        doc.text(`Cantidad total: ${producto.cantidadTotal}`);
        doc.text(
          `Promedio por compra: ${producto.promedioUnidades.toFixed(2)}`
        );
        doc.text(`Categorías: ${producto.categorias.join(", ")}`);
        doc.text(`Unidades utilizadas: ${producto.unidades.join(", ")}`);
        doc.text(
          `Última compra: ${new Date(
            producto.fechasCompra[0]
          ).toLocaleDateString()}`
        );
        doc.moveDown();
      });

      // Agregar gráfico de barras simple para los productos más comprados
      const maxBarWidth = 400;
      const barHeight = 20;
      const maxCompras = Math.max(
        ...reportData.productos.map((p) => p.vecesComprado)
      );

      doc.moveDown(2);
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("Gráfico de Frecuencia de Compras");
      doc.moveDown();

      reportData.productos.forEach((producto, index) => {
        const barWidth = (producto.vecesComprado / maxCompras) * maxBarWidth;
        const yPosition = doc.y;

        // Dibujar la barra
        doc.rect(50, yPosition, barWidth, barHeight).fill("#0066cc");

        // Agregar etiqueta
        doc
          .fontSize(10)
          .font("Helvetica")
          .text(
            `${producto.nombre} (${producto.vecesComprado})`,
            460,
            yPosition + 5
          );

        doc.moveDown(0.7);
      });

      // Pie de página
      doc.moveDown(2);
      doc
        .fontSize(10)
        .text(`Reporte generado el: ${new Date().toLocaleDateString()}`, {
          align: "center",
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
