import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Fondo "firma" del Hero de transporte.
 *
 * Malla abstracta tipo circuito (SVG, sin librerías): traza ortogonal tipo PCB
 * entre nodos, algún pulso de datos recorriéndolas y nodos que parpadean muy
 * suave. Arranca solo (no depende de scroll); el IntersectionObserver solo
 * pausa las animaciones cuando el Hero sale de viewport para no gastar batería.
 *
 * Guiño territorial: silueta muy tenue de Catalunya, casi invisible, solo como
 * textura.
 *
 * Paleta: Obsidian de fondo (lo pone la <section>), circuito en Arctic
 * (#4D9FEC). Malla al ~9 % y nodos al ~14 % (textura, no protagonismo);
 * silueta de Catalunya al ~3 %.
 *
 * Rendimiento: sin filtros SVG, se pausa fuera de viewport, y con
 * prefers-reduced-motion queda todo estático.
 */

type Pt = { x: number; y: number };

type Layout = {
  viewBox: string;
  cat: { transform: string; opacity: number };
  nodes: Pt[];
  traces: [number, number][];
  active: number[];
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
};

const MOBILE: Layout = {
  viewBox: "0 0 430 900",
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
};

// Traza ortogonal tipo PCB entre dos nodos, con un codo redondeado.
function manhattan(a: Pt, b: Pt, r = 14): string {
  const sx = Math.sign(b.x - a.x) || 1;
  const sy = Math.sign(b.y - a.y) || 1;
  const rr = Math.min(r, Math.abs(b.x - a.x) / 2, Math.abs(b.y - a.y) / 2);
  if (!(rr >= 1)) return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  return `M${a.x} ${a.y} H${b.x - sx * rr} Q${b.x} ${a.y} ${b.x} ${a.y + sy * rr} V${b.y}`;
}

export default function HeroRouteMap() {
  const mobile = useIsMobile();
  const reduced = useReducedMotion() ?? false;
  const svgRef = useRef<SVGSVGElement>(null);
  const L = mobile ? MOBILE : DESKTOP;

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

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 h-full w-full pointer-events-none"
      viewBox={L.viewBox}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ opacity: 0.85 }}
    >
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
    </svg>
  );
}
