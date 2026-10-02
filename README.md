# Clima-obra

## ¿Qué hace la página?
La página es un panel de clima para obras de construcción. Para la obra que elijas muestra:

- Las **condiciones actuales**: temperatura y sensación térmica, humedad, punto de rocío, precipitación, viento, ráfagas, nubosidad, índice UV y presión.
- Un **índice de riesgo de colado** del 0 al 100, con el veredicto (apto, apto con vigilancia, precaución o suspender) y el desglose de qué factor pesa más.
- La **mejor ventana de 4 horas** con luz de día para colar dentro de las próximas 24 horas.
- El **pronóstico hora por hora** de las siguientes 24 horas y el de **7 días**, con el veredicto de cada día.
- La **rosa de los vientos** y el **arco solar** con las horas de luz que quedan en el sitio.
- Una **comparativa de todas las obras** ordenadas de menor a mayor riesgo.
- La **ficha técnica** de la obra con sus fuentes.

Y un **centro de datos** para seguir el proyecto:

- Cinco cifras de la semana: días aptos para colar de 7, horas aptas de 24, lluvia acumulada, meses que faltan para la meta y el riesgo de ahora.
- Un **calendario de la obra** que compara cuánto del plazo lleva corrido contra el avance reportado, y dice si va por delante o por detrás.
- La **cronología** con los hitos publicados de cada proyecto, marcando los cumplidos.

## Acciones

- **Copiar reporte** — deja en el portapapeles un resumen en texto listo para pegar en el chat de la obra.
- **Descargar CSV** — las 24 horas y los 7 días con su índice de riesgo, para abrirlo en Excel.
- **Compartir** — usa el menú del sistema si existe; si no, copia el enlace de la obra.
- **Ver en el mapa** — abre las coordenadas del sitio en OpenStreetMap.
- **Imprimir** — hoja limpia en blanco y negro, sin fondo ni botones.
- **Tema** — automático, claro u oscuro; la elección se recuerda.
- **Pantalla completa** — para dejar el panel en una pantalla de obra.

El panel va en dos columnas: a la izquierda toda la información y a la derecha la obra dibujada, que se queda fija mientras bajas. Las ilustraciones son propias, hechas en SVG, y toman el color del tema: de noche se les encienden las ventanas. Además la silueta de la obra vuela por el fondo, muy tenue, junto con el clima.

El fondo cambia según el clima real del sitio: llueve con gotas inclinadas por el viento que de verdad sopla, caen rayos en las tormentas, el sol gira sus rayos, hay nubes, niebla, nieve o estrellas. Cuando en la obra ya es de noche, todo el panel pasa a tema oscuro.

### Liga pública
La página está publicada en GitHub Pages.

http://emitostado.github.io/clima-obra/

Se puede abrir una obra directamente con el parámetro `?obra=`, por ejemplo
`http://emitostado.github.io/clima-obra/?obra=jeddah-tower`.

## ¿Qué obras muestra?
Son siete megaproyectos reales que están en construcción, con cifras tomadas de fuentes públicas (prensa, portales oficiales y Wikipedia). Cada obra cita sus fuentes en la ficha técnica.

| Obra | Lugar | Qué es |
| --- | --- | --- |
| Torre Rise | Monterrey, México | El edificio más alto de América Latina (484 m) |
| Tren México–Querétaro | México | 232.4 km de vía férrea de pasajeros |
| Metro de Bogotá, Línea 1 | Colombia | 23.9 km de metro elevado y 16 estaciones |
| Jeddah Tower | Arabia Saudita | Será el primer edificio de más de 1 km |
| HS2 — Old Oak Common | Reino Unido | Estación de alta velocidad y túneles a Euston |
| Sydney Metro West | Australia | 24 km de túneles gemelos y 9 estaciones |
| Hinkley Point C | Reino Unido | La primera central nuclear británica desde 1995 |

## ¿Qué API usa?
La API de [Open-Meteo](https://open-meteo.com/), que es de uso libre y no pide llave. Se le piden tres bloques: `current` para el ahora, `hourly` para las 24 horas y `daily` para los 7 días.

## ¿Cómo correrla en mi computadora?
Hay que descargar o clonar los archivos y abrir `index.html` en un navegador. Se necesita conexión a Internet para que la página pueda obtener los datos de Open-Meteo.

## Archivos
- `index.html` — la estructura del panel.
- `estilos.css` — los estilos, el tema de día y de noche, y las animaciones del clima.
- `datos.js` — el catálogo de obras con sus cifras y sus fuentes.
- `siluetas.js` — las ilustraciones en SVG de cada obra.
- `app.js` — la consulta a la API, el cálculo del riesgo y el pintado del panel.

## Atajos
`←` `→` cambiar de obra · `R` actualizar · `Esc` cerrar el panel de obras.

## Aviso
El índice de riesgo es una heurística propia que pondera lluvia, viento, temperatura, humedad y radiación UV. Es orientativo y no sustituye el criterio del residente de obra ni la norma del proyecto.

## ¿Qué aprendí?
Aprendí cómo funciona una página web y cómo se comunica con un servidor mediante peticiones HTTP. También aprendí a utilizar una API para obtener datos del clima, a leer información en formato JSON y a acceder a sus datos mediante rutas con punto. Además, aprendí a utilizar la pestaña Network y la consola de DevTools para identificar errores, y a utilizar try...catch para manejar errores en JavaScript.

Después aprendí a separar los datos de la lógica poniéndolos en su propio archivo, a recorrer arreglos para pintar listas y tarjetas, a calcular valores propios a partir de los datos de la API (el índice de riesgo), a usar variables de CSS para cambiar todo el tema de la página de una sola vez, y a animar elementos con CSS a partir de datos reales.
