const url = "https://api.open-meteo.com/v1/forecast?latitude=19.43&longitude=-99.13&current=temperature_2m,wind_speed_10m";

async function cargarClima() {
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  console.log(datos);

  const temp = datos.current.temperature_2m;
  const viento = datos.current.wind_speed_10m;

  document.getElementById("temperatura").textContent = "Temperatura: " + temp + " °C";
  document.getElementById("viento").textContent = "Viento: " + viento + " km/h";
}

cargarClima();
