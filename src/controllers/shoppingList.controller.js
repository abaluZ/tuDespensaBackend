// Codigo realizado por Segales
// controllers/shoppingList.controller.js
import ShoppingList from "../models/shoppingList.model.js";
import ShoppingListHistory from "../models/shoppingListHistory.model.js";

export const createOrUpdateShoppingList = async (req, res) => {
  const userId = req.user.userId;
  const { items, completar } = req.body;
  console.log("Solicitud recibida:", {
    userId,
    completar,
    itemsCount: items?.length,
  });

  try {
    let shoppingList = await ShoppingList.findOne({ user: userId });

    // Si la lista se marca como completada, la guardamos en el historial
    if (completar && shoppingList) {
      console.log("Completando lista de compras...");
      const itemsComprados = shoppingList.items.filter(
        (item) => item.comprado
      ).length;

      const historialEntry = new ShoppingListHistory({
        user: userId,
        items: shoppingList.items,
        completada: true,
        fechaCompletado: new Date(),
        totalItems: shoppingList.items.length,
        itemsComprados: itemsComprados,
      });

      console.log("Guardando entrada en el historial:", historialEntry);
      await historialEntry.save();
      console.log("Historial guardado exitosamente");

      // Crear una nueva lista vacía
      shoppingList = new ShoppingList({ user: userId, items: [] });
    } else if (!shoppingList) {
      // Si no existe una lista, crear una nueva
      shoppingList = new ShoppingList({ user: userId, items });
    } else {
      // Actualizar la lista existente
      shoppingList.items = items;
    }

    const savedList = await shoppingList.save();
    res.status(200).json({
      message: completar
        ? "Lista marcada como completada y guardada en historial"
        : "Lista de compras guardada/actualizada",
      data: savedList,
    });
  } catch (error) {
    console.error("Error en createOrUpdateShoppingList:", error);
    res.status(500).json({
      message: "Error al guardar/actualizar la lista de compras",
      details: error,
    });
  }
};

export const getShoppingList = async (req, res) => {
  const userId = req.user.userId;

  try {
    let shoppingList = await ShoppingList.findOne({ user: userId });

    if (!shoppingList) {
      // Si no existe una lista, crear una nueva lista vacía
      shoppingList = new ShoppingList({ user: userId, items: [] });
      await shoppingList.save();
    }

    res.json(shoppingList);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener la lista de compras",
      error,
    });
  }
};

export const getShoppingListHistory = async (req, res) => {
  const userId = req.user.userId;
  const { page = 1, limit = 10 } = req.query;
  console.log("Buscando historial para usuario:", userId);

  try {
    const historial = await ShoppingListHistory.find({ user: userId })
      .sort({ fechaCreacion: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    console.log("Historial encontrado:", historial);

    const total = await ShoppingListHistory.countDocuments({ user: userId });
    console.log("Total de documentos:", total);

    if (historial.length === 0) {
      console.log("No se encontraron registros en el historial");
    }

    res.json({
      historial,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalItems: total,
    });
  } catch (error) {
    console.error("Error al obtener el historial:", error);
    res.status(500).json({
      message: "Error al obtener el historial de listas de compras",
      error,
    });
  }
};
