const url = "https://api.open-meteo.com/v1/forecast?latitude=21.03829&longitude=-105.25024&current=temperature_2m%2Crelative_humidity_2m%2Cprecipitation%2Cwind_speed_10m&timezone=America%2FMazatlan";

// PENDIENTE: confirmar estos limites con el equipo de obra de Sohersa.
// Los valores de abajo son de referencia generica, NO son criterios de la empresa.
const LIMITES = {
  tempMaxima: 32,      // C
  tempMinima: 5,       // C
  vientoMaximo: 30,    // km/h
  humedadMinima: 40    // %
};

function evaluarColado(temp, humedad, precipitacion, viento) {
  const motivos = [];

  if (precipitacion > 0) {
    motivos.push("esta lloviendo (" + precipitacion + " mm)");
  }
  if (temp > LIMITES.tempMaxima) {
    motivos.push("temperatura muy alta (" + temp + " C)");
  }
  if (temp < LIMITES.tempMinima) {
    motivos.push("temperatura muy baja (" + temp + " C)");
  }
  if (viento > LIMITES.vientoMaximo) {
    motivos.push("viento fuerte (" + viento + " km/h)");
  }
  if (humedad < LIMITES.humedadMinima) {
    motivos.push("humedad baja (" + humedad + " %)");
  }

  return motivos;
}

async function cargarClima() {
  try {
    const respuesta = await fetch(url);

    if (!respuesta.ok) {
      throw new Error("Error al obtener los datos del clima");
    }

    const datos = await respuesta.json();
    console.log(datos);

    const temp = datos.current.temperature_2m;
    const viento = datos.current.wind_speed_10m;
    const humedad = datos.current.relative_humidity_2m;
    const precipitacion = datos.current.precipitation;

    document.getElementById("humedad").textContent =
      "Humedad: " + humedad + " %";

    document.getElementById("precipitacion").textContent =
      "Precipitación: " + precipitacion + " mm";

    document.getElementById("temperatura").textContent =
      "Temperatura: " + temp + " °C";

    document.getElementById("viento").textContent =
      "Viento: " + viento + " km/h";

    const ahora = new Date();
    document.getElementById("ultima-actualizacion").textContent =
      "Última actualización: " + ahora.toLocaleTimeString("es-MX");

    const motivos = evaluarColado(temp, humedad, precipitacion, viento);
    const alerta = document.getElementById("alerta-colado");

    if (motivos.length === 0) {
      alerta.textContent = "Condiciones adecuadas para colar.";
      alerta.className = "colado-ok";
    } else {
      alerta.textContent = "No se recomienda colar: " + motivos.join(", ") + ".";
      alerta.className = "colado-alerta";
    }

  } catch (error) {
    console.error("Ocurrió un error:", error);

    document.getElementById("humedad").textContent = "Error al cargar el clima";
    document.getElementById("precipitacion").textContent = "Error al cargar el clima";
    document.getElementById("temperatura").textContent = "Error al cargar el clima";
    document.getElementById("viento").textContent = "Error al cargar el clima";

    const alerta = document.getElementById("alerta-colado");
    alerta.textContent = "Sin datos: no se puede evaluar si se puede colar.";
    alerta.className = "colado-sin-datos";
  }
}

cargarClima();
document.getElementById("actualizar").addEventListener("click", cargarClima);
