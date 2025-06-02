export function calcularCalorias({ edad, peso, estatura, genero, objetivo }) {
  // Convertir strings a números
  const edadNum = Number(edad);
  const pesoNum = Number(peso);
  const estaturaNum = Number(estatura);

  // Validaciones
  if (!edad || !peso || !estatura || !genero || !objetivo) {
    throw new Error('Todos los campos son requeridos');
  }

  // Validar que los valores sean números válidos
  if (isNaN(edadNum) || isNaN(pesoNum) || isNaN(estaturaNum)) {
    throw new Error('La edad, peso y estatura deben ser valores numéricos');
  }

  if (edadNum < 15 || edadNum > 80) {
    throw new Error('La edad debe estar entre 15 y 80 años');
  }

  if (pesoNum < 30 || pesoNum > 300) {
    throw new Error('El peso debe estar entre 30 y 300 kg');
  }

  if (estaturaNum < 130 || estaturaNum > 230) {
    throw new Error(`La estatura debe estar entre 130 y 230 cm (valor actual: ${estaturaNum})`);
  }

  const generoNormalizado = genero.toLowerCase();
  const objetivoNormalizado = objetivo.toLowerCase();

  if (!['masculino', 'femenino'].includes(generoNormalizado)) {
    throw new Error('Género no válido. Debe ser masculino o femenino');
  }

  // Normalizamos 'ganar masa muscular' a 'subir'
  const objetivoCalculos = objetivoNormalizado === 'ganar masa muscular' ? 'subir' : objetivoNormalizado;

  if (!['mantener', 'bajar', 'subir', 'ganar masa muscular'].includes(objetivoNormalizado)) {
    throw new Error('Objetivo no válido. Debe ser mantener, bajar, subir o ganar masa muscular');
  }

  // Cálculo del TMB (Tasa Metabólica Basal) usando la fórmula de Harris-Benedict revisada
  let tmb;
  if (generoNormalizado === 'masculino') {
    tmb = 88.362 + (13.397 * pesoNum) + (4.799 * estaturaNum) - (5.677 * edadNum);
  } else {
    tmb = 447.593 + (9.247 * pesoNum) + (3.098 * estaturaNum) - (4.330 * edadNum);
  }

  // Factor de actividad (asumimos actividad ligera por defecto)
  const factorActividad = 1.375;
  let caloriasDiarias = tmb * factorActividad;

  // Ajuste según objetivo
  let ajusteCalorias = 0;
  if (objetivoCalculos === 'bajar') {
    ajusteCalorias = -500;
  } else if (objetivoCalculos === 'subir') {
    ajusteCalorias = 500;
  }

  caloriasDiarias += ajusteCalorias;

  // Cálculo de macronutrientes recomendados
  const proteinas = Math.round((caloriasDiarias * 0.25) / 4); // 25% de proteínas (4 cal/g)
  const grasas = Math.round((caloriasDiarias * 0.25) / 9);    // 25% de grasas (9 cal/g)
  const carbohidratos = Math.round((caloriasDiarias * 0.50) / 4); // 50% de carbohidratos (4 cal/g)

  return {
    caloriasDiarias: Math.round(caloriasDiarias),
    tmb: Math.round(tmb),
    macronutrientes: {
      proteinas,
      grasas,
      carbohidratos
    },
    distribucionCalorica: {
      desayuno: Math.round(caloriasDiarias * 0.25),
      almuerzo: Math.round(caloriasDiarias * 0.35),
      cena: Math.round(caloriasDiarias * 0.25),
      meriendas: Math.round(caloriasDiarias * 0.15)
    }
  };
}