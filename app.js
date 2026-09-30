const url = "https://api.open-meteo.com/v1/forecast?latitude=21.03829&longitude=-105.25024&current=temperature_2m%2Crelative_humidity_2m%2Cprecipitation%2Cwind_speed_10m&timezone=America%2FMazatlan";

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

  } catch (error) {
    console.error("Ocurrió un error:", error);

    document.getElementById("humedad").textContent = "Error al cargar el clima";
    document.getElementById("precipitacion").textContent = "Error al cargar el clima";
    document.getElementById("temperatura").textContent = "Error al cargar el clima";
    document.getElementById("viento").textContent = "Error al cargar el clima";
  }
}

cargarClima();
document.getElementById("actualizar").addEventListener("click", cargarClima);
