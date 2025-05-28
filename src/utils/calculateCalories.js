export function calcularCalorias({ Peso, Estatura, Edad, Genero, Objetivo }) {
  let tmb;

  // Utilizamos la Fórmula de Harris-Benedict una de las más precisas segun el veichan
  if (Genero.toLowerCase() === 'masculino') {
    tmb = 10 * Peso + 6.25 * Estatura - 5 * Edad + 5;
  } else if (Genero.toLowerCase() === 'femenino') {
    tmb = 10 * Peso + 6.25 * Estatura - 5 * Edad - 161;
  } else {
    throw new Error('Género no válido');
  }

  // Ajustar según el objetivo, para el objetivo de mantener el peso no lo tocamos ya que será el total sacado del TMB
  if (Objetivo === 'bajar') {
    tmb -= 500;
  } else if (Objetivo === 'subir') {
    tmb += 500;
  }

  return Math.round(tmb); // Redondeamos para más claridad
}
