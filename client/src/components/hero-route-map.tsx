import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Fondo "firma" del Hero de transporte.
 *
 * Mapa abstracto tipo circuito + una ruta A -> B que se traza sola al cargar,
 * recorrida por un marcador (vehículo) con estela. SVG + CSS/SMIL nativo,
 * sin librerías de mapas. Arranca solo (no depende de scroll); el
 * IntersectionObserver solo pausa las animaciones cuando el Hero sale de
 * viewport para no gastar batería en móvil.
 *
 * Paleta: Obsidian de fondo (lo pone la <section>), ruta y marcador en
 * Arctic (#4D9FEC) / XpertBlue (#1B4FD8). Guiño territorial: silueta muy
 * tenue de Catalunya, casi invisible, solo como textura.
 *
 * Línea de tiempo de la animación:
 *   0,9 s          el vehículo arranca en A; la línea se dibuja tras él.
 *   ~4,8 s         llega a B; se dispara la onda de llegada en el destino.
 *   bucle de 6 s   recorre (~3,9 s con easing), descansa ~2 s y repite.
 *   entre pasadas  un pulso tenue recorre la ruta para mantenerla viva.
 *
 * Sobriedad: malla de circuito al ~9 % y nodos al ~16 % (textura, no
 * protagonismo); silueta de Catalunya al ~3 %; la ruta enmarca el titular
 * sin cruzarlo ni pasar pegada al texto.
 *
 * Rendimiento: sin filtros SVG (el glow son capas de trazo + gradientes),
 * se pausa fuera de viewport, y con prefers-reduced-motion la ruta queda
 * fija y sin vehículo.
 */

type Pt = { x: number; y: number };

type Layout = {
  viewBox: string;
  a: Pt;
  b: Pt;
  route: string;
  cat: { transform: string; opacity: number };
  nodes: Pt[];
  traces: [number, number][];
  active: number[];
  routeWidth: number;
};

// Silueta estilizada de Catalunya (Cap de Creus -> Pirineu -> Ponent -> Delta
// de l'Ebre -> costa). Dibujada en una caja local ~360x360, se coloca y escala
// por variante. A 3% de opacidad es apenas un matiz de textura.
const CAT_PATH =
  "M300 30 C250 12 150 25 95 60 C70 76 52 104 60 130 C44 150 40 190 58 220 " +
  "C70 255 92 300 120 320 L128 362 L151 345 L142 312 C190 300 250 250 285 190 " +
  "C310 150 322 80 300 30 Z";

const DESKTOP: Layout = {
  viewBox: "0 0 1440 820",
  // La ruta entra por el margen izquierdo (bajo y a la izquierda del titular),
  // recorre el borde inferior por debajo de los botones y asciende pegada al
  // margen derecho hasta la esquina superior. Enmarca el contenido dejando un
  // hueco claro con el texto: nunca lo invade ni pasa rozándolo.
  a: { x: 92, y: 452 },
  b: { x: 1344, y: 92 },
  route:
    "M92 452 C 168 578 200 664 340 680 C 600 702 900 700 1120 636 " +
    "C 1320 566 1352 320 1344 92",
  cat: { transform: "translate(470 150) scale(1.6)", opacity: 0.028 },
  nodes: [
    { x: 120, y: 140 }, { x: 300, y: 88 }, { x: 470, y: 196 }, { x: 210, y: 330 },
    { x: 424, y: 470 }, { x: 80, y: 540 }, { x: 624, y: 120 }, { x: 792, y: 250 },
    { x: 680, y: 560 }, { x: 904, y: 430 }, { x: 1052, y: 140 }, { x: 1184, y: 330 },
    { x: 1320, y: 224 }, { x: 1284, y: 520 }, { x: 984, y: 652 }, { x: 540, y: 690 },
    { x: 340, y: 560 }, { x: 1150, y: 604 },
  ],
  traces: [
    [0, 1], [1, 6], [6, 10], [10, 12], [2, 3], [3, 5], [4, 16], [7, 9],
    [9, 11], [11, 13], [8, 14], [14, 17], [15, 16], [10, 11], [3, 4], [7, 8],
  ],
  active: [1, 7, 13],
  routeWidth: 2.75,
};

const MOBILE: Layout = {
  viewBox: "0 0 430 900",
  // En vertical el texto ocupa casi todo el centro: la ruta se reserva a la
  // franja inferior, por debajo de los botones.
  a: { x: 40, y: 866 },
  b: { x: 406, y: 726 },
  route: "M40 866 C 120 832 132 752 242 730 C 312 716 344 708 406 726",
  cat: { transform: "translate(150 470) scale(0.9)", opacity: 0.03 },
  nodes: [
    { x: 58, y: 120 }, { x: 210, y: 70 }, { x: 360, y: 150 }, { x: 96, y: 250 },
    { x: 300, y: 300 }, { x: 388, y: 214 }, { x: 60, y: 560 }, { x: 250, y: 792 },
    { x: 372, y: 720 }, { x: 150, y: 470 }, { x: 366, y: 470 }, { x: 210, y: 210 },
  ],
  traces: [
    [0, 1], [1, 11], [11, 5], [3, 9], [0, 3], [6, 7], [7, 8], [9, 10], [2, 5], [1, 2],
  ],
  active: [1, 6, 8],
  routeWidth: 2.4,
};

// Traza ortogonal tipo PCB entre dos nodos, con un codo redondeado.
function manhattan(a: Pt, b: Pt, r = 14): string {
  const sx = Math.sign(b.x - a.x) || 1;
  const sy = Math.sign(b.y - a.y) || 1;
  const rr = Math.min(r, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2);
  if (!(rr >= 1)) return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  return `M${a.x} ${a.y} H${b.x - sx * rr} Q${b.x} ${a.y} ${b.x} ${a.y + sy * rr} V${b.y}`;
}

const DRAW = { animation: "heroDraw 3.9s cubic-bezier(.4,0,.15,1) .9s forwards" as const, strokeDashoffset: 1 };

// Motion compartido por el vehículo y su estela. Recorre la ruta en el 65%
// inicial de cada ciclo (con easing) y descansa el resto antes de repetir.
const MOTION = {
  dur: "6s",
  repeatCount: "indefinite" as const,
  calcMode: "spline" as const,
  keyTimes: "0;0.65;1",
  keyPoints: "0;1;1",
  keySplines: "0.4 0 0.15 1;0 0 1 1",
};

export default function HeroRouteMap() {
  const mobile = useIsMobile();
  const reduced = useReducedMotion() ?? false;
  const svgRef = useRef<SVGSVGElement>(null);
  const L = mobile ? MOBILE : DESKTOP;
  const uid = mobile ? "m" : "d";
  const routeId = `hero-route-${uid}`;
  const gradId = `hero-route-grad-${uid}`;
  const glowId = `hero-route-glow-${uid}`;

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        try {
          entry.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations();
        } catch {
          /* pauseAnimations no soportado: la animación simplemente sigue */
        }
      },
      { threshold: 0 },
    );
    io.observe(svg);
    return () => io.disconnect();
  }, [reduced, mobile]);

  // Vehículo + estela: círculos apilados con el mismo motion. El `t` (retardo
  // relativo del begin) los separa a lo largo de la ruta -> menor t = cabeza,
  // mayor t = cola. Se disponen del más externo/tenue al núcleo brillante.
  const w = L.routeWidth;
  const comet = [
    { r: w * 6.5, fill: `url(#${glowId})`, opacity: 0.55, t: 0 }, // charco de luz que viaja
    { r: w * 3.4, fill: "#4D9FEC", opacity: 0.3, t: 0 }, // halo de la cabeza
    { r: w * 0.55, fill: "#4D9FEC", opacity: 0.1, t: 0.42 },
    { r: w * 0.7, fill: "#4D9FEC", opacity: 0.18, t: 0.33 },
    { r: w * 0.9, fill: "#4D9FEC", opacity: 0.28, t: 0.25 },
    { r: w * 1.1, fill: "#7FB8F2", opacity: 0.4, t: 0.17 },
    { r: w * 1.35, fill: "#BBD9F8", opacity: 0.6, t: 0.09 },
    { r: w * 1.05, fill: "#4D9FEC", opacity: 0.5, t: 0.04 },
    { r: w * 1.7, fill: "#EAF4FE", opacity: 1, t: 0 }, // núcleo (cabeza)
  ];

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      viewBox={L.viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity: 0.85 }}
    >
      <defs>
        <linearGradient
          id={gradId}
          gradientUnits="userSpaceOnUse"
          x1={L.a.x}
          y1={L.a.y}
          x2={L.b.x}
          y2={L.b.y}
        >
          <stop offset="0" stopColor="#1B4FD8" />
          <stop offset="0.5" stopColor="#4D9FEC" />
          <stop offset="1" stopColor="#9BC9F5" />
        </linearGradient>
        <radialGradient id={glowId}>
          <stop offset="0" stopColor="#4D9FEC" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#4D9FEC" stopOpacity="0.25" />
          <stop offset="1" stopColor="#4D9FEC" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Guiño territorial: silueta apenas perceptible */}
      <g transform={L.cat.transform} opacity={L.cat.opacity}>
        <path d={CAT_PATH} fill="#4D9FEC" />
      </g>

      {/* Malla estática tipo circuito */}
      <g stroke="#4D9FEC" fill="none" strokeWidth={1}>
        {L.traces.map(([i, j], k) => (
          <path key={k} d={manhattan(L.nodes[i], L.nodes[j])} opacity={0.09} />
        ))}
      </g>

      {/* Trazas "vivas": pulso de datos recorriéndolas */}
      {!reduced &&
        L.active.map((idx, k) => {
          const [i, j] = L.traces[idx];
          return (
            <path
              key={k}
              d={manhattan(L.nodes[i], L.nodes[j])}
              fill="none"
              stroke="#4D9FEC"
              strokeWidth={1.4}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="0.14 0.86"
              opacity={0.32}
              style={{ animation: `heroTrace 3.8s linear ${k * 1.3}s infinite` }}
            />
          );
        })}

      {/* Nodos */}
      <g fill="#4D9FEC">
        {L.nodes.map((n, k) => (
          <circle
            key={k}
            cx={n.x}
            cy={n.y}
            r={k % 3 === 0 ? 2.4 : 1.6}
            opacity={0.14}
            style={
              !reduced && k % 2 === 0
                ? { animation: `heroTwinkle ${4 + (k % 4)}s ease-in-out ${k * 0.4}s infinite` }
                : undefined
            }
          />
        ))}
      </g>

      {/* Ruta firma: dos capas de glow + la línea con degradado */}
      <path
        d={L.route}
        fill="none"
        stroke="#4D9FEC"
        strokeWidth={L.routeWidth * 5}
        strokeLinecap="round"
        opacity={0.04}
        pathLength={1}
        strokeDasharray={1}
        style={reduced ? undefined : DRAW}
      />
      <path
        d={L.route}
        fill="none"
        stroke="#4D9FEC"
        strokeWidth={L.routeWidth * 2.2}
        strokeLinecap="round"
        opacity={0.08}
        pathLength={1}
        strokeDasharray={1}
        style={reduced ? undefined : DRAW}
      />
      <path
        d={L.route}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={L.routeWidth}
        strokeLinecap="round"
        opacity={0.55}
        pathLength={1}
        strokeDasharray={1}
        style={reduced ? undefined : DRAW}
      />

      {/* Path de referencia para el motion del vehículo */}
      <path id={routeId} d={L.route} fill="none" stroke="none" />

      {/* Pulso de flujo recurrente que mantiene la ruta "viva" */}
      {!reduced && (
        <path
          d={L.route}
          fill="none"
          stroke="#EAF4FE"
          strokeWidth={L.routeWidth * 1.1}
          strokeLinecap="round"
          opacity={0.5}
          pathLength={1}
          strokeDasharray="0.05 1"
          style={{ animation: "heroFlow 6s ease-in-out 6.4s infinite" }}
        />
      )}

      {/* Punto de origen (A) */}
      <circle cx={L.a.x} cy={L.a.y} r={3.2} fill="#4D9FEC" />
      {!reduced && (
        <circle cx={L.a.x} cy={L.a.y} r={6} fill="none" stroke="#4D9FEC" strokeWidth={1.2}>
          <animate attributeName="r" values="5;15;5" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.55;0;0.55" dur="3.6s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Punto de destino (B) */}
      <circle cx={L.b.x} cy={L.b.y} r={4} fill="#1B4FD8" stroke="#4D9FEC" strokeWidth={1.2} />
      {!reduced && (
        <>
          <circle cx={L.b.x} cy={L.b.y} r={6} fill="none" stroke="#4D9FEC" strokeWidth={1.2}>
            <animate attributeName="r" values="6;16;6" dur="3.6s" begin="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.5;0;0.5" dur="3.6s" begin="1.8s" repeatCount="indefinite" />
          </circle>
          {/* Onda de llegada, sincronizada con el paso del vehículo */}
          <circle cx={L.b.x} cy={L.b.y} r={4} fill="none" stroke="#4D9FEC" strokeWidth={1.5}>
            <animate attributeName="r" values="3;28;28" keyTimes="0;0.16;1" dur="6s" begin="4.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;0;0" keyTimes="0;0.16;1" dur="6s" begin="4.8s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      {/* Vehículo + estela */}
      {!reduced &&
        comet.map((c, k) => (
          <circle key={k} r={c.r} fill={c.fill} opacity={c.opacity} cx={L.a.x} cy={L.a.y}>
            <animateMotion begin={`${0.9 + c.t}s`} {...MOTION}>
              <mpath href={`#${routeId}`} xlinkHref={`#${routeId}`} />
            </animateMotion>
          </circle>
        ))}
    </svg>
  );
}
