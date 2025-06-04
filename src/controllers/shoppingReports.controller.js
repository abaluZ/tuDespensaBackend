import ShoppingListHistory from "../models/shoppingListHistory.model.js";
import { generateShoppingReport } from "../utils/shoppingReportGenerator.js";

export const getMostBoughtProducts = async (req, res) => {
  const userId = req.user.userId;
  const { startDate, endDate, limit = 10, format } = req.query;

  try {
    // Construir el filtro de fechas
    const dateFilter = {
      user: userId,
      completada: true,
      fechaCompletado: {
        $exists: true
      }
    };

    if (startDate) {
      dateFilter.fechaCompletado.$gte = new Date(startDate + 'T00:00:00.000Z');
    }
    if (endDate) {
      dateFilter.fechaCompletado.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    // Obtener todas las listas completadas en el rango de fechas
    const historial = await ShoppingListHistory.find(dateFilter);

    if (historial.length === 0) {
      return res.json({
        productos: [],
        estadisticas: {
          totalListas: 0,
          periodoAnalisis: {
            inicio: startDate ? new Date(startDate) : null,
            fin: endDate ? new Date(endDate) : null
          },
          totalProductosUnicos: 0
        }
      });
    }

    // Objeto para almacenar las estadísticas de productos
    const productStats = {};

    // Procesar cada lista del historial
    historial.forEach((lista) => {
      lista.items.forEach((item) => {
        // Solo considerar items que fueron marcados como comprados
        if (item.comprado) {
          const key = item.nombre.toLowerCase(); // Normalizar el nombre para evitar duplicados por mayúsculas/minúsculas
          if (!productStats[key]) {
            productStats[key] = {
              nombre: item.nombre,
              cantidadTotal: 0,
              vecesComprado: 0,
              categorias: new Set(),
              unidades: new Set(),
              fechasCompra: [],
              promedioUnidades: 0,
            };
          }

          const stats = productStats[key];
          stats.cantidadTotal += Number(item.cantidad) || 0; // Asegurarse de que la cantidad sea un número
          stats.vecesComprado += 1;
          stats.categorias.add(item.categoria);
          stats.unidades.add(item.unidad);
          stats.fechasCompra.push(lista.fechaCompletado);
        }
      });
    });

    // Convertir las estadísticas a un array y calcular promedios
    const productsArray = Object.values(productStats).map((stats) => ({
      nombre: stats.nombre,
      cantidadTotal: stats.cantidadTotal,
      vecesComprado: stats.vecesComprado,
      promedioUnidades: Number((stats.cantidadTotal / stats.vecesComprado).toFixed(2)),
      categorias: Array.from(stats.categorias),
      unidades: Array.from(stats.unidades),
      fechasCompra: stats.fechasCompra.sort((a, b) => b - a),
    }));

    // Ordenar por frecuencia de compra
    const sortedProducts = productsArray
      .sort((a, b) => b.vecesComprado - a.vecesComprado)
      .slice(0, limit);

    // Calcular estadísticas generales
    const totalListas = historial.length;
    const periodoAnalisis = {
      inicio: startDate
        ? new Date(startDate)
        : Math.min(...historial.map((h) => h.fechaCreacion)),
      fin: endDate
        ? new Date(endDate)
        : Math.max(...historial.map((h) => h.fechaCompletado)),
    };

    const reportData = {
      productos: sortedProducts,
      estadisticas: {
        totalListas,
        periodoAnalisis,
        totalProductosUnicos: productsArray.length,
      }
    };

    // Si se solicita formato PDF, generar y enviar el PDF
    if (format === 'pdf') {
      return await generateShoppingReport(reportData, res);
    }

    // Si no se solicita PDF, enviar JSON
    res.json(reportData);
  } catch (error) {
    console.error("Error al generar reporte de productos:", error);
    res.status(500).json({
      message: "Error al generar el reporte de productos más comprados",
      error: error.message,
    });
  }
};

export const generateHistoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validar fechas
    const inicio = startDate
      ? new Date(startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const fin = endDate ? new Date(endDate) : new Date();

    // Buscar las listas completadas en el rango de fechas
    const historialCompras = await ShoppingListHistory.find({
      user: req.user.id,
      completada: true,
      fechaCompletado: {
        $gte: inicio,
        $lte: fin,
      },
    });

    // Procesar los datos para el reporte
    const productosMap = new Map();

    historialCompras.forEach((lista) => {
      lista.items.forEach((item) => {
        if (!productosMap.has(item.nombre)) {
          productosMap.set(item.nombre, {
            nombre: item.nombre,
            vecesComprado: 0,
            cantidadTotal: 0,
            promedioUnidades: 0,
            categorias: new Set([item.categoria]),
            unidades: new Set([item.unidad]),
            fechasCompra: [],
          });
        }

        const stats = productosMap.get(item.nombre);
        stats.vecesComprado += 1;
        stats.cantidadTotal += item.cantidad;
        stats.categorias.add(item.categoria);
        stats.unidades.add(item.unidad);
        stats.fechasCompra.push(lista.fechaCompletado || lista.fechaCreacion);
      });
    });

    // Convertir los datos para el reporte
    const productos = Array.from(productosMap.values())
      .map((p) => ({
        ...p,
        promedioUnidades: p.cantidadTotal / p.vecesComprado,
        categorias: Array.from(p.categorias),
        unidades: Array.from(p.unidades),
        fechasCompra: Array.from(p.fechasCompra).sort((a, b) => b - a),
      }))
      .sort((a, b) => b.vecesComprado - a.vecesComprado)
      .slice(0, 10); // Top 10 productos más comprados

    const reportData = {
      estadisticas: {
        periodoAnalisis: {
          inicio: inicio.toLocaleDateString(),
          fin: fin.toLocaleDateString(),
        },
        totalListas: historialCompras.length,
        totalProductosUnicos: productosMap.size,
      },
      productos,
    };

    // Generar y enviar el PDF directamente
    await generateShoppingReport(reportData, res);
  } catch (error) {
    console.error("Error al generar el reporte:", error);
    res.status(500).json({
      message: "Error al generar el reporte",
      error: error.message,
    });
  }
};
