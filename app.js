// ---------------------------------------------------------------
// Obras que se muestran en la pagina.
// PENDIENTE: cambiar las dos ultimas por obras reales de Sohersa.
// Las coordenadas se sacan de Google Maps: clic derecho sobre el punto.
// ---------------------------------------------------------------
const obras = [
  { nombre: "EMBA", lat: 21.03829, lon: -105.25024 },
  { nombre: "Obra 2 (cambiar)", lat: 20.67360, lon: -103.34400 },
  { nombre: "Obra 3 (cambiar)", lat: 19.43260, lon: -99.13320 }
];

// PENDIENTE: confirmar estos limites con el equipo de obra de Sohersa.
// Los valores de abajo son de referencia generica, NO son criterios de la empresa.
const LIMITES = {
  tempMaxima: 32,      // C
  tempMinima: 5,       // C
  vientoMaximo: 30,    // km/h
  humedadMinima: 40    // %
};

function urlDe(obra) {
  return "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + obra.lat +
    "&longitude=" + obra.lon +
    "&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m" +
    "&timezone=auto";
}

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

async function cargarUnaObra(obra, tarjeta) {
  try {
    const respuesta = await fetch(urlDe(obra));

    if (!respuesta.ok) {
      throw new Error("Error al obtener los datos del clima");
    }

    const datos = await respuesta.json();
    const actual = datos.current;

    const temp = actual.temperature_2m;
    const humedad = actual.relative_humidity_2m;
    const precipitacion = actual.precipitation;
    const viento = actual.wind_speed_10m;

    const motivos = evaluarColado(temp, humedad, precipitacion, viento);

    let aviso;
    if (motivos.length === 0) {
      aviso = '<p class="colado-ok">Se puede colar.</p>';
    } else {
      aviso = '<p class="colado-alerta">No se recomienda colar: ' +
        motivos.join(", ") + '.</p>';
    }

    tarjeta.innerHTML =
      "<h3>" + obra.nombre + "</h3>" +
      "<p>Temperatura: " + temp + " C</p>" +
      "<p>Humedad: " + humedad + " %</p>" +
      "<p>Precipitacion: " + precipitacion + " mm</p>" +
      "<p>Viento: " + viento + " km/h</p>" +
      aviso;

  } catch (error) {
    console.error("Error en " + obra.nombre + ":", error);

    tarjeta.innerHTML =
      "<h3>" + obra.nombre + "</h3>" +
      '<p class="colado-sin-datos">Error al cargar el clima.</p>';
  }
}

function cargarTodas() {
  const contenedor = document.getElementById("obras");
  contenedor.innerHTML = "";

  for (const obra of obras) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "obra";
    tarjeta.innerHTML = "<h3>" + obra.nombre + "</h3><p>Cargando...</p>";
    contenedor.appendChild(tarjeta);

    cargarUnaObra(obra, tarjeta);
  }

  const ahora = new Date();
  document.getElementById("ultima-actualizacion").textContent =
    "Ultima actualizacion: " + ahora.toLocaleTimeString("es-MX");
}

cargarTodas();
document.getElementById("actualizar").addEventListener("click", cargarTodas);
