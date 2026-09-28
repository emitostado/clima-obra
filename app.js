const url = "https://api.open-meteo.com/v1/forecast?latitude=21.03829&longitude=-105.25024&current=temperature_2m%2Crelative_humidity_2m%2Cprecipitation%2Cwind_speed_10m&timezone=America%2FMazatlan";

async function cargarClima() {
  const respuesta = await fetch(url);
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
}

cargarClima();
