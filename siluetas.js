/* ============================================================
   siluetas.js — Ilustraciones de cada obra

   Son dibujos propios en SVG, hechos a mano con la forma
   característica de cada proyecto. No usan colores fijos: cada
   pieza lleva una clase y el color sale de las variables del
   tema, así que de noche se encienden las ventanas solas.

   Todas comparten el mismo lienzo (-40 0 280 260) y el suelo a la
   altura y = 238, para que se vean parejas entre sí y para
   poder reutilizarlas volando en el fondo.
   ============================================================ */

const SILUETAS = {

  /* Rascacielos escalonado con aguja. */
  "torre-rise": `
    <path class="il-acento" d="M100 8 L103 64 L97 64 Z"/>
    <path class="il-cuerpo" d="M86 64 H114 L116 120 H84 Z"/>
    <path class="il-cuerpo" d="M80 120 H120 L123 180 H77 Z"/>
    <path class="il-cuerpo" d="M68 180 H132 L136 238 H64 Z"/>
    <path class="il-sombra" d="M105 64 H114 L116 120 H106 Z"/>
    <path class="il-sombra" d="M111 120 H120 L123 180 H112 Z"/>
    <path class="il-sombra" d="M121 180 H132 L136 238 H123 Z"/>
    <rect class="il-luz" x="89" y="74" width="12" height="3"/>
    <rect class="il-luz" x="89" y="86" width="12" height="3"/>
    <rect class="il-luz" x="89" y="98" width="12" height="3"/>
    <rect class="il-luz" x="89" y="110" width="12" height="3"/>
    <rect class="il-luz" x="84" y="132" width="22" height="3"/>
    <rect class="il-luz" x="84" y="146" width="22" height="3"/>
    <rect class="il-luz" x="84" y="160" width="22" height="3"/>
    <rect class="il-luz" x="73" y="194" width="42" height="3"/>
    <rect class="il-luz" x="72" y="208" width="42" height="3"/>
    <rect class="il-luz" x="71" y="222" width="42" height="3"/>
    <path class="il-grua" d="M142 96 V238 M142 100 H176 M142 100 H128 M148 100 L142 112 M162 100 V116"/>
    <rect class="il-suelo" x="-40" y="238" width="280" height="22"/>
  `,

  /* Viaducto ferroviario con un tren y la sierra detrás. */
  "tren-mexico-queretaro": `
    <path class="il-lejano" d="M-40 192 L26 118 L76 180 L118 130 L172 188 L240 138 L240 192 Z"/>
    <rect class="il-cuerpo" x="24" y="198" width="15" height="40"/>
    <rect class="il-cuerpo" x="92" y="198" width="15" height="40"/>
    <rect class="il-cuerpo" x="160" y="198" width="15" height="40"/>
    <path class="il-sombra" d="M34 198 H39 V238 H34 Z M102 198 H107 V238 H102 Z M170 198 H175 V238 H170 Z"/>
    <rect class="il-cuerpo" x="-40" y="184" width="280" height="14"/>
    <rect class="il-sombra" x="-40" y="194" width="280" height="4"/>
    <rect class="il-cuerpo" x="28" y="150" width="132" height="34" rx="9"/>
    <path class="il-sombra" d="M28 176 H160 V180 A4 4 0 0 1 156 184 H32 A4 4 0 0 1 28 180 Z"/>
    <path class="il-acento" d="M160 156 A9 9 0 0 1 160 178 Z"/>
    <rect class="il-luz" x="40" y="158" width="16" height="11" rx="2"/>
    <rect class="il-luz" x="64" y="158" width="16" height="11" rx="2"/>
    <rect class="il-luz" x="88" y="158" width="16" height="11" rx="2"/>
    <rect class="il-luz" x="112" y="158" width="16" height="11" rx="2"/>
    <rect class="il-luz" x="136" y="158" width="16" height="11" rx="2"/>
    <rect class="il-suelo" x="-40" y="238" width="280" height="22"/>
  `,

  /* Metro elevado sobre la ciudad. */
  "metro-bogota-l1": `
    <rect class="il-lejano" x="6" y="150" width="30" height="88"/>
    <rect class="il-lejano" x="42" y="128" width="24" height="110"/>
    <rect class="il-lejano" x="140" y="140" width="28" height="98"/>
    <rect class="il-lejano" x="172" y="162" width="24" height="76"/>
    <path class="il-lejano" d="M66 176 L96 120 L126 176 Z"/>
    <rect class="il-cuerpo" x="34" y="176" width="16" height="62"/>
    <rect class="il-cuerpo" x="150" y="176" width="16" height="62"/>
    <path class="il-sombra" d="M44 176 H50 V238 H44 Z M160 176 H166 V238 H160 Z"/>
    <rect class="il-cuerpo" x="-40" y="162" width="280" height="16" rx="3"/>
    <rect class="il-sombra" x="-40" y="173" width="280" height="5"/>
    <rect class="il-cuerpo" x="22" y="118" width="150" height="40" rx="12"/>
    <path class="il-sombra" d="M22 148 H172 V146 A12 12 0 0 1 160 158 H34 A12 12 0 0 1 22 146 Z"/>
    <rect class="il-acento" x="22" y="118" width="150" height="6" rx="3"/>
    <rect class="il-luz" x="34" y="130" width="20" height="13" rx="3"/>
    <rect class="il-luz" x="62" y="130" width="20" height="13" rx="3"/>
    <rect class="il-luz" x="90" y="130" width="20" height="13" rx="3"/>
    <rect class="il-luz" x="118" y="130" width="20" height="13" rx="3"/>
    <rect class="il-luz" x="146" y="130" width="14" height="13" rx="3"/>
    <rect class="il-suelo" x="-40" y="238" width="280" height="22"/>
  `,

  /* Torre de tres alas que se estrechan, con aguja muy larga. */
  "jeddah-tower": `
    <path class="il-acento" d="M100 6 L102 58 L98 58 Z"/>
    <path class="il-cuerpo" d="M94 58 H106 L112 150 H88 Z"/>
    <path class="il-cuerpo" d="M88 150 H112 L120 204 H80 Z"/>
    <path class="il-cuerpo" d="M80 204 H120 L128 238 H72 Z"/>
    <path class="il-ala" d="M88 150 L72 198 L78 238 L80 204 Z"/>
    <path class="il-ala" d="M112 150 L128 198 L122 238 L120 204 Z"/>
    <path class="il-ala" d="M92 96 L84 150 H88 Z"/>
    <path class="il-ala" d="M108 96 L116 150 H112 Z"/>
    <path class="il-sombra" d="M100 58 H106 L112 150 H100 Z"/>
    <path class="il-sombra" d="M100 150 H112 L120 204 H100 Z"/>
    <path class="il-sombra" d="M100 204 H120 L128 238 H100 Z"/>
    <rect class="il-luz" x="96" y="72" width="8" height="2.5"/>
    <rect class="il-luz" x="95" y="86" width="10" height="2.5"/>
    <rect class="il-luz" x="94" y="100" width="12" height="2.5"/>
    <rect class="il-luz" x="92" y="116" width="16" height="2.5"/>
    <rect class="il-luz" x="90" y="132" width="20" height="2.5"/>
    <rect class="il-luz" x="87" y="162" width="26" height="3"/>
    <rect class="il-luz" x="85" y="178" width="30" height="3"/>
    <rect class="il-luz" x="82" y="212" width="36" height="3"/>
    <path class="il-grua" d="M44 92 V238 M44 96 H84 M44 96 H28 M52 96 L44 110 M68 96 V114"/>
    <rect class="il-suelo" x="-40" y="238" width="280" height="22"/>
  `,

  /* Corte de la estación subterránea con sus dos túneles. */
  "hs2-old-oak-common": `
    <rect class="il-lejano" x="-40" y="96" width="280" height="34"/>
    <rect class="il-cuerpo" x="18" y="86" width="164" height="18" rx="4"/>
    <path class="il-acento" d="M18 86 H182 V91 H18 Z"/>
    <rect class="il-suelo" x="-40" y="104" width="280" height="12"/>
    <rect class="il-corte" x="14" y="116" width="172" height="118" rx="7"/>
    <rect class="il-cuerpo" x="26" y="150" width="54" height="8" rx="3"/>
    <rect class="il-cuerpo" x="120" y="150" width="54" height="8" rx="3"/>
    <rect class="il-cuerpo" x="26" y="200" width="54" height="8" rx="3"/>
    <rect class="il-cuerpo" x="120" y="200" width="54" height="8" rx="3"/>
    <circle class="il-tunel" cx="53" cy="178" r="24"/>
    <circle class="il-tunel-int" cx="53" cy="178" r="16"/>
    <circle class="il-tunel" cx="147" cy="178" r="24"/>
    <circle class="il-tunel-int" cx="147" cy="178" r="16"/>
    <rect class="il-luz" x="44" y="170" width="18" height="12" rx="2"/>
    <rect class="il-luz" x="138" y="170" width="18" height="12" rx="2"/>
    <path class="il-linea" d="M90 150 V214 M110 150 V214"/>
    <rect class="il-acento" x="94" y="124" width="12" height="18" rx="3"/>
    <rect class="il-suelo" x="-40" y="238" width="280" height="22"/>
  `,

  /* Túneles gemelos en corte, con la vía ya tendida. */
  "sydney-metro-west": `
    <rect class="il-lejano" x="-40" y="40" width="280" height="38"/>
    <rect class="il-suelo" x="-40" y="74" width="280" height="12"/>
    <rect class="il-corte" x="-40" y="86" width="280" height="148"/>
    <circle class="il-tunel" cx="60" cy="158" r="46"/>
    <circle class="il-tunel-int" cx="60" cy="158" r="35"/>
    <circle class="il-tunel" cx="152" cy="158" r="46"/>
    <circle class="il-tunel-int" cx="152" cy="158" r="35"/>
    <rect class="il-cuerpo" x="34" y="186" width="52" height="7" rx="2"/>
    <rect class="il-cuerpo" x="126" y="186" width="52" height="7" rx="2"/>
    <path class="il-linea" d="M40 182 H80 M40 190 H80 M132 182 H172 M132 190 H172"/>
    <rect class="il-luz" x="48" y="136" width="24" height="16" rx="3"/>
    <rect class="il-luz" x="140" y="136" width="24" height="16" rx="3"/>
    <rect class="il-suelo" x="-40" y="238" width="280" height="22"/>
  `,

  /* Dos edificios de reactor y la grúa más grande del mundo. */
  "hinkley-point-c": `
    <path class="il-lejano" d="M-40 196 H240 V238 H-40 Z"/>
    <path class="il-cuerpo" d="M36 196 V156 A26 26 0 0 1 88 156 V196 Z"/>
    <rect class="il-sombra" x="64" y="156" width="24" height="40"/>
    <path class="il-cuerpo" d="M112 196 V156 A26 26 0 0 1 164 156 V196 Z"/>
    <rect class="il-sombra" x="140" y="156" width="24" height="40"/>
    <rect class="il-acento" x="58" y="118" width="8" height="16" rx="2"/>
    <rect class="il-acento" x="134" y="118" width="8" height="16" rx="2"/>
    <rect class="il-luz" x="44" y="168" width="14" height="10" rx="2"/>
    <rect class="il-luz" x="120" y="168" width="14" height="10" rx="2"/>
    <path class="il-grua" d="M100 66 V196 M100 72 H170 M100 72 H42 M100 86 L84 72 M100 86 L116 72 M152 72 V100 M58 72 V96"/>
    <rect class="il-cuerpo" x="94" y="186" width="12" height="10"/>
    <path class="il-linea" d="M-40 216 H240"/>
    <rect class="il-suelo" x="-40" y="238" width="280" height="22"/>
  `
};

/**
 * Devuelve la ilustración de una obra ya envuelta en su <svg>.
 * No usa identificadores internos, así que se puede repetir
 * varias veces en la misma página sin que se estorben.
 */
function svgDeObra(id, clase) {
  return '<svg class="' + (clase || "ilustracion") + '" viewBox="-40 0 280 260" ' +
    'preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">' +
    (SILUETAS[id] || "") +
    '</svg>';
}
