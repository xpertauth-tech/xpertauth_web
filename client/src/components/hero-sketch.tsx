import type { CSSProperties } from "react";
import { useTranslations } from "@/i18n/context";

/**
 * Croquis técnico del Hero: tractora de 4 ejes (1+3), góndola de cuello de
 * cisne de 4 ejes con rampas levantadas y excavadora con el contrapeso hacia
 * la tractora y la pluma plegada hacia atrás. Vista lateral y vista frontal.
 *
 * Solo trazos, SVG inline. Cotas sin cifras (L, H, W) y cadena de cotas entre
 * ejes sin texto. Se traza una sola vez (vehículo → excavadora → rotativo →
 * cotas) con CSS (.hc-d / .hc-f en index.css); con prefers-reduced-motion se
 * muestra terminado.
 *
 * Escala común de las dos vistas: 1 unidad ≈ 3,8 cm; suelo en y = 190.
 */

const VEHICLE = "#7C8DAA";
const EMBER = "#E8620A";
const ARCTIC = "#4D9FEC";
const GROUND = "#2A3550";

type Shape = { k: "path" | "circle" | "rect" | "line"; a: Record<string, string | number> };

const p = (d: string, a: Shape["a"] = {}): Shape => ({ k: "path", a: { d, ...a } });
const c = (cx: number, cy: number, r: number): Shape => ({ k: "circle", a: { cx, cy, r } });
const r = (x: number, y: number, width: number, height: number, rx = 0): Shape => ({ k: "rect", a: { x, y, width, height, rx } });
const l = (x1: number, y1: number, x2: number, y2: number, a: Shape["a"] = {}): Shape => ({ k: "line", a: { x1, y1, x2, y2, ...a } });

const draw = (delay: number, dur: number): CSSProperties => ({ animationDelay: `${delay}ms`, animationDuration: `${dur}ms` });
const fade = (delay: number): CSSProperties => ({ animationDelay: `${delay}ms` });

function Traced({ shapes, start, step, dur }: { shapes: Shape[]; start: number; step: number; dur: number }) {
  return (
    <>
      {shapes.map((s, i) => {
        const Tag = s.k;
        return <Tag key={i} {...s.a} pathLength={1} className="hc-d" style={draw(start + i * step, dur)} />;
      })}
    </>
  );
}

function Dim({ x1, y1, x2, y2, at, dur = 450 }: { x1: number; y1: number; x2: number; y2: number; at: number; dur?: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} pathLength={1} className="hc-d" style={draw(at, dur)} />;
}

function Arrow({ x, y, dir, at }: { x: number; y: number; dir: "l" | "r" | "u" | "d"; at: number }) {
  const pts = {
    l: `${x},${y} ${x + 9},${y - 3} ${x + 9},${y + 3}`,
    r: `${x},${y} ${x - 9},${y - 3} ${x - 9},${y + 3}`,
    u: `${x},${y} ${x - 3},${y + 9} ${x + 3},${y + 9}`,
    d: `${x},${y} ${x - 3},${y - 9} ${x + 3},${y - 9}`,
  }[dir];
  return <polygon points={pts} fill={ARCTIC} stroke="none" className="hc-f" style={fade(at)} />;
}

function Letter({ x, y, at, children }: { x: number; y: number; at: number; children: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill={ARCTIC} stroke="none" fontFamily="'JetBrains Mono', monospace" fontSize={20} className="hc-f" style={fade(at)}>
      {children}
    </text>
  );
}

/* ───────────── Vista lateral ───────────── */

const AXLES_TRACTOR = [46, 150, 186, 222];
const AXLES_TRAILER = [450, 486, 522, 558];

const SIDE_VEHICLE: Shape[] = [
  l(0, 190, 604, 190, { stroke: GROUND }),
  // cabina, ventanilla, puerta, paragolpes
  p("M10 156 L10 114 Q10 104 18 100 L30 94 Q34 92 40 92 L68 92 Q74 92 74 98 L74 156 Z"),
  p("M16 108 L46 108 L46 130 L15 130 Z"),
  l(50, 108, 50, 156),
  p("M10 156 L12 166 L26 166"),
  // escape, rueda de repuesto tras la cabina, depósito, chasis
  r(76, 102, 4, 54, 2),
  c(100, 145, 11),
  c(100, 145, 5),
  r(84, 161, 48, 14, 3),
  l(74, 158, 252, 158),
  // pasos de rueda y ruedas de la tractora (1+3)
  p("M29 177 A17 17 0 0 1 63 177"),
  p("M133 177 A17 17 0 0 1 167 177"),
  p("M169 177 A17 17 0 0 1 203 177"),
  p("M205 177 A17 17 0 0 1 239 177"),
  ...AXLES_TRACTOR.flatMap((x) => [c(x, 177, 13), c(x, 177, 4)]),
  // góndola: cuello de cisne, plataforma baja, zona de ejes
  p("M150 148 L262 148 L292 172 L412 172 L434 152 L584 152 L584 162 L442 162 L416 180 L298 180 L270 154 L150 154 Z"),
  r(178, 134, 64, 14, 1),
  l(178, 138, 242, 138),
  ...AXLES_TRAILER.flatMap((x) => [c(x, 177, 13), c(x, 177, 4)]),
  // rampas traseras levantadas
  p("M572 152 L577 126 L584 126 L584 152"),
];

const SIDE_EXCAVATOR: Shape[] = [
  // tren de rodaje
  r(302, 150, 110, 22, 11),
  c(313, 161, 5),
  c(401, 161, 5),
  c(337, 167, 2),
  c(357, 167, 2),
  c(377, 167, 2),
  p("M322 150 L322 143 L392 143 L392 150"),
  // torreta con el contrapeso hacia la tractora y cabina
  p("M326 143 Q310 143 310 131 L310 122 Q310 114 320 114 L366 114 L366 124 L396 124 L396 143 Z"),
  p("M368 124 L368 92 Q368 88 372 88 L392 88 Q396 88 396 92 L396 124"),
  p("M372 92 L392 92 L392 112 L372 112 Z"),
  // pluma plegada hacia atrás, cilindro y cazo apoyado en la parte trasera
  p("M396 134 Q408 84 448 82 L538 134 L530 146 L444 96 Q414 98 402 136 Z"),
  l(406, 126, 438, 102),
  p("M524 142 Q554 144 552 152 L514 152 Z"),
];

const SIDE_BEACON: Shape[] = [p("M36 92 L36 88 Q36 83 41 83 Q46 83 46 88 L46 92")];

/* ───────────── Vista frontal ───────────── */

const FRONT_VEHICLE: Shape[] = [
  l(0, 190, 116, 190, { stroke: GROUND }),
  r(18, 164, 10, 26, 3),
  r(88, 164, 10, 26, 3),
  l(28, 177, 88, 177),
  r(28, 158, 60, 8),
];

const FRONT_EXCAVATOR: Shape[] = [
  r(24, 134, 14, 24, 6),
  r(78, 134, 14, 24, 6),
  r(38, 142, 40, 12),
  p("M30 142 L30 112 Q30 106 36 106 L80 106 Q86 106 86 112 L86 142"),
  p("M34 106 L34 88 Q34 84 38 84 L56 84 Q60 84 60 88 L60 106"),
  r(38, 88, 18, 14, 1),
  p("M66 106 L66 84 Q66 80 70 80 L76 80 Q80 80 80 84 L80 106"),
];

/* Tiempos (ms): vehículo → excavadora → rotativo → cotas, ~4 s en total. */
const T_EXC = 1400;
const T_ROT = 2300;
const T_COT = 2600;

export default function HeroSketch() {
  const { t } = useTranslations("hero");
  const chain = [10, ...AXLES_TRACTOR, ...AXLES_TRAILER, 584];

  return (
    <figure className="m-0 w-full max-w-[780px] mx-auto">
      <span className="sr-only">{t("sketchAlt")}</span>

      <div className="flex items-start w-full" aria-hidden="true">
        {/* Vista lateral */}
        <div className="min-w-0" style={{ flex: "640 1 0" }}>
          <svg viewBox="0 0 640 232" className="block w-full h-auto" fill="none" strokeLinejoin="round">
            <g stroke={VEHICLE} strokeWidth={1.6}>
              <Traced shapes={SIDE_VEHICLE} start={0} step={32} dur={600} />
            </g>
            <g stroke={EMBER} strokeWidth={1.8}>
              <Traced shapes={SIDE_EXCAVATOR} start={T_EXC} step={38} dur={550} />
              <Traced shapes={SIDE_BEACON} start={T_ROT} step={0} dur={450} />
            </g>
            <g stroke={ARCTIC} strokeWidth={1}>
              {/* L — longitud total */}
              <Dim x1={10} y1={108} x2={10} y2={26} at={T_COT} />
              <Dim x1={584} y1={122} x2={584} y2={26} at={T_COT + 60} />
              <Dim x1={10} y1={34} x2={283} y2={34} at={T_COT + 250} dur={600} />
              <Dim x1={311} y1={34} x2={584} y2={34} at={T_COT + 250} dur={600} />
              <Arrow x={10} y={34} dir="l" at={T_COT + 850} />
              <Arrow x={584} y={34} dir="r" at={T_COT + 850} />
              <Letter x={297} y={41} at={T_COT + 900}>L</Letter>

              {/* H — altura total */}
              <Dim x1={454} y1={82} x2={632} y2={82} at={T_COT + 150} />
              <Dim x1={600} y1={190} x2={632} y2={190} at={T_COT + 200} dur={250} />
              <Dim x1={620} y1={82} x2={620} y2={123} at={T_COT + 450} dur={500} />
              <Dim x1={620} y1={149} x2={620} y2={190} at={T_COT + 450} dur={500} />
              <Arrow x={620} y={82} dir="u" at={T_COT + 950} />
              <Arrow x={620} y={190} dir="d" at={T_COT + 950} />
              <Letter x={620} y={142} at={T_COT + 1000}>H</Letter>

              {/* Cadena de cotas entre ejes: sin texto */}
              {chain.map((x, i) => (
                <Dim key={`e${x}`} x1={x} y1={194} x2={x} y2={218} at={T_COT + 500 + i * 40} dur={250} />
              ))}
              <Dim x1={10} y1={212} x2={584} y2={212} at={T_COT + 700} dur={800} />
              {chain.map((x, i) => (
                <line key={`t${x}`} x1={x - 3} y1={215} x2={x + 3} y2={209} strokeWidth={1.3} className="hc-f" style={fade(T_COT + 1050 + i * 35)} />
              ))}
            </g>
          </svg>
          <p className="hc-f mt-1 text-[0.7rem] sm:text-xs text-white/40" style={fade(T_EXC)}>
            {t("viewSide")}
          </p>
        </div>

        {/* Vista frontal (oculta en móvil) */}
        <div className="hidden sm:block min-w-0" style={{ flex: "116 1 0" }}>
          <svg viewBox="0 0 116 232" className="block w-full h-auto" fill="none" strokeLinejoin="round">
            <g stroke={VEHICLE} strokeWidth={1.6}>
              <Traced shapes={FRONT_VEHICLE} start={300} step={32} dur={600} />
            </g>
            <g stroke={EMBER} strokeWidth={1.8}>
              <Traced shapes={FRONT_EXCAVATOR} start={T_EXC + 300} step={38} dur={550} />
            </g>
            <g stroke={ARCTIC} strokeWidth={1}>
              {/* W — anchura */}
              <Dim x1={18} y1={194} x2={18} y2={220} at={T_COT + 700} dur={250} />
              <Dim x1={98} y1={194} x2={98} y2={220} at={T_COT + 740} dur={250} />
              <Dim x1={18} y1={212} x2={50} y2={212} at={T_COT + 850} dur={450} />
              <Dim x1={66} y1={212} x2={98} y2={212} at={T_COT + 850} dur={450} />
              <Arrow x={18} y={212} dir="l" at={T_COT + 1250} />
              <Arrow x={98} y={212} dir="r" at={T_COT + 1250} />
              <Letter x={58} y={219} at={T_COT + 1300}>W</Letter>
            </g>
          </svg>
          <p className="hc-f mt-1 text-[0.7rem] sm:text-xs text-white/40" style={fade(T_EXC + 300)}>
            {t("viewFront")}
          </p>
        </div>
      </div>
    </figure>
  );
}
