/* ============================================================
   datos.js — Catálogo de obras

   Son proyectos REALES en construcción, con cifras tomadas de
   fuentes públicas (prensa, portales oficiales y Wikipedia).
   Cada obra guarda sus fuentes en "fuentes" para poder citarlas.

   Las coordenadas son del sitio o del frente de obra principal,
   con precisión suficiente para el pronóstico del clima.
   Última revisión de las cifras: octubre de 2026.
   ============================================================ */

const OBRAS = [
  {
    id: "torre-rise",
    nombre: "Torre Rise",
    ciudad: "San Pedro Garza García, Nuevo León",
    pais: "México",
    bandera: "🇲🇽",
    lat: 25.6494,
    lon: -100.3489,
    tipo: "Rascacielos de usos mixtos",
    etapa: "Estructura y muro cortina",
    estado: "En ejecución",
    inicio: "2021",
    fin: "Finales de 2026 – principios de 2027 (meta)",
    avance: 85,
    avanceNota:
      "Estimación por altura: la estructura superó los 400 m de los 484 m proyectados (septiembre de 2026). No hay porcentaje oficial publicado.",
    resumen:
      "Será el edificio más alto de América Latina y el 13.º del mundo: 484 m de altura total, de los cuales 408 m son habitables y 76 m corresponden a la aguja arquitectónica.",
    cifras: [
      { valor: "484", unidad: "m", etiqueta: "Altura total" },
      { valor: "96", unidad: "niveles", etiqueta: "Pisos" },
      { valor: "408", unidad: "m", etiqueta: "Altura habitable" },
      { valor: "76", unidad: "m", etiqueta: "Aguja" }
    ],
    ficha: [
      ["Altura total", "484 m"],
      ["Altura habitable", "408 m"],
      ["Aguja arquitectónica", "76 m"],
      ["Niveles", "96"],
      [
        "Distribución",
        "35 niveles de oficinas, 22 de residencias, 10 de hotel, 4 comerciales y 14 de estacionamiento"
      ],
      ["Posición mundial", "13.º edificio más alto del planeta (proyectado)"],
      ["Estado a sep. 2026", "Más de 400 m de altura y 96 losas construidas"]
    ],
    fuentes: [
      {
        texto: "Wikipedia — Torre Rise",
        url: "https://en.wikipedia.org/wiki/Torre_Rise"
      },
      {
        texto: "La Silla Rota — agosto de 2026",
        url: "https://lasillarota.com/estados/2026/8/7/torre-rise-el-edificio-mas-alto-de-america-latina-se-construye-en-mon-523701.html"
      }
    ]
  },
  {
    id: "tren-mexico-queretaro",
    nombre: "Tren México–Querétaro",
    ciudad: "Querétaro, Qro. (frente norte)",
    pais: "México",
    bandera: "🇲🇽",
    lat: 20.5888,
    lon: -100.3899,
    tipo: "Ferrocarril de pasajeros",
    etapa: "Terracerías, viaductos y estaciones",
    estado: "En ejecución",
    inicio: "2025",
    fin: "Primeros tramos en 2027",
    avance: 30.3,
    avanceNota: "Cifra oficial reportada en septiembre de 2026.",
    resumen:
      "232.4 km de vía entre la Ciudad de México y Querétaro, pasando por el Estado de México e Hidalgo. Es el tren de pasajeros con mayor longitud e inversión de los que se construyen hoy en México.",
    cifras: [
      { valor: "232.4", unidad: "km", etiqueta: "Longitud" },
      { valor: "14", unidad: "frentes", etiqueta: "Frentes activos" },
      { valor: "18,200", unidad: "personas", etiqueta: "Trabajadores" },
      { valor: "6", unidad: "estaciones", etiqueta: "Estaciones" }
    ],
    ficha: [
      ["Longitud", "232.4 km"],
      ["Inversión", "143,435 millones de pesos"],
      ["Estaciones de pasajeros", "6"],
      ["Frentes de construcción activos", "14"],
      ["Trabajadores", "18,200"],
      ["Maquinaria pesada", "3,900 unidades"],
      ["Vía elevada", "33 km en viaductos"],
      ["Obras complementarias", "2 zonas auxiliares de mantenimiento y un complejo de talleres y cocheras"]
    ],
    fuentes: [
      {
        texto: "Proyectos México (Gobierno federal)",
        url: "https://www.proyectosmexico.gob.mx/en/mexico-queretaro-train-project/"
      },
      {
        texto: "Publimetro — septiembre de 2026",
        url: "https://www.publimetro.com.mx/queretaro/2026/09/25/tren-mexico-qro-va-al-31-queretaro-irapuato-al-22/"
      }
    ]
  },
  {
    id: "metro-bogota-l1",
    nombre: "Metro de Bogotá, Línea 1",
    ciudad: "Bogotá D. C.",
    pais: "Colombia",
    bandera: "🇨🇴",
    lat: 4.6097,
    lon: -74.0817,
    tipo: "Metro elevado",
    etapa: "Viaducto, estaciones y pruebas dinámicas",
    estado: "En ejecución",
    inicio: "2020",
    fin: "Operación comercial en 2028",
    avance: 82.33,
    avanceNota: "Cifra oficial con corte al 31 de agosto de 2026.",
    resumen:
      "Primera línea de metro de Bogotá: 23.9 km elevados y 16 estaciones, desde el Patio Taller en Bosa hasta la calle 72 con avenida Caracas. Las pruebas dinámicas de trenes sobre el viaducto comenzaron en junio de 2026.",
    cifras: [
      { valor: "23.9", unidad: "km", etiqueta: "Longitud" },
      { valor: "16", unidad: "estaciones", etiqueta: "Estaciones" },
      { valor: "18", unidad: "km", etiqueta: "Viaducto construido" },
      { valor: "82.33", unidad: "%", etiqueta: "Avance oficial" }
    ],
    ficha: [
      ["Longitud", "23.9 km"],
      ["Estaciones", "16"],
      ["Viaducto construido", "18 km (corte a agosto de 2026)"],
      ["Trazado", "Patio Taller en Bosa → calle 72 con avenida Caracas"],
      ["Pruebas dinámicas", "Iniciaron en junio de 2026 sobre el viaducto"],
      ["Avance de obra", "82.33 % al 31 de agosto de 2026"]
    ],
    fuentes: [
      {
        texto: "Alcaldía Mayor de Bogotá — agosto de 2026",
        url: "https://bogota.gov.co/mi-ciudad/movilidad/linea-1-metro-bogota-completo-avance-8233-en-agosto-de-2026"
      },
      {
        texto: "Alcaldía Mayor de Bogotá — viaducto",
        url: "https://bogota.gov.co/mi-ciudad/movilidad/obras-linea-1-del-metro-de-bogota-16-kilometros-de-viaducto-2026"
      }
    ]
  },
  {
    id: "jeddah-tower",
    nombre: "Jeddah Tower",
    ciudad: "Yeda (Jeddah)",
    pais: "Arabia Saudita",
    bandera: "🇸🇦",
    lat: 21.8341,
    lon: 39.1137,
    tipo: "Rascacielos",
    etapa: "Estructura: núcleo y losas",
    estado: "En ejecución",
    inicio: "2013",
    fin: "Agosto de 2028 (estimado)",
    avance: 43,
    avanceNota:
      "Estimación por altura: 430 m construidos de los 1,008 m proyectados (agosto de 2026). No hay porcentaje oficial publicado.",
    resumen:
      "Será el primer edificio de la historia en superar el kilómetro de altura y le quitará a el Burj Khalifa el título de edificio más alto del mundo. En agosto de 2026 alcanzaba 430 m y 107 niveles terminados.",
    cifras: [
      { valor: "1,008", unidad: "m", etiqueta: "Altura proyectada" },
      { valor: "167", unidad: "niveles", etiqueta: "Pisos proyectados" },
      { valor: "430", unidad: "m", etiqueta: "Altura actual" },
      { valor: "107", unidad: "niveles", etiqueta: "Pisos terminados" }
    ],
    ficha: [
      ["Altura proyectada", "Más de 1,008 m"],
      ["Niveles proyectados", "167 (252 plantas técnicas incluidas)"],
      ["Altura construida", "430 m (agosto de 2026)"],
      ["Niveles terminados", "107"],
      ["Ritmo de obra", "Aproximadamente un nivel por semana en el núcleo central"],
      ["Falta por construir", "Unos 570 m de concreto y acero"],
      ["Hito", "Primer edificio del mundo en cruzar la barrera de 1 km"]
    ],
    fuentes: [
      {
        texto: "Wikipedia — Jeddah Tower",
        url: "https://en.wikipedia.org/wiki/Jeddah_Tower"
      },
      {
        texto: "Thornton Tomasetti — 100 niveles",
        url: "https://www.thorntontomasetti.com/news/jeddah-tower-construction-update-100-floors-completed-1-kilometer-megatall"
      }
    ]
  },
  {
    id: "hs2-old-oak-common",
    nombre: "HS2 — Old Oak Common",
    ciudad: "Old Oak Common, Londres",
    pais: "Reino Unido",
    bandera: "🇬🇧",
    lat: 51.532,
    lon: -0.25,
    tipo: "Estación subterránea y túneles",
    etapa: "Obra civil y excavación de túneles",
    estado: "En ejecución",
    inicio: "2021",
    fin: "Llegada a Euston prevista en 2027",
    avance: null,
    avanceNota:
      "Sin porcentaje oficial publicado. Hito medible: los 6 andenes de alta velocidad quedaron terminados en agosto de 2026.",
    resumen:
      "La estación de alta velocidad más grande que se construye en el Reino Unido. Dos tuneladoras, Madeleine y Karen, avanzan desde aquí hacia Euston a hasta 150 m por semana.",
    cifras: [
      { valor: "6", unidad: "andenes", etiqueta: "De 450 m cada uno" },
      { valor: "2", unidad: "tuneladoras", etiqueta: "Madeleine y Karen" },
      { valor: "150", unidad: "m/semana", etiqueta: "Ritmo de tunelación" },
      { valor: "2027", unidad: "", etiqueta: "Llegada a Euston" }
    ],
    ficha: [
      ["Andenes de alta velocidad", "6, de 450 m cada uno (terminados en agosto de 2026)"],
      ["Tuneladoras", "Madeleine (26 de enero de 2026) y Karen (16 de marzo de 2026)"],
      ["Ritmo de tunelación", "Hasta 150 m por semana"],
      ["Túnel de Euston", "Llegada prevista en 2027"],
      ["Túnel Old Oak Common", "Fase final de junio a diciembre de 2026; cierre en el invierno 2026-2027"],
      ["Conexión poniente", "Túnel corto hacia la caja de cruzamiento de Victoria Road y el túnel Northolt"]
    ],
    fuentes: [
      {
        texto: "HS2 Ltd — Old Oak Common",
        url: "https://www.hs2.org.uk/construction/stations/old-oak-common/"
      },
      {
        texto: "New Civil Engineer — agosto de 2026",
        url: "https://www.newcivilengineer.com/latest/in-pictures-hs2-completes-six-450m-old-oak-common-platforms-14-08-2026/"
      }
    ]
  },
  {
    id: "sydney-metro-west",
    nombre: "Sydney Metro West",
    ciudad: "Sídney, Nueva Gales del Sur",
    pais: "Australia",
    bandera: "🇦🇺",
    lat: -33.865,
    lon: 151.209,
    tipo: "Metro automatizado",
    etapa: "Acabado de túneles y construcción de estaciones",
    estado: "En ejecución",
    inicio: "2020",
    fin: "Apertura prevista en 2032",
    avance: null,
    avanceNota:
      "Sin porcentaje oficial publicado. Hito medible: la tunelación se completó en marzo de 2026.",
    resumen:
      "24 km de túneles gemelos y 9 estaciones nuevas entre Westmead y el centro de Sídney. La última tuneladora rompió hacia la caverna de Hunter Street en marzo de 2026 y ahora toca el acabado de túneles y la colocación de vía.",
    cifras: [
      { valor: "24", unidad: "km", etiqueta: "Túneles gemelos" },
      { valor: "9", unidad: "estaciones", etiqueta: "Estaciones nuevas" },
      { valor: "2026", unidad: "", etiqueta: "Fin de tunelación" },
      { valor: "2032", unidad: "", etiqueta: "Apertura prevista" }
    ],
    ficha: [
      ["Túneles", "24 km de túneles gemelos"],
      [
        "Estaciones",
        "Westmead, Parramatta, Sydney Olympic Park, North Strathfield, Burwood North, Five Dock, The Bays, Pyrmont y Hunter Street"
      ],
      ["Tunelación", "Completada en marzo de 2026, con la rotura final en la caverna de Hunter Street"],
      ["Fase actual", "Acabado de túneles, colocación de vía y sistemas ferroviarios"],
      ["Talleres", "Instalación de mantenimiento y estacionamiento en Clyde"],
      ["Apertura", "2032"]
    ],
    fuentes: [
      {
        texto: "Gobierno de Nueva Gales del Sur",
        url: "https://www.nsw.gov.au/ministerial-releases/tunnelling-complete-on-sydney-metro-west"
      },
      {
        texto: "Wikipedia — Sydney Metro West",
        url: "https://en.wikipedia.org/wiki/Sydney_Metro_West"
      }
    ]
  },
  {
    id: "hinkley-point-c",
    nombre: "Hinkley Point C",
    ciudad: "Somerset, Inglaterra",
    pais: "Reino Unido",
    bandera: "🇬🇧",
    lat: 51.2083,
    lon: -3.1311,
    tipo: "Central nuclear",
    etapa: "Montaje electromecánico",
    estado: "En ejecución",
    inicio: "2017",
    fin: "Primera generación de la Unidad 1 en 2030",
    avance: null,
    avanceNota:
      "Sin porcentaje oficial publicado. Hito medible: la obra alcanzó su pico de construcción en 2026 y casi todos los edificios quedarán terminados al cierre del año.",
    resumen:
      "La primera central nuclear que se construye en el Reino Unido desde 1995: dos reactores EPR. En junio de 2026, la grúa más grande del mundo, Big Carl, izó el segundo reactor a su posición.",
    cifras: [
      { valor: "14,000", unidad: "personas", etiqueta: "Personal en sitio" },
      { valor: "2", unidad: "reactores", etiqueta: "Unidades EPR" },
      { valor: "2030", unidad: "", etiqueta: "Primera generación" },
      { valor: "1995", unidad: "", etiqueta: "Última nuclear previa en el RU" }
    ],
    ficha: [
      ["Personal en sitio", "Alrededor de 14,000 personas (mayo de 2026)"],
      ["Reactores", "2 unidades EPR"],
      ["Hito de 2026", "Segundo reactor izado en junio con la grúa Big Carl, la más grande del mundo"],
      ["Circuito primario", "Instalado en la Unidad 1"],
      ["Edificios", "Casi todos terminados al cierre de 2026"],
      ["Primera generación", "2030 en la Unidad 1; la Unidad 2 cerca de un año después"]
    ],
    fuentes: [
      {
        texto: "Wikipedia — Hinkley Point C",
        url: "https://en.wikipedia.org/wiki/Hinkley_Point_C_nuclear_power_station"
      },
      {
        texto: "EDF Energy — avances",
        url: "https://www.edfenergy.com/energy/nuclear-new-build-projects/hinkley-point-c/latest-updates"
      }
    ]
  }
];
