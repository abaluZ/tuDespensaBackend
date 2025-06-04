import ShoppingListHistory from "../models/shoppingListHistory.model.js";
import ShoppingList from "../models/shoppingList.model.js";
import { generateShoppingReport } from "../utils/shoppingReportGenerator.js";

export const completeShoppingList = async (req, res) => {
  try {
    const { listId } = req.params;

    // Buscar la lista de compras
    const shoppingList = await ShoppingList.findById(listId).populate("user");

    if (!shoppingList) {
      return res
        .status(404)
        .json({ message: "Lista de compras no encontrada" });
    }

    // Verificar que el usuario sea el dueño de la lista
    if (shoppingList.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // Crear el registro en el historial
    const historyEntry = new ShoppingListHistory({
      user: shoppingList.user._id,
      items: shoppingList.items,
      totalItems: shoppingList.items.length,
      completada: true,
      fechaCompletado: new Date(),
    });

    await historyEntry.save();

    // Eliminar la lista original
    await ShoppingList.findByIdAndDelete(listId);

    res.json({
      message: "Lista de compras completada y movida al historial",
      historyEntry,
    });
  } catch (error) {
    console.error("Error al completar la lista de compras:", error);
    res.status(500).json({
      message: "Error al completar la lista de compras",
      error: error.message,
    });
  }
};

export const generateShoppingHistoryReport = async (req, res) => {
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
