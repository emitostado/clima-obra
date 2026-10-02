/* ============================================================
   app.js — Panel de clima de obra

   Flujo general:
     1. Se elige una obra del catálogo (datos.js).
     2. Se consulta Open-Meteo: condiciones actuales, 24 horas
        y 7 días.
     3. Se calcula un índice de riesgo de colado (0 a 100).
     4. Se pinta el panel y se construye la escena de partículas
        del fondo con los datos reales (lluvia, viento, sol...).
   ============================================================ */

/* ------------------------------------------------------------
   1. Reglas de obra
   ------------------------------------------------------------ */

// Umbrales de referencia para trabajos de colado.
const LIMITES = {
  tempMaxima: 32,
  tempMinima: 5,
  vientoMaximo: 30,
  humedadMinima: 40
};

// Cuánto pesa cada factor en el índice de riesgo (suma 100).
const PESOS = {
  lluvia: 30,
  viento: 22,
  temperatura: 20,
  humedad: 14,
  uv: 14
};

const NIVELES = [
  {
    hasta: 20,
    clave: "optimo",
    sello: "Apto para colar",
    frase: "Ventana limpia: las condiciones favorecen el colado y el curado."
  },
  {
    hasta: 40,
    clave: "aceptable",
    sello: "Apto con vigilancia",
    frase: "Se puede colar, pero conviene vigilar el clima durante la jornada."
  },
  {
    hasta: 65,
    clave: "precaucion",
    sello: "Precaución",
    frase: "Hay factores en contra: refuerza las medidas antes de colar."
  },
  {
    hasta: 101,
    clave: "critico",
    sello: "Suspender colado",
    frase: "Condiciones adversas: lo recomendable es reprogramar el colado."
  }
];

// Códigos WMO que devuelve Open-Meteo en weather_code.
const CODIGOS_CLIMA = {
  0: { escena: "sol", icono: "☀️", texto: "Cielo despejado" },
  1: { escena: "sol", icono: "🌤️", texto: "Mayormente despejado" },
  2: { escena: "nubes", icono: "⛅", texto: "Parcialmente nublado" },
  3: { escena: "nubes", icono: "☁️", texto: "Nublado" },
  45: { escena: "niebla", icono: "🌫️", texto: "Niebla" },
  48: { escena: "niebla", icono: "🌫️", texto: "Niebla con escarcha" },
  51: { escena: "lluvia", icono: "🌦️", texto: "Llovizna ligera" },
  53: { escena: "lluvia", icono: "🌦️", texto: "Llovizna" },
  55: { escena: "lluvia", icono: "🌧️", texto: "Llovizna intensa" },
  56: { escena: "lluvia", icono: "🌧️", texto: "Llovizna helada" },
  57: { escena: "lluvia", icono: "🌧️", texto: "Llovizna helada intensa" },
  61: { escena: "lluvia", icono: "🌦️", texto: "Lluvia ligera" },
  63: { escena: "lluvia", icono: "🌧️", texto: "Lluvia" },
  65: { escena: "lluvia", icono: "🌧️", texto: "Lluvia fuerte" },
  66: { escena: "lluvia", icono: "🌧️", texto: "Lluvia helada" },
  67: { escena: "lluvia", icono: "🌧️", texto: "Lluvia helada fuerte" },
  71: { escena: "nieve", icono: "🌨️", texto: "Nevada ligera" },
  73: { escena: "nieve", icono: "🌨️", texto: "Nevada" },
  75: { escena: "nieve", icono: "❄️", texto: "Nevada fuerte" },
  77: { escena: "nieve", icono: "❄️", texto: "Granos de nieve" },
  80: { escena: "lluvia", icono: "🌦️", texto: "Chubascos ligeros" },
  81: { escena: "lluvia", icono: "🌧️", texto: "Chubascos" },
  82: { escena: "lluvia", icono: "🌧️", texto: "Chubascos violentos" },
  85: { escena: "nieve", icono: "🌨️", texto: "Chubascos de nieve" },
  86: { escena: "nieve", icono: "❄️", texto: "Chubascos de nieve fuertes" },
  95: { escena: "tormenta", icono: "⛈️", texto: "Tormenta eléctrica" },
  96: { escena: "tormenta", icono: "⛈️", texto: "Tormenta con granizo" },
  99: { escena: "tormenta", icono: "⛈️", texto: "Tormenta con granizo fuerte" }
};

// Color del arco del medidor por nivel de riesgo.
const COLORES_NIVEL = {
  optimo: "#22c55e",
  aceptable: "#3b82f6",
  precaucion: "#f59e0b",
  critico: "#ef4444",
  neutro: "#94a3b8"
};

const RUMBOS = [
  "N", "NNE", "NE", "ENE",
  "E", "ESE", "SE", "SSE",
  "S", "SSO", "SO", "OSO",
  "O", "ONO", "NO", "NNO"
];

const DIAS_SEMANA = [
  "domingo", "lunes", "martes", "miércoles",
  "jueves", "viernes", "sábado"
];

/* ------------------------------------------------------------
   2. Estado
   ------------------------------------------------------------ */

/** Permite abrir el panel en una obra concreta: index.html?obra=jeddah-tower */
function obraInicial() {
  try {
    const pedida = new URLSearchParams(location.search).get("obra");
    const encontrada = OBRAS.find(function (obra) {
      return obra.id === pedida;
    });
    if (encontrada) {
      return encontrada;
    }
  } catch (error) {
    console.warn("No se pudo leer el parámetro de la obra", error);
  }
  return OBRAS[0];
}

let obraActual = obraInicial();
let datosActuales = null;
let desfaseSitio = 0; // segundos de diferencia con UTC en la obra
let relojIntervalo = null;
let consultaEnCurso = 0;

/* ------------------------------------------------------------
   3. Utilidades
   ------------------------------------------------------------ */

function nodo(etiqueta, clase, html) {
  const elemento = document.createElement(etiqueta);
  if (clase) {
    elemento.className = clase;
  }
  if (html !== undefined) {
    elemento.innerHTML = html;
  }
  return elemento;
}

function azar(minimo, maximo) {
  return minimo + Math.random() * (maximo - minimo);
}

function limitar(valor, minimo, maximo) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function redondear(valor, decimales) {
  if (valor === null || valor === undefined || isNaN(valor)) {
    return "—";
  }
  const factor = Math.pow(10, decimales || 0);
  return (Math.round(valor * factor) / factor).toLocaleString("es-MX");
}

function escapar(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// "2026-10-02T15:00" -> "15:00"
function soloHora(marca) {
  return marca.slice(11, 16);
}

function minutosDe(marca) {
  return Number(marca.slice(11, 13)) * 60 + Number(marca.slice(14, 16));
}

function rumboDe(grados) {
  if (grados === null || grados === undefined) {
    return "—";
  }
  const indice = Math.round(((grados % 360) / 22.5)) % 16;
  return RUMBOS[indice];
}

// Escala Beaufort resumida, en km/h.
function beaufort(velocidad) {
  if (velocidad < 1) return "Calma";
  if (velocidad < 12) return "Brisa suave";
  if (velocidad < 20) return "Brisa moderada";
  if (velocidad < 29) return "Brisa fresca";
  if (velocidad < 39) return "Viento fuerte";
  if (velocidad < 50) return "Viento muy fuerte";
  if (velocidad < 62) return "Vendaval";
  return "Tormenta de viento";
}

function categoriaUv(uv) {
  if (uv === null || uv === undefined) return "Sin dato";
  if (uv < 3) return "Bajo";
  if (uv < 6) return "Moderado";
  if (uv < 8) return "Alto";
  if (uv < 11) return "Muy alto";
  return "Extremo";
}

/* ------------------------------------------------------------
   4. Consulta a Open-Meteo
   ------------------------------------------------------------ */

function urlDe(obra) {
  const actual = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "dew_point_2m",
    "precipitation",
    "weather_code",
    "cloud_cover",
    "surface_pressure",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
    "is_day"
  ].join(",");

  const porHora = [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "precipitation",
    "precipitation_probability",
    "weather_code",
    "wind_speed_10m",
    "wind_gusts_10m",
    "uv_index",
    "is_day"
  ].join(",");

  const porDia = [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "precipitation_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
    "uv_index_max",
    "sunrise",
    "sunset"
  ].join(",");

  return "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + obra.lat +
    "&longitude=" + obra.lon +
    "&current=" + actual +
    "&hourly=" + porHora +
    "&daily=" + porDia +
    "&forecast_days=7" +
    "&timezone=auto";
}

// Consulta ligera para la comparativa: los mismos factores que el
// panel principal, para que los índices sean comparables entre sí.
function urlResumen(obra) {
  return "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + obra.lat +
    "&longitude=" + obra.lon +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m," +
    "precipitation,weather_code,wind_speed_10m,wind_gusts_10m,is_day" +
    "&hourly=precipitation_probability,uv_index" +
    "&forecast_days=1" +
    "&timezone=auto";
}

/* ------------------------------------------------------------
   5. Índice de riesgo
   ------------------------------------------------------------ */

function puntosLluvia(milimetros, probabilidad) {
  if (milimetros >= 5) return 100;
  if (milimetros >= 1) return 85;
  if (milimetros > 0.1) return 65;
  if (probabilidad >= 70) return 45;
  if (probabilidad >= 40) return 28;
  if (probabilidad >= 20) return 14;
  return 4;
}

function puntosViento(velocidad, rafaga) {
  const pico = Math.max(velocidad || 0, rafaga || 0);
  if (pico >= 60) return 100;
  if (pico >= 45) return 82;
  if (pico >= LIMITES.vientoMaximo) return 62;
  if (pico >= 20) return 34;
  if (pico >= 12) return 15;
  return 4;
}

function puntosTemperatura(grados) {
  if (grados >= 40) return 100;
  if (grados >= 36) return 82;
  if (grados > LIMITES.tempMaxima) return 58;
  if (grados <= 0) return 100;
  if (grados <= LIMITES.tempMinima) return 78;
  if (grados <= 10) return 42;
  return 5;
}

function puntosHumedad(porcentaje) {
  if (porcentaje <= 20) return 88;
  if (porcentaje <= 30) return 66;
  if (porcentaje < LIMITES.humedadMinima) return 44;
  if (porcentaje >= 97) return 52;
  if (porcentaje >= 90) return 28;
  return 6;
}

function puntosUv(uv) {
  if (uv === null || uv === undefined) return 4;
  if (uv >= 11) return 86;
  if (uv >= 8) return 62;
  if (uv >= 6) return 38;
  if (uv >= 3) return 16;
  return 4;
}

function nivelDePuntos(puntos) {
  if (puntos >= 70) return "critico";
  if (puntos >= 45) return "precaucion";
  if (puntos >= 20) return "aceptable";
  return "optimo";
}

/**
 * Calcula el índice de riesgo de colado.
 * @param {object} m muestra con temperatura, lluvia, viento, humedad y uv
 */
function calcularRiesgo(m) {
  const factores = [
    {
      clave: "lluvia",
      icono: "🌧️",
      nombre: "Lluvia",
      lectura: redondear(m.precipitacion, 1) + " mm" +
        (m.probabilidad !== null && m.probabilidad !== undefined
          ? " · " + Math.round(m.probabilidad) + "% de probabilidad"
          : ""),
      puntos: puntosLluvia(m.precipitacion || 0, m.probabilidad || 0)
    },
    {
      clave: "viento",
      icono: "💨",
      nombre: "Viento",
      lectura: redondear(m.viento, 0) + " km/h" +
        (m.rafaga ? " · ráfagas de " + redondear(m.rafaga, 0) : ""),
      puntos: puntosViento(m.viento, m.rafaga)
    },
    {
      clave: "temperatura",
      icono: "🌡️",
      nombre: "Temperatura",
      lectura: redondear(m.aparente, 1) + " °C de sensación térmica",
      puntos: puntosTemperatura(m.aparente)
    },
    {
      clave: "humedad",
      icono: "💧",
      nombre: "Humedad",
      lectura: redondear(m.humedad, 0) + " % de humedad relativa",
      puntos: puntosHumedad(m.humedad)
    },
    {
      clave: "uv",
      icono: "🔆",
      nombre: "Radiación UV",
      lectura: "Índice " + redondear(m.uv, 1) + " · " + categoriaUv(m.uv),
      puntos: puntosUv(m.uv)
    }
  ];

  let indice = 0;
  for (const factor of factores) {
    factor.peso = PESOS[factor.clave];
    factor.nivel = nivelDePuntos(factor.puntos);
    indice += factor.puntos * factor.peso / 100;
  }

  indice = Math.round(indice);
  factores.sort(function (a, b) {
    return b.puntos * b.peso - a.puntos * a.peso;
  });

  return {
    indice: indice,
    nivel: nivelDeIndice(indice),
    factores: factores
  };
}

function muestraDeActual(datos) {
  const actual = datos.current;
  const indice = indiceHoraActual(datos);
  const porHora = datos.hourly;
  return {
    temp: actual.temperature_2m,
    aparente: actual.apparent_temperature,
    humedad: actual.relative_humidity_2m,
    rocio: actual.dew_point_2m,
    precipitacion: actual.precipitation,
    probabilidad: porHora.precipitation_probability[indice],
    viento: actual.wind_speed_10m,
    rafaga: actual.wind_gusts_10m,
    direccion: actual.wind_direction_10m,
    nubes: actual.cloud_cover,
    presion: actual.surface_pressure,
    uv: porHora.uv_index[indice],
    esDia: actual.is_day === 1,
    codigo: actual.weather_code
  };
}

function indiceHoraActual(datos) {
  const marca = datos.current.time.slice(0, 13) + ":00";
  const encontrado = datos.hourly.time.indexOf(marca);
  return encontrado === -1 ? 0 : encontrado;
}

/* ------------------------------------------------------------
   6. Clima a escena visual
   ------------------------------------------------------------ */

function describirClima(codigo, esDia, precipitacion) {
  let descripcion = CODIGOS_CLIMA[codigo];
  if (!descripcion) {
    descripcion = precipitacion > 0
      ? { escena: "lluvia", icono: "🌧️", texto: "Lluvia" }
      : { escena: "nubes", icono: "☁️", texto: "Sin datos del cielo" };
  }
  let escena = descripcion.escena;
  let icono = descripcion.icono;
  if (!esDia && escena === "sol") {
    escena = "noche";
    icono = "🌙";
  }
  return {
    escena: escena,
    icono: icono,
    texto: descripcion.texto,
    esDia: esDia
  };
}

function crearParticula(clase, estilos) {
  const elemento = document.createElement("div");
  elemento.className = clase;
  for (const propiedad in estilos) {
    if (propiedad.startsWith("--")) {
      elemento.style.setProperty(propiedad, estilos[propiedad]);
    } else {
      elemento.style[propiedad] = estilos[propiedad];
    }
  }
  return elemento;
}

function agregarNubes(escenario, cuantas, claseExtra) {
  for (let i = 0; i < cuantas; i++) {
    escenario.appendChild(
      crearParticula("nube " + claseExtra, {
        top: azar(2, 42).toFixed(1) + "vh",
        animationDuration: azar(55, 110).toFixed(1) + "s",
        animationDelay: "-" + azar(0, 70).toFixed(1) + "s",
        opacity: azar(0.5, 0.9).toFixed(2),
        "--escala": azar(0.55, 1.2).toFixed(2)
      })
    );
  }
}

/**
 * La lluvia se inclina con el viento real y su densidad depende
 * de los milímetros medidos.
 */
function agregarLluvia(escenario, m, extra) {
  const cuantas = Math.round(
    limitar(26 + (m.precipitacion || 0) * 45 + extra, 26, 95)
  );
  // El viento se reporta como la dirección DESDE la que sopla.
  const empuje = -Math.sin((m.direccion || 0) * Math.PI / 180);
  const fuerza = limitar((m.viento || 0) / 2.4, 1.5, 26) * empuje;
  const giro = limitar(fuerza * 1.1, -24, 24);

  for (let i = 0; i < cuantas; i++) {
    escenario.appendChild(
      crearParticula("gota", {
        left: azar(-18, 108).toFixed(1) + "vw",
        height: azar(14, 32).toFixed(0) + "px",
        animationDuration: azar(0.6, 1.25).toFixed(2) + "s",
        animationDelay: "-" + azar(0, 2).toFixed(2) + "s",
        opacity: azar(0.25, 0.75).toFixed(2),
        "--dx": fuerza.toFixed(1) + "vw",
        "--giro": giro.toFixed(1) + "deg"
      })
    );
  }
}

function agregarRachas(escenario, m) {
  if ((m.viento || 0) < 22) {
    return;
  }
  const cuantas = (m.viento || 0) > 45 ? 9 : 5;
  const empuje = -Math.sin((m.direccion || 0) * Math.PI / 180) >= 0 ? 1 : -1;
  for (let i = 0; i < cuantas; i++) {
    escenario.appendChild(
      crearParticula("racha", {
        top: azar(5, 92).toFixed(1) + "vh",
        width: azar(90, 260).toFixed(0) + "px",
        animationDuration: azar(2.4, 5.5).toFixed(1) + "s",
        animationDelay: "-" + azar(0, 5).toFixed(1) + "s",
        "--sentido": String(empuje)
      })
    );
  }
}

/**
 * Siluetas de la obra derivando por el fondo, muy tenues, como si
 * el proyecto flotara detrás del panel.
 */
function agregarSiluetas(escenario, obra) {
  for (let i = 0; i < 3; i++) {
    const flotante = crearParticula("silueta-flotante", {
      top: azar(6, 58).toFixed(1) + "vh",
      animationDuration: azar(95, 170).toFixed(1) + "s",
      animationDelay: "-" + azar(0, 120).toFixed(1) + "s",
      "--escala": azar(0.45, 1.05).toFixed(2)
    });
    flotante.innerHTML = svgDeObra(obra.id, "ilustracion-fondo");
    escenario.appendChild(flotante);
  }
}

function construirEscena(clima, m) {
  const escenario = document.getElementById("escena");
  document.body.dataset.clima = clima.escena;
  // Si el tema está en manual, no se le cambia debajo al usuario.
  if (temaElegido === "auto") {
    document.body.dataset.momento = clima.esDia ? "dia" : "noche";
  }
  escenario.innerHTML = "";

  const nubesPorCielo = Math.round(limitar((m.nubes || 0) / 18, 1, 6));

  if (clima.escena === "sol") {
    escenario.appendChild(crearParticula("sol", {}));
    escenario.appendChild(crearParticula("rayos-sol", {}));
    for (let i = 0; i < 14; i++) {
      escenario.appendChild(
        crearParticula("mota", {
          left: azar(0, 100).toFixed(1) + "vw",
          top: azar(10, 92).toFixed(1) + "vh",
          animationDuration: azar(9, 20).toFixed(1) + "s",
          animationDelay: "-" + azar(0, 12).toFixed(1) + "s"
        })
      );
    }
    agregarNubes(escenario, Math.min(2, nubesPorCielo), "nube-clara");
  } else if (clima.escena === "nubes") {
    agregarNubes(escenario, nubesPorCielo + 1, "nube-gris");
  } else if (clima.escena === "lluvia") {
    agregarNubes(escenario, Math.max(3, nubesPorCielo), "nube-gris");
    agregarLluvia(escenario, m, 0);
  } else if (clima.escena === "tormenta") {
    agregarNubes(escenario, Math.max(4, nubesPorCielo), "nube-oscura");
    agregarLluvia(escenario, m, 20);
    escenario.appendChild(crearParticula("relampago", {}));
    escenario.appendChild(crearParticula("rayo", {}));
  } else if (clima.escena === "nieve") {
    agregarNubes(escenario, Math.max(3, nubesPorCielo), "nube-clara");
    for (let i = 0; i < 44; i++) {
      const tamano = azar(4, 9).toFixed(1) + "px";
      escenario.appendChild(
        crearParticula("copo", {
          left: azar(0, 100).toFixed(1) + "vw",
          width: tamano,
          height: tamano,
          animationDuration: azar(7, 15).toFixed(1) + "s",
          animationDelay: "-" + azar(0, 12).toFixed(1) + "s",
          opacity: azar(0.4, 0.9).toFixed(2)
        })
      );
    }
  } else if (clima.escena === "niebla") {
    const bandas = Math.round(limitar((m.humedad || 80) / 22, 3, 6));
    for (let i = 0; i < bandas; i++) {
      escenario.appendChild(
        crearParticula("banda-niebla", {
          top: azar(6, 84).toFixed(1) + "vh",
          animationDuration: azar(40, 75).toFixed(1) + "s",
          animationDelay: "-" + azar(0, 30).toFixed(1) + "s"
        })
      );
    }
  } else if (clima.escena === "noche") {
    escenario.appendChild(crearParticula("luna", {}));
    for (let i = 0; i < 48; i++) {
      const tamano = azar(2, 4).toFixed(1) + "px";
      escenario.appendChild(
        crearParticula("estrella", {
          left: azar(0, 100).toFixed(1) + "vw",
          top: azar(0, 78).toFixed(1) + "vh",
          width: tamano,
          height: tamano,
          animationDuration: azar(2.5, 6).toFixed(1) + "s",
          animationDelay: "-" + azar(0, 5).toFixed(1) + "s"
        })
      );
    }
    agregarNubes(escenario, Math.min(2, nubesPorCielo), "nube-oscura");
  }

  agregarSiluetas(escenario, obraActual);
  agregarRachas(escenario, m);

  // Calor extremo: la imagen "vibra" como el aire sobre el asfalto.
  if ((m.aparente || 0) >= 34) {
    escenario.appendChild(crearParticula("calor", {}));
  }
}

/* ------------------------------------------------------------
   7. Pintado del panel
   ------------------------------------------------------------ */

/** Lámina de la columna derecha: la obra dibujada y sus datos. */
function pintarLamina(obra) {
  document.getElementById("laminaDibujo").innerHTML = svgDeObra(obra.id);
  document.getElementById("laminaNombre").textContent = obra.nombre;
  document.getElementById("laminaTipo").textContent = obra.tipo;

  const indice = document.getElementById("laminaIndice");
  indice.dataset.nivel = "neutro";
  indice.querySelector("strong").textContent = "--";

  // Las dos primeras cifras de la obra más su avance y su etapa.
  const filas = obra.cifras.slice(0, 2).map(function (cifra) {
    return [
      cifra.etiqueta,
      cifra.valor + (cifra.unidad ? " " + cifra.unidad : "")
    ];
  });
  filas.push([
    "Avance",
    obra.avance === null ? "Sin cifra oficial" : obra.avance + " %"
  ]);
  filas.push(["Etapa", obra.etapa]);

  const datos = document.getElementById("laminaDatos");
  datos.innerHTML = "";
  for (const fila of filas) {
    const caja = nodo("div");
    caja.appendChild(nodo("dt", null, escapar(fila[0])));
    caja.appendChild(nodo("dd", null, escapar(fila[1])));
    datos.appendChild(caja);
  }
}

function pintarPortada(obra) {
  document.getElementById("obraBandera").textContent = obra.bandera;
  document.getElementById("obraNombre").textContent = obra.nombre;
  document.getElementById("obraCiudad").textContent = obra.ciudad;
  document.getElementById("obraPais").textContent = obra.pais;
  document.getElementById("obraResumen").textContent = obra.resumen;

  const chips = document.getElementById("obraChips");
  chips.innerHTML = "";
  chips.appendChild(nodo("span", "chip chip-estado", escapar(obra.estado)));
  chips.appendChild(nodo("span", "chip", escapar(obra.tipo)));
  chips.appendChild(nodo("span", "chip", escapar(obra.etapa)));
  chips.appendChild(
    nodo("span", "chip chip-tenue", "Inicio: " + escapar(obra.inicio))
  );
  chips.appendChild(
    nodo("span", "chip chip-tenue", "Meta: " + escapar(obra.fin))
  );

  // Barra de avance
  const relleno = document.getElementById("avanceRelleno");
  const barra = document.getElementById("avanceBarra");
  const valor = document.getElementById("avanceValor");
  if (obra.avance === null) {
    relleno.style.width = "0%";
    barra.classList.add("avance-sin-dato");
    barra.setAttribute("aria-label", "Avance sin porcentaje oficial");
    valor.textContent = "Sin cifra oficial";
  } else {
    barra.classList.remove("avance-sin-dato");
    barra.setAttribute(
      "aria-label", "Avance de obra: " + obra.avance + " por ciento"
    );
    valor.textContent = obra.avance.toLocaleString("es-MX") + " %";
    // Se anima en el siguiente cuadro para que la transición se vea.
    relleno.style.width = "0%";
    requestAnimationFrame(function () {
      relleno.style.width = obra.avance + "%";
    });
  }
  document.getElementById("avanceNota").textContent = obra.avanceNota;

  // Cifras destacadas
  const cifras = document.getElementById("obraCifras");
  cifras.innerHTML = "";
  for (const cifra of obra.cifras) {
    const caja = nodo("div", "cifra");
    const numero = nodo("strong", "cifra-valor");
    numero.textContent = cifra.valor;
    caja.appendChild(numero);
    if (cifra.unidad) {
      caja.appendChild(nodo("span", "cifra-unidad", escapar(cifra.unidad)));
    }
    caja.appendChild(nodo("span", "cifra-etiqueta", escapar(cifra.etiqueta)));
    cifras.appendChild(caja);
    animarNumero(numero, cifra.valor);
  }

  // Ficha técnica
  const cuerpo = document.getElementById("fichaCuerpo");
  cuerpo.innerHTML = "";
  for (const fila of obra.ficha) {
    const tr = nodo("tr");
    tr.appendChild(nodo("th", "ficha-dato", escapar(fila[0])));
    tr.appendChild(nodo("td", null, escapar(fila[1])));
    cuerpo.appendChild(tr);
  }

  const fuentes = document.getElementById("fichaFuentes");
  fuentes.innerHTML = "";
  for (const fuente of obra.fuentes) {
    const li = nodo("li");
    const enlace = nodo("a", null, escapar(fuente.texto));
    enlace.href = fuente.url;
    enlace.target = "_blank";
    enlace.rel = "noopener";
    li.appendChild(enlace);
    fuentes.appendChild(li);
  }
}

/** Cuenta ascendente para las cifras, respetando el formato original. */
function animarNumero(elemento, textoFinal) {
  const limpio = String(textoFinal).replace(/,/g, "");
  const objetivo = Number(limpio);
  const esAnio = Number.isInteger(objetivo) &&
    objetivo >= 1900 && objetivo <= 2100 &&
    !String(textoFinal).includes(",");

  if (isNaN(objetivo) || esAnio || objetivo === 0) {
    elemento.textContent = textoFinal;
    return;
  }
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elemento.textContent = textoFinal;
    return;
  }

  const decimales = limpio.includes(".") ? limpio.split(".")[1].length : 0;
  const duracion = 900;
  const arranque = performance.now();

  function paso(ahora) {
    const avance = limitar((ahora - arranque) / duracion, 0, 1);
    // Desaceleración suave al final.
    const suave = 1 - Math.pow(1 - avance, 3);
    const parcial = objetivo * suave;
    elemento.textContent = parcial.toLocaleString("es-MX", {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    });
    if (avance < 1) {
      requestAnimationFrame(paso);
    } else {
      elemento.textContent = textoFinal;
    }
  }
  requestAnimationFrame(paso);
}

function pintarVeredicto(riesgo, ventana) {
  const sello = document.getElementById("veredictoSello");
  sello.textContent = riesgo.nivel.sello;
  sello.dataset.nivel = riesgo.nivel.clave;

  document.getElementById("medidorValor").textContent = riesgo.indice;
  document.getElementById("veredicto").dataset.nivel = riesgo.nivel.clave;

  // El mismo veredicto, sobre la ilustración de la obra.
  const indiceLamina = document.getElementById("laminaIndice");
  indiceLamina.dataset.nivel = riesgo.nivel.clave;
  indiceLamina.querySelector("strong").textContent = riesgo.indice;
  indiceLamina.title = riesgo.nivel.sello;

  // El arco del medidor es un círculo recortado con dasharray.
  // El color se fija aquí (y no por variables CSS) para que el arco
  // nunca quede del color neutro mientras se calcula.
  const arco = document.getElementById("medidorArco");
  const perimetro = 2 * Math.PI * 80;
  arco.style.stroke = COLORES_NIVEL[riesgo.nivel.clave] || COLORES_NIVEL.neutro;
  arco.style.strokeDasharray = perimetro + "";
  arco.style.strokeDashoffset = perimetro * (1 - riesgo.indice / 100) + "";

  const dominante = riesgo.factores[0];
  let frase = riesgo.nivel.frase;
  if (riesgo.nivel.clave !== "optimo") {
    frase += " El factor que más pesa es " +
      dominante.nombre.toLowerCase() + ": " + dominante.lectura + ".";
  }
  document.getElementById("veredictoFrase").textContent = frase;

  const lista = document.getElementById("factores");
  lista.innerHTML = "";
  for (const factor of riesgo.factores) {
    const li = nodo("li", "factor");
    li.dataset.nivel = factor.nivel;
    li.innerHTML =
      '<span class="factor-icono" aria-hidden="true">' + factor.icono + '</span>' +
      '<span class="factor-texto">' +
      '<strong>' + escapar(factor.nombre) + '</strong>' +
      '<small>' + escapar(factor.lectura) + '</small>' +
      '</span>' +
      '<span class="factor-barra" aria-hidden="true">' +
      '<i style="width:' + factor.puntos + '%"></i>' +
      '</span>' +
      '<span class="factor-peso">peso ' + factor.peso + '%</span>';
    lista.appendChild(li);
  }

  const caja = document.getElementById("ventana");
  if (ventana) {
    caja.dataset.nivel = ventana.nivel.clave;
    caja.innerHTML =
      '<span class="ventana-icono" aria-hidden="true">🕒</span>' +
      '<span>' +
      '<strong>Mejor ventana en las próximas 24 h: ' +
      ventana.desde + ' a ' + ventana.hasta + '</strong>' +
      '<small>Índice promedio ' + ventana.indice +
      ' · ' + ventana.nivel.sello.toLowerCase() +
      (ventana.conLuz ? ' · con luz de día' : ' · sin luz natural') +
      '</small>' +
      '</span>';
  } else {
    caja.dataset.nivel = "critico";
    caja.innerHTML =
      '<span class="ventana-icono" aria-hidden="true">🕒</span>' +
      '<span><strong>No hay una ventana clara en las próximas 24 horas.</strong>' +
      '<small>Revisa el pronóstico de 7 días para reprogramar.</small></span>';
  }
}

function pintarMetricas(m, clima) {
  const momento = document.getElementById("momentoEtiqueta");
  momento.textContent = clima.icono + "  " + clima.texto +
    (m.esDia ? " · de día" : " · de noche");

  const fichas = [
    {
      icono: "🌡️",
      etiqueta: "Temperatura",
      valor: redondear(m.temp, 1),
      unidad: "°C",
      detalle: "Se siente como " + redondear(m.aparente, 1) + " °C",
      nivel: nivelDePuntos(puntosTemperatura(m.aparente))
    },
    {
      icono: "💧",
      etiqueta: "Humedad relativa",
      valor: redondear(m.humedad, 0),
      unidad: "%",
      detalle: "Punto de rocío " + redondear(m.rocio, 1) + " °C",
      nivel: nivelDePuntos(puntosHumedad(m.humedad))
    },
    {
      icono: "🌧️",
      etiqueta: "Precipitación",
      valor: redondear(m.precipitacion, 1),
      unidad: "mm",
      detalle: "Probabilidad esta hora: " + redondear(m.probabilidad, 0) + " %",
      nivel: nivelDePuntos(puntosLluvia(m.precipitacion || 0, m.probabilidad || 0))
    },
    {
      icono: "💨",
      etiqueta: "Viento",
      valor: redondear(m.viento, 0),
      unidad: "km/h",
      detalle: beaufort(m.viento) + " del " + rumboDe(m.direccion),
      nivel: nivelDePuntos(puntosViento(m.viento, m.rafaga))
    },
    {
      icono: "🌬️",
      etiqueta: "Ráfagas",
      valor: redondear(m.rafaga, 0),
      unidad: "km/h",
      detalle: "Límite de referencia: " + LIMITES.vientoMaximo + " km/h",
      nivel: nivelDePuntos(puntosViento(0, m.rafaga))
    },
    {
      icono: "☁️",
      etiqueta: "Nubosidad",
      valor: redondear(m.nubes, 0),
      unidad: "%",
      detalle: m.nubes >= 80 ? "Cielo cerrado" : m.nubes <= 20 ? "Cielo abierto" : "Cielo mixto",
      nivel: "neutro"
    },
    {
      icono: "🔆",
      etiqueta: "Índice UV",
      valor: redondear(m.uv, 1),
      unidad: "",
      detalle: categoriaUv(m.uv) + " · protección del personal",
      nivel: nivelDePuntos(puntosUv(m.uv))
    },
    {
      icono: "📊",
      etiqueta: "Presión",
      valor: redondear(m.presion, 0),
      unidad: "hPa",
      detalle: "En superficie",
      nivel: "neutro"
    }
  ];

  const contenedor = document.getElementById("metricas");
  contenedor.innerHTML = "";
  for (const ficha of fichas) {
    const caja = nodo("div", "metrica");
    caja.dataset.nivel = ficha.nivel;
    caja.innerHTML =
      '<span class="metrica-icono" aria-hidden="true">' + ficha.icono + '</span>' +
      '<span class="metrica-etiqueta">' + escapar(ficha.etiqueta) + '</span>' +
      '<strong class="metrica-valor">' + ficha.valor +
      (ficha.unidad ? '<em>' + ficha.unidad + '</em>' : '') + '</strong>' +
      '<small class="metrica-detalle">' + escapar(ficha.detalle) + '</small>';
    contenedor.appendChild(caja);
  }
}

function pintarCompas(m) {
  const giro = ((m.direccion || 0) + 180) % 360;
  document.getElementById("compas").innerHTML =
    '<svg viewBox="0 0 200 200" role="img" aria-label="Viento del ' +
    rumboDe(m.direccion) + ' a ' + redondear(m.viento, 0) + ' kilómetros por hora">' +
    '<circle class="compas-fondo" cx="100" cy="100" r="88"/>' +
    '<circle class="compas-aro" cx="100" cy="100" r="88"/>' +
    '<circle class="compas-aro-int" cx="100" cy="100" r="62"/>' +
    '<text class="compas-letra" x="100" y="26" text-anchor="middle">N</text>' +
    '<text class="compas-letra" x="178" y="106" text-anchor="middle">E</text>' +
    '<text class="compas-letra" x="100" y="186" text-anchor="middle">S</text>' +
    '<text class="compas-letra" x="22" y="106" text-anchor="middle">O</text>' +
    '<g class="compas-aguja" style="transform: rotate(' + giro + 'deg)">' +
    '<polygon points="100,34 112,106 100,96 88,106"/>' +
    '<polygon class="compas-cola" points="100,166 109,104 100,112 91,104"/>' +
    '</g>' +
    '<circle class="compas-centro" cx="100" cy="100" r="7"/>' +
    '</svg>';

  const datos = document.getElementById("vientoDatos");
  datos.innerHTML =
    '<div><dt>Velocidad</dt><dd>' + redondear(m.viento, 0) + ' km/h</dd></div>' +
    '<div><dt>Ráfagas</dt><dd>' + redondear(m.rafaga, 0) + ' km/h</dd></div>' +
    '<div><dt>Procedencia</dt><dd>' + rumboDe(m.direccion) + ' · ' +
    redondear(m.direccion, 0) + '°</dd></div>' +
    '<div><dt>Escala</dt><dd>' + beaufort(m.viento) + '</dd></div>' +
    '<div class="viento-aviso" data-nivel="' +
    nivelDePuntos(puntosViento(m.viento, m.rafaga)) + '"><dt>Izajes y colado</dt><dd>' +
    (Math.max(m.viento || 0, m.rafaga || 0) >= LIMITES.vientoMaximo
      ? 'Por encima del límite de referencia de ' + LIMITES.vientoMaximo + ' km/h'
      : 'Dentro del límite de referencia de ' + LIMITES.vientoMaximo + ' km/h') +
    '</dd></div>';
}

function pintarSol(datos) {
  const salida = datos.daily.sunrise[0];
  const puesta = datos.daily.sunset[0];
  const ahora = minutosDe(datos.current.time);
  const minutosSalida = minutosDe(salida);
  const minutosPuesta = minutosDe(puesta);
  const total = minutosPuesta - minutosSalida;
  const avance = limitar((ahora - minutosSalida) / total, 0, 1);

  // Semicírculo: la izquierda es el amanecer, la derecha el atardecer.
  const radio = 120;
  const cx = 150;
  const cy = 140;
  const x = cx - radio * Math.cos(Math.PI * avance);
  const y = cy - radio * Math.sin(Math.PI * avance);

  const restante = minutosPuesta - ahora;
  let mensaje;
  if (restante > 0 && ahora >= minutosSalida) {
    const horas = Math.floor(restante / 60);
    const minutos = restante % 60;
    mensaje = "Quedan " + horas + " h " + minutos + " min de luz natural.";
  } else if (ahora < minutosSalida) {
    const falta = minutosSalida - ahora;
    mensaje = "Amanece en " + Math.floor(falta / 60) + " h " + (falta % 60) + " min.";
  } else {
    mensaje = "La jornada con luz natural ya terminó en el sitio.";
  }

  const horasLuz = Math.floor(total / 60) + " h " + (total % 60) + " min";

  document.getElementById("solCuerpo").innerHTML =
    '<svg class="arco" viewBox="0 0 300 165" role="img" aria-label="Arco solar del día">' +
    '<path class="arco-pista" d="M30 140 A 120 120 0 0 1 270 140"/>' +
    '<path class="arco-recorrido" d="M30 140 A 120 120 0 0 1 270 140" ' +
    'style="stroke-dasharray:' + (Math.PI * radio) + '; stroke-dashoffset:' +
    (Math.PI * radio * (1 - avance)) + '"/>' +
    '<line class="arco-suelo" x1="18" y1="140" x2="282" y2="140"/>' +
    '<circle class="arco-sol" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="13"/>' +
    '<text class="arco-hora" x="30" y="158" text-anchor="middle">' + soloHora(salida) + '</text>' +
    '<text class="arco-hora" x="270" y="158" text-anchor="middle">' + soloHora(puesta) + '</text>' +
    '</svg>' +
    '<p class="sol-mensaje">' + mensaje + '</p>' +
    '<dl class="sol-datos">' +
    '<div><dt>Amanecer</dt><dd>' + soloHora(salida) + '</dd></div>' +
    '<div><dt>Atardecer</dt><dd>' + soloHora(puesta) + '</dd></div>' +
    '<div><dt>Horas de luz</dt><dd>' + horasLuz + '</dd></div>' +
    '<div><dt>UV máximo hoy</dt><dd>' +
    redondear(datos.daily.uv_index_max[0], 1) + ' · ' +
    categoriaUv(datos.daily.uv_index_max[0]) + '</dd></div>' +
    '</dl>';
}

function pintarHoras(datos) {
  const inicio = indiceHoraActual(datos);
  const porHora = datos.hourly;
  const tira = document.getElementById("tiraHoras");
  tira.innerHTML = "";

  for (let i = inicio; i < Math.min(inicio + 24, porHora.time.length); i++) {
    const riesgo = calcularRiesgo({
      aparente: porHora.apparent_temperature[i],
      humedad: porHora.relative_humidity_2m[i],
      precipitacion: porHora.precipitation[i],
      probabilidad: porHora.precipitation_probability[i],
      viento: porHora.wind_speed_10m[i],
      rafaga: porHora.wind_gusts_10m[i],
      uv: porHora.uv_index[i]
    });
    const clima = describirClima(
      porHora.weather_code[i],
      porHora.is_day[i] === 1,
      porHora.precipitation[i]
    );
    const probabilidad = porHora.precipitation_probability[i] || 0;

    const columna = nodo("div", "hora");
    columna.dataset.nivel = riesgo.nivel.clave;
    if (i === inicio) {
      columna.classList.add("hora-ahora");
    }
    columna.innerHTML =
      '<span class="hora-reloj">' +
      (i === inicio ? "ahora" : soloHora(porHora.time[i])) + '</span>' +
      '<span class="hora-icono" aria-hidden="true">' + clima.icono + '</span>' +
      '<span class="hora-temp">' +
      redondear(porHora.temperature_2m[i], 0) + '°</span>' +
      '<span class="hora-grafica" aria-hidden="true">' +
      '<i class="hora-lluvia" style="height:' + limitar(probabilidad, 2, 100) + '%"></i>' +
      '<i class="hora-riesgo" style="height:' + limitar(riesgo.indice, 2, 100) + '%"></i>' +
      '</span>' +
      '<span class="hora-prob">' + Math.round(probabilidad) + '%</span>';
    columna.title = soloHora(porHora.time[i]) + " · " + clima.texto +
      " · índice de riesgo " + riesgo.indice + " (" + riesgo.nivel.sello + ")";
    tira.appendChild(columna);
  }
}

function pintarDias(datos) {
  const porDia = datos.daily;
  const lista = document.getElementById("diasLista");
  lista.innerHTML = "";

  // Escala común para las barras de temperatura de la semana.
  const minimos = porDia.temperature_2m_min.filter(function (v) { return v !== null; });
  const maximos = porDia.temperature_2m_max.filter(function (v) { return v !== null; });
  const piso = Math.min.apply(null, minimos);
  const techo = Math.max.apply(null, maximos);
  const rango = techo - piso || 1;

  for (let i = 0; i < porDia.time.length; i++) {
    const riesgo = calcularRiesgo({
      aparente: porDia.temperature_2m_max[i],
      humedad: 60, // el resumen diario no trae humedad; se usa un valor neutro
      precipitacion: porDia.precipitation_sum[i] / 8,
      probabilidad: porDia.precipitation_probability_max[i],
      viento: porDia.wind_speed_10m_max[i],
      rafaga: porDia.wind_speed_10m_max[i],
      uv: porDia.uv_index_max[i]
    });
    const clima = describirClima(porDia.weather_code[i], true, porDia.precipitation_sum[i]);
    const fecha = new Date(porDia.time[i] + "T12:00:00");
    const nombre = i === 0
      ? "Hoy"
      : DIAS_SEMANA[fecha.getDay()].charAt(0).toUpperCase() +
        DIAS_SEMANA[fecha.getDay()].slice(1);

    const izquierda = ((porDia.temperature_2m_min[i] - piso) / rango) * 100;
    const ancho = ((porDia.temperature_2m_max[i] - porDia.temperature_2m_min[i]) / rango) * 100;

    const fila = nodo("div", "dia");
    fila.dataset.nivel = riesgo.nivel.clave;
    fila.innerHTML =
      '<span class="dia-nombre">' + nombre +
      '<small>' + porDia.time[i].slice(8, 10) + '/' + porDia.time[i].slice(5, 7) + '</small></span>' +
      '<span class="dia-icono" aria-hidden="true" title="' + escapar(clima.texto) + '">' +
      clima.icono + '</span>' +
      '<span class="dia-rango" aria-hidden="true">' +
      '<i style="left:' + izquierda.toFixed(1) + '%; width:' + Math.max(ancho, 4).toFixed(1) + '%"></i>' +
      '</span>' +
      '<span class="dia-temps">' +
      '<strong>' + redondear(porDia.temperature_2m_max[i], 0) + '°</strong>' +
      '<small>' + redondear(porDia.temperature_2m_min[i], 0) + '°</small></span>' +
      '<span class="dia-lluvia">💧 ' + redondear(porDia.precipitation_sum[i], 1) + ' mm' +
      '<small>' + Math.round(porDia.precipitation_probability_max[i] || 0) + '%</small></span>' +
      '<span class="dia-sello" data-nivel="' + riesgo.nivel.clave + '">' +
      riesgo.nivel.sello + '</span>';
    lista.appendChild(fila);
  }
}

function nivelDeIndice(indice) {
  for (const candidato of NIVELES) {
    if (indice < candidato.hasta) {
      return candidato;
    }
  }
  return NIVELES[NIVELES.length - 1];
}

/**
 * Busca el mejor bloque de 4 horas seguidas en las próximas 24.
 * Se exige luz natural, porque un colado se programa en jornada;
 * solo si no hay ningún bloque con luz se admite uno nocturno.
 */
function buscarVentana(datos) {
  const inicio = indiceHoraActual(datos);
  const porHora = datos.hourly;
  const bloque = 4;
  const fin = Math.min(inicio + 24, porHora.time.length) - bloque;
  let conLuz = null;
  let sinLuz = null;

  for (let i = inicio; i <= fin; i++) {
    let suma = 0;
    let hayLuz = true;
    for (let j = i; j < i + bloque; j++) {
      suma += calcularRiesgo({
        aparente: porHora.apparent_temperature[j],
        humedad: porHora.relative_humidity_2m[j],
        precipitacion: porHora.precipitation[j],
        probabilidad: porHora.precipitation_probability[j],
        viento: porHora.wind_speed_10m[j],
        rafaga: porHora.wind_gusts_10m[j],
        uv: porHora.uv_index[j]
      }).indice;
      if (porHora.is_day[j] !== 1) {
        hayLuz = false;
      }
    }
    const promedio = Math.round(suma / bloque);
    const candidato = {
      indice: promedio,
      nivel: nivelDeIndice(promedio),
      conLuz: hayLuz,
      desde: soloHora(porHora.time[i]),
      hasta: soloHora(porHora.time[i + bloque - 1])
    };

    if (hayLuz) {
      if (!conLuz || promedio < conLuz.indice) {
        conLuz = candidato;
      }
    } else if (!sinLuz || promedio < sinLuz.indice) {
      sinLuz = candidato;
    }
  }

  const mejor = conLuz || sinLuz;
  if (mejor && mejor.nivel.clave === "critico") {
    return null;
  }
  return mejor;
}

/* ------------------------------------------------------------
   8. Comparativa de todas las obras
   ------------------------------------------------------------ */

async function pintarFlota() {
  const grid = document.getElementById("flotaGrid");
  grid.innerHTML = "";
  for (const obra of OBRAS) {
    grid.appendChild(
      nodo(
        "div",
        "flota-tarjeta flota-cargando",
        '<span class="bandera flota-bandera" aria-hidden="true">' + obra.bandera + '</span>' +
        '<strong>' + escapar(obra.nombre) + '</strong>' +
        '<small>Consultando…</small>'
      )
    );
  }

  const respuestas = await Promise.allSettled(
    OBRAS.map(function (obra) {
      return fetch(urlResumen(obra)).then(function (r) {
        if (!r.ok) {
          throw new Error("respuesta " + r.status);
        }
        return r.json();
      });
    })
  );

  const filas = [];
  respuestas.forEach(function (respuesta, i) {
    const obra = OBRAS[i];
    if (respuesta.status !== "fulfilled") {
      filas.push({ obra: obra, error: true });
      return;
    }
    const datos = respuesta.value;
    const actual = datos.current;
    const hora = indiceHoraActual(datos);
    const riesgo = calcularRiesgo({
      aparente: actual.apparent_temperature,
      humedad: actual.relative_humidity_2m,
      precipitacion: actual.precipitation,
      probabilidad: datos.hourly.precipitation_probability[hora],
      viento: actual.wind_speed_10m,
      rafaga: actual.wind_gusts_10m,
      uv: datos.hourly.uv_index[hora]
    });
    filas.push({
      obra: obra,
      riesgo: riesgo,
      clima: describirClima(
        actual.weather_code,
        actual.is_day === 1,
        actual.precipitation
      ),
      temp: actual.temperature_2m,
      viento: actual.wind_speed_10m
    });
  });

  filas.sort(function (a, b) {
    if (a.error) return 1;
    if (b.error) return -1;
    return a.riesgo.indice - b.riesgo.indice;
  });

  grid.innerHTML = "";
  for (const fila of filas) {
    const tarjeta = nodo("button", "flota-tarjeta");
    tarjeta.type = "button";
    if (fila.obra === obraActual) {
      tarjeta.classList.add("flota-activa");
    }
    if (fila.error) {
      tarjeta.innerHTML =
        '<span class="bandera flota-bandera" aria-hidden="true">' + fila.obra.bandera + '</span>' +
        '<strong>' + escapar(fila.obra.nombre) + '</strong>' +
        '<small>Sin datos del clima</small>';
    } else {
      tarjeta.dataset.nivel = fila.riesgo.nivel.clave;
      tarjeta.innerHTML =
        '<span class="bandera flota-bandera" aria-hidden="true">' + fila.obra.bandera + '</span>' +
        '<span class="flota-clima" aria-hidden="true">' + fila.clima.icono + '</span>' +
        '<strong>' + escapar(fila.obra.nombre) + '</strong>' +
        '<small>' + escapar(fila.obra.ciudad) + '</small>' +
        '<span class="flota-lectura">' +
        redondear(fila.temp, 0) + '°C · ' + redondear(fila.viento, 0) + ' km/h</span>' +
        '<span class="flota-sello" data-nivel="' + fila.riesgo.nivel.clave + '">' +
        fila.riesgo.indice + ' · ' + fila.riesgo.nivel.sello + '</span>';
    }
    tarjeta.addEventListener("click", function () {
      seleccionarObra(fila.obra);
    });
    grid.appendChild(tarjeta);
  }
}

/* ------------------------------------------------------------
   9. Centro de datos: seguimiento del proyecto
   ------------------------------------------------------------ */

const MESES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic"
];

/** "2026-08" -> "ago 2026" */
function etiquetaFecha(fecha) {
  const anio = fecha.slice(0, 4);
  const mes = Number(fecha.slice(5, 7));
  if (!mes) {
    return anio;
  }
  return MESES[mes - 1] + " " + anio;
}

/** Convierte "2026-08" en un número de meses, para poder restar. */
function mesesDe(fecha) {
  return Number(fecha.slice(0, 4)) * 12 + (Number(fecha.slice(5, 7)) || 1) - 1;
}

function mesesHoy() {
  const ahora = new Date();
  return ahora.getFullYear() * 12 + ahora.getMonth();
}

/** Tarjetas grandes con las cifras que resumen la semana. */
function pintarKpis(datos, riesgo, obra) {
  const porDia = datos.daily;
  const porHora = datos.hourly;
  const inicio = indiceHoraActual(datos);

  let diasAptos = 0;
  let lluviaSemana = 0;
  for (let i = 0; i < porDia.time.length; i++) {
    const riesgoDia = calcularRiesgo({
      aparente: porDia.temperature_2m_max[i],
      humedad: 60,
      precipitacion: porDia.precipitation_sum[i] / 8,
      probabilidad: porDia.precipitation_probability_max[i],
      viento: porDia.wind_speed_10m_max[i],
      rafaga: porDia.wind_speed_10m_max[i],
      uv: porDia.uv_index_max[i]
    });
    if (riesgoDia.nivel.clave === "optimo" || riesgoDia.nivel.clave === "aceptable") {
      diasAptos++;
    }
    lluviaSemana += porDia.precipitation_sum[i] || 0;
  }

  let horasAptas = 0;
  const fin = Math.min(inicio + 24, porHora.time.length);
  for (let i = inicio; i < fin; i++) {
    const riesgoHora = calcularRiesgo({
      aparente: porHora.apparent_temperature[i],
      humedad: porHora.relative_humidity_2m[i],
      precipitacion: porHora.precipitation[i],
      probabilidad: porHora.precipitation_probability[i],
      viento: porHora.wind_speed_10m[i],
      rafaga: porHora.wind_gusts_10m[i],
      uv: porHora.uv_index[i]
    });
    if (riesgoHora.indice < 40) {
      horasAptas++;
    }
  }

  const linea = CRONOLOGIA[obra.id];
  const mesesRestantes = linea ? mesesDe(linea.hasta) - mesesHoy() : null;

  const tarjetas = [
    {
      icono: "📅",
      valor: diasAptos,
      unidad: "de 7",
      etiqueta: "Días aptos para colar",
      detalle: "En el pronóstico de la semana",
      nivel: diasAptos >= 5 ? "optimo" : diasAptos >= 3 ? "aceptable" : "precaucion"
    },
    {
      icono: "⏱️",
      valor: horasAptas,
      unidad: "de 24",
      etiqueta: "Horas aptas",
      detalle: "Con índice de riesgo por debajo de 40",
      nivel: horasAptas >= 14 ? "optimo" : horasAptas >= 7 ? "aceptable" : "precaucion"
    },
    {
      icono: "🌧️",
      valor: redondear(lluviaSemana, 1),
      unidad: "mm",
      etiqueta: "Lluvia de la semana",
      detalle: "Acumulado de los próximos 7 días",
      nivel: lluviaSemana > 40 ? "critico" : lluviaSemana > 12 ? "precaucion" : "optimo"
    },
    {
      icono: "🎯",
      valor: mesesRestantes === null
        ? "—"
        : (mesesRestantes > 0 ? mesesRestantes : 0),
      unidad: mesesRestantes === null ? "" : "meses",
      etiqueta: "Para la meta",
      detalle: linea ? "Meta: " + etiquetaFecha(linea.hasta) : "Sin fecha registrada",
      nivel: "neutro"
    },
    {
      icono: "⚠️",
      valor: riesgo.indice,
      unidad: "/100",
      etiqueta: "Riesgo ahora",
      detalle: riesgo.nivel.sello,
      nivel: riesgo.nivel.clave
    }
  ];

  const tablero = document.getElementById("tableroKpi");
  tablero.innerHTML = "";
  for (const tarjeta of tarjetas) {
    const caja = nodo("div", "kpi");
    caja.dataset.nivel = tarjeta.nivel;
    caja.innerHTML =
      '<span class="kpi-icono" aria-hidden="true">' + tarjeta.icono + '</span>' +
      '<strong class="kpi-valor">' + tarjeta.valor +
      (tarjeta.unidad ? '<em>' + tarjeta.unidad + '</em>' : '') + '</strong>' +
      '<span class="kpi-etiqueta">' + escapar(tarjeta.etiqueta) + '</span>' +
      '<small class="kpi-detalle">' + escapar(tarjeta.detalle) + '</small>';
    tablero.appendChild(caja);
  }

  document.getElementById("centroSello").textContent =
    diasAptos + " de 7 días aptos · " + horasAptas + " de 24 horas aptas";
}

/**
 * Compara cuánto calendario lleva corrido la obra contra cuánto
 * avance reporta. Si el avance va por delante del tiempo, la obra
 * va holgada; si va por detrás, va apretada.
 */
function pintarCalendario(obra) {
  const linea = CRONOLOGIA[obra.id];
  const pista = document.getElementById("calendarioPista");
  const nota = document.getElementById("calendarioNota");

  if (!linea) {
    pista.hidden = true;
    nota.textContent = "Esta obra no tiene fechas registradas.";
    return;
  }
  pista.hidden = false;

  const total = mesesDe(linea.hasta) - mesesDe(linea.desde);
  const corrido = mesesHoy() - mesesDe(linea.desde);
  const tiempo = limitar((corrido / total) * 100, 0, 100);

  document.getElementById("calendarioDesde").textContent =
    "Inicio · " + etiquetaFecha(linea.desde);
  document.getElementById("calendarioHasta").textContent =
    "Meta · " + etiquetaFecha(linea.hasta);

  const barraTiempo = document.getElementById("calendarioTiempo");
  const barraAvance = document.getElementById("calendarioAvance");
  const marca = document.getElementById("calendarioHoy");
  barraTiempo.style.width = "0%";
  barraAvance.style.width = "0%";
  requestAnimationFrame(function () {
    barraTiempo.style.width = tiempo.toFixed(1) + "%";
    barraAvance.style.width = (obra.avance === null ? 0 : obra.avance) + "%";
  });
  marca.style.left = tiempo.toFixed(1) + "%";

  const veredicto = document.getElementById("calendarioVeredicto");
  if (obra.avance === null) {
    veredicto.textContent = Math.round(tiempo) + " % del calendario";
    veredicto.dataset.nivel = "neutro";
    nota.textContent =
      "Lleva " + Math.round(tiempo) + " % del calendario corrido. " +
      "No hay porcentaje de avance oficial con el cual compararlo. " +
      "Las fechas son aproximadas: varios proyectos solo publican el año.";
    return;
  }

  const diferencia = obra.avance - tiempo;
  let texto;
  let nivel;
  if (diferencia >= 8) {
    texto = "Avance por delante del calendario";
    nivel = "optimo";
  } else if (diferencia >= -8) {
    texto = "Avance a la par del calendario";
    nivel = "aceptable";
  } else {
    texto = "Avance por detrás del calendario";
    nivel = "precaucion";
  }
  veredicto.textContent = texto;
  veredicto.dataset.nivel = nivel;
  nota.textContent =
    "Lleva " + Math.round(tiempo) + " % del calendario corrido contra " +
    obra.avance + " % de avance reportado: " +
    (diferencia >= 0 ? "+" : "") + Math.round(diferencia) +
    " puntos. Las fechas son aproximadas, porque varios proyectos solo publican el año.";
}

function pintarCronologia(obra) {
  const linea = CRONOLOGIA[obra.id];
  const lista = document.getElementById("cronologia");
  lista.innerHTML = "";
  if (!linea) {
    return;
  }
  const hoy = mesesHoy();
  for (const hito of linea.hitos) {
    const cumplido = mesesDe(hito.fecha) <= hoy;
    const item = nodo("li", "hito");
    item.dataset.estado = cumplido ? "cumplido" : "pendiente";
    item.innerHTML =
      '<span class="hito-punto" aria-hidden="true"></span>' +
      '<span class="hito-fecha">' + etiquetaFecha(hito.fecha) + '</span>' +
      '<span class="hito-texto">' + escapar(hito.texto) + '</span>' +
      '<span class="hito-marca">' + (cumplido ? "cumplido" : "previsto") + '</span>';
    lista.appendChild(item);
  }
}

/* ------------------------------------------------------------
   10. Acciones del panel
   ------------------------------------------------------------ */

let avisoTemporizador = null;

/** Mensajito de confirmación en la esquina. */
function avisar(texto, esError) {
  const aviso = document.getElementById("aviso");
  aviso.textContent = texto;
  aviso.classList.toggle("aviso-error", Boolean(esError));
  aviso.classList.add("visible");
  if (avisoTemporizador) {
    clearTimeout(avisoTemporizador);
  }
  avisoTemporizador = setTimeout(function () {
    aviso.classList.remove("visible");
  }, 3200);
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (error) {
    // Sin permiso de portapapeles: se copia con el método viejo.
    try {
      const caja = document.createElement("textarea");
      caja.value = texto;
      caja.style.position = "fixed";
      caja.style.opacity = "0";
      document.body.appendChild(caja);
      caja.select();
      const bien = document.execCommand("copy");
      document.body.removeChild(caja);
      return bien;
    } catch (otro) {
      return false;
    }
  }
}

/** Reporte en texto plano, listo para pegar en un chat de obra. */
function armarReporte() {
  if (!datosActuales) {
    return null;
  }
  const obra = obraActual;
  const m = muestraDeActual(datosActuales);
  const clima = describirClima(m.codigo, m.esDia, m.precipitacion);
  const riesgo = calcularRiesgo(m);
  const ventana = buscarVentana(datosActuales);

  const lineas = [
    "CLIMA DE OBRA — " + obra.nombre,
    obra.ciudad + " · hora local " + soloHora(datosActuales.current.time),
    "",
    "VEREDICTO: " + riesgo.nivel.sello + " (índice " + riesgo.indice + "/100)",
    ventana
      ? "Mejor ventana 24 h: " + ventana.desde + " a " + ventana.hasta +
        " (índice " + ventana.indice + ")"
      : "Sin ventana recomendable en las próximas 24 h.",
    "",
    "CONDICIONES",
    "Cielo: " + clima.texto,
    "Temperatura: " + redondear(m.temp, 1) + " °C (se siente " + redondear(m.aparente, 1) + " °C)",
    "Humedad: " + redondear(m.humedad, 0) + " %",
    "Precipitación: " + redondear(m.precipitacion, 1) + " mm",
    "Viento: " + redondear(m.viento, 0) + " km/h del " + rumboDe(m.direccion) +
      ", ráfagas " + redondear(m.rafaga, 0) + " km/h",
    "Índice UV: " + redondear(m.uv, 1) + " (" + categoriaUv(m.uv) + ")",
    "",
    "FACTORES EN CONTRA"
  ];
  for (const factor of riesgo.factores) {
    lineas.push("- " + factor.nombre + ": " + factor.lectura);
  }
  lineas.push("");
  lineas.push("Datos de Open-Meteo. El índice es orientativo y no sustituye");
  lineas.push("el criterio del residente de obra.");
  return lineas.join("\n");
}

/** Pronóstico de 24 h y de 7 días en una hoja de cálculo. */
function armarCsv() {
  if (!datosActuales) {
    return null;
  }
  const porHora = datosActuales.hourly;
  const porDia = datosActuales.daily;
  const inicio = indiceHoraActual(datosActuales);
  const filas = [];

  filas.push("obra;" + obraActual.nombre);
  filas.push("ciudad;" + obraActual.ciudad);
  filas.push("");
  filas.push("bloque;momento;temperatura_c;sensacion_c;humedad_pct;lluvia_mm;prob_lluvia_pct;viento_kmh;rafaga_kmh;uv;indice_riesgo;veredicto");

  for (let i = inicio; i < Math.min(inicio + 24, porHora.time.length); i++) {
    const riesgo = calcularRiesgo({
      aparente: porHora.apparent_temperature[i],
      humedad: porHora.relative_humidity_2m[i],
      precipitacion: porHora.precipitation[i],
      probabilidad: porHora.precipitation_probability[i],
      viento: porHora.wind_speed_10m[i],
      rafaga: porHora.wind_gusts_10m[i],
      uv: porHora.uv_index[i]
    });
    filas.push([
      "hora", porHora.time[i],
      porHora.temperature_2m[i], porHora.apparent_temperature[i],
      porHora.relative_humidity_2m[i], porHora.precipitation[i],
      porHora.precipitation_probability[i], porHora.wind_speed_10m[i],
      porHora.wind_gusts_10m[i], porHora.uv_index[i],
      riesgo.indice, riesgo.nivel.sello
    ].join(";"));
  }

  for (let i = 0; i < porDia.time.length; i++) {
    const riesgo = calcularRiesgo({
      aparente: porDia.temperature_2m_max[i],
      humedad: 60,
      precipitacion: porDia.precipitation_sum[i] / 8,
      probabilidad: porDia.precipitation_probability_max[i],
      viento: porDia.wind_speed_10m_max[i],
      rafaga: porDia.wind_speed_10m_max[i],
      uv: porDia.uv_index_max[i]
    });
    filas.push([
      "dia", porDia.time[i],
      porDia.temperature_2m_max[i], porDia.temperature_2m_min[i],
      "", porDia.precipitation_sum[i],
      porDia.precipitation_probability_max[i], porDia.wind_speed_10m_max[i],
      "", porDia.uv_index_max[i],
      riesgo.indice, riesgo.nivel.sello
    ].join(";"));
  }
  return filas.join("\n");
}

function descargar(nombre, contenido, tipo) {
  const blob = new Blob(["﻿" + contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1000);
}

/* --- Tema manual: automático, claro u oscuro --- */

const TEMAS = ["auto", "claro", "oscuro"];
const NOMBRES_TEMA = {
  auto: "automático",
  claro: "claro",
  oscuro: "oscuro"
};
let temaElegido = "auto";

function leerTemaGuardado() {
  try {
    const guardado = localStorage.getItem("clima-obra-tema");
    if (TEMAS.indexOf(guardado) !== -1) {
      temaElegido = guardado;
    }
  } catch (error) {
    // Sin almacenamiento disponible: se queda en automático.
  }
  aplicarTema();
}

function aplicarTema() {
  document.getElementById("accionTema").innerHTML =
    '<span aria-hidden="true">🌗</span> Tema: ' + NOMBRES_TEMA[temaElegido];
  if (temaElegido === "claro") {
    document.body.dataset.momento = "dia";
  } else if (temaElegido === "oscuro") {
    document.body.dataset.momento = "noche";
  } else if (datosActuales) {
    document.body.dataset.momento =
      datosActuales.current.is_day === 1 ? "dia" : "noche";
  }
}

function girarTema() {
  temaElegido = TEMAS[(TEMAS.indexOf(temaElegido) + 1) % TEMAS.length];
  try {
    localStorage.setItem("clima-obra-tema", temaElegido);
  } catch (error) {
    // No se puede recordar, pero el cambio sí se aplica.
  }
  aplicarTema();
  avisar("Tema " + NOMBRES_TEMA[temaElegido] + ".");
}

function conectarAcciones() {
  document.getElementById("accionReporte")
    .addEventListener("click", async function () {
      const reporte = armarReporte();
      if (!reporte) {
        avisar("Todavía no hay datos que reportar.", true);
        return;
      }
      const bien = await copiarTexto(reporte);
      avisar(
        bien
          ? "Reporte copiado: ya lo puedes pegar en el chat de la obra."
          : "No se pudo copiar el reporte.",
        !bien
      );
    });

  document.getElementById("accionCsv")
    .addEventListener("click", function () {
      const csv = armarCsv();
      if (!csv) {
        avisar("Todavía no hay datos que descargar.", true);
        return;
      }
      descargar(
        "clima-obra-" + obraActual.id + ".csv",
        csv,
        "text/csv;charset=utf-8;"
      );
      avisar("CSV descargado con las 24 horas y los 7 días.");
    });

  document.getElementById("accionCompartir")
    .addEventListener("click", async function () {
      const enlace = location.origin + location.pathname + "?obra=" + obraActual.id;
      const titulo = "Clima de obra — " + obraActual.nombre;
      if (navigator.share) {
        try {
          await navigator.share({ title: titulo, url: enlace });
          return;
        } catch (error) {
          // Si se cancela el diálogo no hay nada que avisar.
          if (error && error.name === "AbortError") {
            return;
          }
        }
      }
      const bien = await copiarTexto(enlace);
      avisar(bien ? "Enlace copiado." : "No se pudo copiar el enlace.", !bien);
    });

  document.getElementById("accionMapa")
    .addEventListener("click", function () {
      window.open(
        "https://www.openstreetmap.org/?mlat=" + obraActual.lat +
        "&mlon=" + obraActual.lon + "#map=15/" + obraActual.lat + "/" + obraActual.lon,
        "_blank",
        "noopener"
      );
    });

  document.getElementById("accionImprimir")
    .addEventListener("click", function () {
      window.print();
    });

  document.getElementById("accionTema")
    .addEventListener("click", girarTema);

  document.getElementById("accionPantalla")
    .addEventListener("click", async function () {
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        } else {
          await document.documentElement.requestFullscreen();
        }
      } catch (error) {
        avisar("Este navegador no dejó abrir la pantalla completa.", true);
      }
    });
}

/* ------------------------------------------------------------
   11. Reloj de la obra
   ------------------------------------------------------------ */

function arrancarReloj() {
  if (relojIntervalo) {
    clearInterval(relojIntervalo);
  }
  dibujarReloj();
  relojIntervalo = setInterval(dibujarReloj, 1000);
}

function dibujarReloj() {
  const ahora = new Date(Date.now() + desfaseSitio * 1000);
  const horas = String(ahora.getUTCHours()).padStart(2, "0");
  const minutos = String(ahora.getUTCMinutes()).padStart(2, "0");
  const segundos = String(ahora.getUTCSeconds()).padStart(2, "0");
  document.getElementById("relojHora").textContent =
    horas + ":" + minutos + ":" + segundos;
}

/* ------------------------------------------------------------
   12. Carga y orquestación
   ------------------------------------------------------------ */

function marcarEstado(texto) {
  document.getElementById("ultima-actualizacion").textContent = texto;
}

function ponerCargando(cargando) {
  document.body.classList.toggle("cargando", cargando);
  document.getElementById("actualizar").disabled = cargando;
}

async function cargarObra() {
  const obra = obraActual;
  const consulta = ++consultaEnCurso;
  ponerCargando(true);
  marcarEstado("Consultando el clima en " + obra.ciudad + "…");

  try {
    const respuesta = await fetch(urlDe(obra));
    if (!respuesta.ok) {
      throw new Error("La API respondió " + respuesta.status);
    }
    const datos = await respuesta.json();

    // Si el usuario cambió de obra mientras esperábamos, descartamos.
    if (consulta !== consultaEnCurso) {
      return;
    }

    datosActuales = datos;
    desfaseSitio = datos.utc_offset_seconds || 0;
    document.getElementById("relojZona").textContent =
      (datos.timezone_abbreviation || "hora local") + " · en sitio";
    arrancarReloj();

    const m = muestraDeActual(datos);
    const clima = describirClima(m.codigo, m.esDia, m.precipitacion);
    const riesgo = calcularRiesgo(m);
    const ventana = buscarVentana(datos);

    pintarVeredicto(riesgo, ventana);
    pintarKpis(datos, riesgo, obra);
    pintarMetricas(m, clima);
    pintarCompas(m);
    pintarSol(datos);
    pintarHoras(datos);
    pintarDias(datos);
    construirEscena(clima, m);

    marcarEstado(
      "Datos de Open-Meteo para " + obra.ciudad +
      " · hora local del sitio " + soloHora(datos.current.time) +
      " · consultado a las " + new Date().toLocaleTimeString("es-MX") +
      " de tu zona."
    );
  } catch (error) {
    console.error("Error al cargar " + obra.nombre, error);
    if (consulta !== consultaEnCurso) {
      return;
    }
    marcarEstado(
      "No se pudo consultar el clima (" + error.message +
      "). Revisa tu conexión y vuelve a intentar con la tecla R."
    );
    document.getElementById("veredictoSello").textContent = "Sin datos";
    document.getElementById("veredictoSello").dataset.nivel = "neutro";
    document.getElementById("veredictoFrase").textContent =
      "No hay información del clima para evaluar el colado en este momento.";
    document.getElementById("medidorValor").textContent = "--";
  } finally {
    if (consulta === consultaEnCurso) {
      ponerCargando(false);
    }
  }
}

function seleccionarObra(obra) {
  obraActual = obra;
  try {
    // Deja la obra en la URL para poder compartir el enlace.
    history.replaceState(null, "", "?obra=" + obra.id);
  } catch (error) {
    // En file:// el navegador no permite cambiar la URL: no pasa nada.
  }
  pintarPortada(obra);
  pintarLamina(obra);
  pintarCalendario(obra);
  pintarCronologia(obra);
  pintarListaProyectos();
  actualizarBoton();
  cerrarPanel();
  cargarObra();
  document.querySelectorAll(".flota-tarjeta").forEach(function (tarjeta) {
    tarjeta.classList.remove("flota-activa");
  });
}

function moverObra(paso) {
  const indice = OBRAS.indexOf(obraActual);
  const siguiente = (indice + paso + OBRAS.length) % OBRAS.length;
  seleccionarObra(OBRAS[siguiente]);
}

function actualizarBoton() {
  document.getElementById("btnProyectoNombre").textContent = obraActual.nombre;
  document.getElementById("btnProyectoBandera").textContent = obraActual.bandera;
}

function pintarListaProyectos() {
  const lista = document.getElementById("listaProyectos");
  lista.innerHTML = "";
  for (const obra of OBRAS) {
    const boton = nodo("button", "proyecto-opcion");
    boton.type = "button";
    if (obra === obraActual) {
      boton.classList.add("activo");
      boton.setAttribute("aria-current", "true");
    }
    boton.innerHTML =
      '<span class="bandera proyecto-bandera" aria-hidden="true">' + obra.bandera + '</span>' +
      '<span class="proyecto-texto">' +
      '<strong>' + escapar(obra.nombre) + '</strong>' +
      '<small>' + escapar(obra.ciudad) + '</small>' +
      '<em>' + escapar(obra.tipo) + '</em>' +
      '</span>' +
      '<span class="proyecto-avance">' +
      (obra.avance === null ? "—" : obra.avance + "%") + '</span>';
    boton.addEventListener("click", function () {
      seleccionarObra(obra);
    });
    lista.appendChild(boton);
  }
}

function cerrarPanel() {
  document.getElementById("panelProyectos").classList.remove("abierto");
  document.getElementById("btnProyecto").setAttribute("aria-expanded", "false");
}

/* ------------------------------------------------------------
   13. Aparición de secciones al hacer scroll
   ------------------------------------------------------------ */

function activarRevelado() {
  const secciones = document.querySelectorAll(".revelable");
  if (!("IntersectionObserver" in window)) {
    secciones.forEach(function (s) { s.classList.add("visible"); });
    return;
  }
  const observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { rootMargin: "0px 0px -60px 0px", threshold: 0.05 });

  secciones.forEach(function (seccion) {
    observador.observe(seccion);
  });
}

/* ------------------------------------------------------------
   14. Eventos
   ------------------------------------------------------------ */

document.getElementById("btnProyecto").addEventListener("click", function () {
  const abierto = document
    .getElementById("panelProyectos")
    .classList.toggle("abierto");
  this.setAttribute("aria-expanded", abierto ? "true" : "false");
});

document.getElementById("actualizar").addEventListener("click", function () {
  cargarObra();
  pintarFlota();
});

document.addEventListener("keydown", function (evento) {
  const etiqueta = (evento.target.tagName || "").toLowerCase();
  if (etiqueta === "input" || etiqueta === "textarea") {
    return;
  }
  if (evento.key === "ArrowRight") {
    moverObra(1);
  } else if (evento.key === "ArrowLeft") {
    moverObra(-1);
  } else if (evento.key === "r" || evento.key === "R") {
    cargarObra();
    pintarFlota();
  } else if (evento.key === "Escape") {
    cerrarPanel();
  }
});

// Refresco automático cada 10 minutos.
setInterval(function () {
  cargarObra();
}, 10 * 60 * 1000);

/* ------------------------------------------------------------
   15. Arranque
   ------------------------------------------------------------ */

pintarPortada(obraActual);
pintarLamina(obraActual);
pintarCalendario(obraActual);
pintarCronologia(obraActual);
conectarAcciones();
leerTemaGuardado();
pintarListaProyectos();
actualizarBoton();
activarRevelado();
cargarObra();
pintarFlota();
