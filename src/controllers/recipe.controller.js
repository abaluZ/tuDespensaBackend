import { GoogleGenerativeAI } from "@google/generative-ai";
import Diet from "../models/diet.model.js";
import { information } from "../models/information.model.js";
import userGoal from "../models/goal.model.js";
import Despensa from "../models/despensa.model.js";
import dotenv from "dotenv";
import { calcularCalorias } from "../utils/calculateCalories.js";

dotenv.config();

// Verificar que la API KEY esté cargada
if (!process.env.GEMINI_API_KEY) {
    console.error("¡ADVERTENCIA! No se encontró la API KEY de Gemini en las variables de entorno");
}

console.log("Usando API KEY:", process.env.GEMINI_API_KEY ? "Configurada" : "No configurada");

// Inicializar Gemini con la configuración correcta
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Mapeo de categorías de alimentos por tipo de comida
const categoriaPorTipoComida = {
    desayuno: ["Lacteo", "Granos y Pasta", "Fruta", "Pan", "Bebida", "Huevo"],
    almuerzo: ["Carne", "Vegetal", "Granos y Pasta", "Legumbre", "Condimento", "Aceite"],
    cena: ["Carne", "Vegetal", "Granos y Pasta", "Legumbre", "Condimento", "Aceite"],
    postre: ["Fruta", "Lacteo", "Dulce", "Pan", "Postre"]
};

// Distribución de calorías por tipo de comida (porcentajes)
const distribucionCalorias = {
    desayuno: 0.25, // 25% del total
    almuerzo: 0.35, // 35% del total
    cena: 0.25,     // 25% del total
    postre: 0.15    // 15% del total
};

export const getRecipeRecommendations = async (req, res) => {
    try {
        console.log("Iniciando generación de recomendaciones...");
        const userId = req.user.userId;
        const { tipo_comida } = req.query; // desayuno, almuerzo, cena, postre

        if (!tipo_comida || !["desayuno", "almuerzo", "cena", "postre"].includes(tipo_comida)) {
            return res.status(400).json({
                message: "Debe especificar un tipo de comida válido (desayuno, almuerzo, cena, postre)"
            });
        }

        // Obtener toda la información necesaria del usuario
        const userDiet = await Diet.findOne({ user: userId });
        const userInfo = await information.findOne({ user: userId });
        const userGoalInfo = await userGoal.findOne({ user: userId });
        const userDespensa = await Despensa.findOne({ user: userId });

        console.log("Información recopilada:", {
            diet: userDiet ? "encontrada" : "no encontrada",
            info: userInfo ? "encontrada" : "no encontrada",
            goal: userGoalInfo ? "encontrada" : "no encontrada",
            despensa: userDespensa ? "encontrada" : "no encontrada"
        });

        if (!userDiet || !userInfo || !userGoalInfo || !userDespensa) {
            return res.status(404).json({ 
                message: "Falta información necesaria para generar recomendaciones",
                missing: {
                    diet: !userDiet,
                    info: !userInfo,
                    goal: !userGoalInfo,
                    despensa: !userDespensa
                }
            });
        }

        // Filtrar ingredientes según el tipo de comida
        const categoriasRelevantes = categoriaPorTipoComida[tipo_comida];
        console.log("Categorías relevantes para", tipo_comida, ":", categoriasRelevantes);
        
        console.log("Todos los items en despensa:", userDespensa.items);
        
        const ingredientesFiltrados = userDespensa.items.filter(item => {
            const categoriaItem = item.categoria.toLowerCase();
            const coincide = categoriasRelevantes.some(cat => 
                categoriaItem.includes(cat.toLowerCase()) || 
                cat.toLowerCase().includes(categoriaItem)
            );
            console.log(`Evaluando item: ${item.nombre}, Categoría: ${item.categoria}, Coincide: ${coincide}`);
            return coincide;
        });
        
        console.log("Ingredientes filtrados:", ingredientesFiltrados);

        if (ingredientesFiltrados.length === 0) {
            console.log("No se encontraron ingredientes para", tipo_comida);
            return res.status(400).json({
                message: "No hay ingredientes disponibles para este tipo de comida",
                categorias_buscadas: categoriasRelevantes,
                ingredientes_disponibles: userDespensa.items.map(item => ({
                    nombre: item.nombre,
                    categoria: item.categoria
                }))
            });
        }

        const ingredientesDisponibles = ingredientesFiltrados.map(item => 
            `${item.nombre} (${item.cantidad} ${item.unidad})`
        ).join(', ');

        // Calcular calorías usando la función existente
        const fechaNacimiento = new Date(userInfo.Edad);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const estaturaCm = Number(userInfo.Estatura) * 100;

        let objetivoNormalizado = userGoalInfo.goal.toLowerCase();
        if (objetivoNormalizado === 'bajar de peso') objetivoNormalizado = 'bajar';
        if (objetivoNormalizado === 'subir de peso') objetivoNormalizado = 'subir';
        if (objetivoNormalizado === 'mantener peso') objetivoNormalizado = 'mantener';

        const datosCalculo = {
            edad: edad,
            peso: Number(userInfo.Peso),
            estatura: estaturaCm,
            genero: userInfo.Genero,
            objetivo: objetivoNormalizado
        };

        const resultadoCalorias = calcularCalorias(datosCalculo);
        const caloriasTipoComida = resultadoCalorias.distribucionCalorica[tipo_comida === 'postre' ? 'meriendas' : tipo_comida];

        console.log("Ingredientes disponibles para " + tipo_comida + ":", ingredientesDisponibles);

        // Crear el prompt para Gemini
        const prompt = `Actúa como un chef experto y nutricionista. Necesito recomendaciones de ${tipo_comida} basadas en la siguiente información:

        Perfil del Usuario:
        - Tipo de Dieta: ${userDiet.type_diet.toUpperCase()}
        ${getDietaryInstructions(userDiet.type_diet)}
        - Objetivo: ${userGoalInfo.goal}
        - Edad: ${userInfo.Edad}
        - Peso: ${userInfo.Peso} kg
        - Estatura: ${userInfo.Estatura} cm
        - Género: ${userInfo.Genero}
        - Calorías objetivo para este ${tipo_comida}: ${caloriasTipoComida} calorías

        Ingredientes Disponibles:
        ${ingredientesDisponibles}

        Por favor, recomienda 4 opciones de ${tipo_comida}:
        - 2 recetas usando SOLO los ingredientes disponibles listados arriba
        - 2 recetas que pueden incluir algunos ingredientes adicionales comunes (especificar cuáles hay que comprar)

        Las recetas deben:
        1. Ser apropiadas para ${tipo_comida}
        2. Cumplir ESTRICTAMENTE con las restricciones de la dieta ${userDiet.type_diet.toUpperCase()}
        3. Ayudar a alcanzar su objetivo
        4. Aproximarse a las calorías objetivo para este tiempo de comida
        5. Ser nutritivas y balanceadas

        Para cada receta, proporciona:
        - Nombre de la receta
        - Lista de ingredientes con cantidades (marca claramente cuáles hay que comprar)
        - Pasos de preparación
        - Tiempo de preparación
        - Información nutricional aproximada (calorías, proteínas, carbohidratos, grasas)
        - Beneficios nutricionales
        
        Formato la respuesta en JSON con esta estructura:
        {
            "recetas_con_ingredientes_disponibles": [
                {
                    "nombre": "",
                    "ingredientes": [],
                    "preparacion": [],
                    "tiempo_preparacion": "",
                    "informacion_nutricional": {},
                    "beneficios": []
                }
            ],
            "recetas_con_complementos": [
                {
                    "nombre": "",
                    "ingredientes_disponibles": [],
                    "ingredientes_a_comprar": [],
                    "preparacion": [],
                    "tiempo_preparacion": "",
                    "informacion_nutricional": {},
                    "beneficios": []
                }
            ]
        }`;

        console.log("Llamando a Gemini API...");

        try {
            // Llamar a Gemini con el modelo correcto
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            
            const result = await model.generateContent({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            });

            console.log("Respuesta recibida de Gemini");
            const response = result.response;
            const text = response.text();

            // Intentar parsear la respuesta como JSON
            let recipes;
            try {
                recipes = JSON.parse(text);
                console.log("Respuesta parseada correctamente como JSON");
            } catch (error) {
                console.log("No se pudo parsear como JSON, usando texto plano");
                recipes = { text: text };
            }

            res.json({
                message: "Recomendaciones generadas exitosamente",
                tipo_comida: tipo_comida,
                calorias_objetivo: caloriasTipoComida,
                recipes: recipes
            });
        } catch (error) {
            console.error("Error específico de Gemini:", error);
            res.status(500).json({
                message: "Error al generar contenido con Gemini",
                error: error.message,
                details: "Por favor, verifica la API KEY y su configuración"
            });
        }

    } catch (error) {
        console.error("Error general al generar recomendaciones:", error);
        res.status(500).json({ 
            message: "Error al generar recomendaciones de recetas", 
            error: error.message 
        });
    }
};

// Función auxiliar para obtener instrucciones según la dieta
const getDietaryInstructions = (tipoDieta) => {
    switch (tipoDieta.toLowerCase()) {
        case 'vegano':
            return `- Restricciones: NO incluir NINGÚN producto de origen animal (carne, pescado, huevos, lácteos, miel)
        - Enfoque: Usar alternativas vegetales para proteínas como legumbres, tofu, tempeh, etc.`;
        case 'vegetariano':
            return `- Restricciones: NO incluir carne ni pescado
        - Permitido: Huevos, lácteos y todos los productos vegetales`;
        case 'estandar':
        default:
            return `- Sin restricciones específicas
        - Incluir una variedad balanceada de todos los grupos alimenticios
        - Se pueden usar carnes, pescados, huevos, lácteos y todos los productos vegetales`;
    }
}; 