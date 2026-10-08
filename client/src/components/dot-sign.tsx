import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Cartel de matriz de puntos tipo panel de mensaje variable de autopista.
 * SVG generado en código: tipografía propia de 5×7 (más una fila superior para
 * los acentos) y pictogramas de señal dibujados en la misma rejilla.
 *
 * Secuencia: primer encendido columna a columna (.sign-on); después cada
 * cambio apaga todo ~0,3 s y enciende de golpe el siguiente mensaje (.sign-now).
 * Dos vueltas completas y se queda fijo en el último mensaje. Se pausa fuera de
 * pantalla. Con reducir movimiento solo se muestra el último, fijo.
 * El tamaño se calcula con el mensaje más largo para que nada salte.
 */

const ROWS = 8; // 1 de acento + 7 de letra
const GAP = 1; // columnas entre caracteres
const LINE_GAP = 2; // filas entre líneas
const MARGIN_X = 3;
const MARGIN_Y = 1;
const SPACE_W = 3;
const TEXT_H = ROWS * 2 + LINE_GAP; // altura de las dos líneas de texto (18)
const PIC = 20; // pictograma de 20×20; con MARGIN_Y = 1 el cartel mide 22 filas
const PIC_GAP = 4; // columnas entre pictograma y texto (o filas, en vertical)
const PITCH = 6; // px por celda a tamaño de escritorio
const R = 0.38; // radio del punto

const EMBER = "#E8620A";
// Colores reales de las señales (excepción a la paleta, solo en el pictograma)
const RED = "#D8232A";
const WHITE = "#F4F4F2";
const BLACK = "#1C2436"; // "negro" de las señales: gris azulado oscuro; único sitio para cambiarlo (negro puro: #05070C)
const BLUE = "#0A58C9";

const HOLD_MS = 3000;
const HOLD_LAST_MS = 5000;
const FIRST_ON_MS = 1200; // duración del primer encendido, antes de contar la espera
const DARK_MS = 300;
const LAPS = 2;

/* ───────────── Tipografía ───────────── */

const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
  "¿": ["00100", "00000", "00100", "01000", "10000", "10001", "01110"],
  "-": ["0000", "0000", "0000", "1111", "0000", "0000", "0000"],
  "'": ["1", "1", "0", "0", "0", "0", "0"],
};
// Letras con acento: letra base + fila superior
const ACCENTS: Record<string, [string, string]> = {
  É: ["E", "00010"],
  Í: ["I", "00010"],
  Ó: ["O", "00010"],
  Ú: ["U", "00010"],
  À: ["A", "01000"],
};

/** Filas (ROWS) de un carácter; el acento va en la fila 0. */
function rowsOf(ch: string): string[] {
  if (ch === " ") return Array(ROWS).fill("0".repeat(SPACE_W));
  const acc = ACCENTS[ch];
  if (acc) return [acc[1], ...GLYPHS[acc[0]]];
  const g = GLYPHS[ch];
  if (!g) return Array(ROWS).fill("0");
  return ["0".repeat(g[0].length), ...g];
}

function lineBitmap(text: string): { cols: number; on: [number, number][] } {
  const on: [number, number][] = [];
  let x = 0;
  const chars = Array.from(text);
  chars.forEach((ch, i) => {
    const rows = rowsOf(ch);
    rows.forEach((row, y) => Array.from(row).forEach((b, dx) => b === "1" && on.push([x + dx, y])));
    x += rows[0].length + (i < chars.length - 1 ? GAP : 0);
  });
  return { cols: x, on };
}

/* ───────────── Pictogramas (PIC × PIC celdas) ───────────── */

type Cell = { x: number; y: number; c: string };

function pointInTri(px: number, py: number, a: number[], b: number[], c: number[]) {
  const s = (p: number[], q: number[]) => (px - q[0]) * (p[1] - q[1]) - (p[0] - q[0]) * (py - q[1]);
  const d1 = s(a, b), d2 = s(b, c), d3 = s(c, a);
  return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
}

const cells = (fn: (x: number, y: number) => string | null): Cell[] => {
  const out: Cell[] = [];
  for (let y = 0; y < PIC; y++) for (let x = 0; x < PIC; x++) {
    const c = fn(x, y);
    if (c) out.push({ x, y, c });
  }
  return out;
};

const inSet = (set: string[], x: number, y: number, ox = 0, oy = 0) => set[y - oy]?.[x - ox] === "1";

/** 1 · Peligro (triángulo): borde rojo de 2 puntos, fondo blanco, exclamación negra */
function pictoDanger(): Cell[] {
  const f = PIC / 18;
  const A = [PIC / 2, 0.3 * f], B = [PIC - 0.3 * f, 16.7 * f], C = [0.3 * f, 16.7 * f];
  // Triángulo interior: el exterior reducido hacia su incentro (borde ≈ 1,6 puntos)
  const la = Math.hypot(B[0] - C[0], B[1] - C[1]);
  const lb = Math.hypot(A[0] - C[0], A[1] - C[1]);
  const lc = Math.hypot(A[0] - B[0], A[1] - B[1]);
  const G = [(la * A[0] + lb * B[0] + lc * C[0]) / (la + lb + lc), (la * A[1] + lb * B[1] + lc * C[1]) / (la + lb + lc)];
  const area = Math.abs((B[0] - A[0]) * (C[1] - A[1]) - (C[0] - A[0]) * (B[1] - A[1])) / 2;
  const inr = area / ((la + lb + lc) / 2);
  const k = (inr - 1.6) / inr;
  const sc = (p: number[]) => [G[0] + (p[0] - G[0]) * k, G[1] + (p[1] - G[1]) * k];
  const [ia, ib, ic] = [sc(A), sc(B), sc(C)];
  return cells((x, y) => {
    const px = x + 0.5, py = y + 0.5;
    if (!pointInTri(px, py, A, B, C)) return null;
    if (!pointInTri(px, py, ia, ib, ic)) return RED;
    if ((x === 9 || x === 10) && ((y >= 7 && y <= 12) || y === 14 || y === 15)) return BLACK;
    return WHITE;
  });
}

const ring = (x: number, y: number) => Math.hypot(x + 0.5 - PIC / 2, y + 0.5 - PIC / 2);
const RING_OUT = PIC / 2; // aro rojo de 2 puntos: radio exterior 10, interior 8
const RING_IN = RING_OUT - 2;

/** 2 · Anchura máxima: círculo, dos flechas enfrentadas con un hueco de 2 puntos */
function pictoWidth(): Cell[] {
  // Flecha izquierda (la derecha es su espejo): eje 4×2 y cabeza triangular de 3 columnas
  const head: Record<number, [number, number]> = { 6: [7, 12], 7: [8, 11], 8: [9, 10] };
  const arrow = (x: number, y: number) => {
    if (x >= 2 && x <= 5 && (y === 9 || y === 10)) return true;
    const h = head[x];
    return !!h && y >= h[0] && y <= h[1];
  };
  return cells((x, y) => {
    const r = ring(x, y);
    if (r > RING_OUT) return null;
    if (r > RING_IN) return RED;
    return arrow(x, y) || arrow(PIC - 1 - x, y) ? BLACK : WHITE;
  });
}

// Camión de perfil: cabina baja a la izquierda, caja, chasis y dos ruedas
const TRUCK = [
  "....#######",
  ".##.#######",
  "###.#######",
  "###########",
  "###########",
  ".##....##..",
  ".##....##..",
].map((r) => r.replace(/#/g, "1").replace(/\./g, "0"));

/** 3 · Entrada prohibida a vehículos de mercancías: círculo con camión */
function pictoTruck(): Cell[] {
  return cells((x, y) => {
    const r = ring(x, y);
    if (r > RING_OUT) return null;
    if (r > RING_IN) return RED;
    return inSet(TRUCK, x, y, 4, 6) ? BLACK : WHITE;
  });
}

/** 4 · Información: cuadrado azul con "i" blanca */
function pictoInfo(): Cell[] {
  return cells((x, y) => {
    if ((x === 0 || x === PIC - 1) && (y === 0 || y === PIC - 1)) return null;
    const dot = (x === 9 || x === 10) && (y === 4 || y === 5);
    const stem = (x === 9 || x === 10) && y >= 8 && y <= 15;
    const flag = y === 8 && x >= 8 && x <= 10;
    const foot = y === 16 && x >= 7 && x <= 12;
    return dot || stem || flag || foot ? WHITE : BLUE;
  });
}

const PICTOS = [pictoDanger(), pictoWidth(), pictoTruck(), pictoInfo()];

/* ───────────── Componente ───────────── */

function useMedia(query: string) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener("change", on);
    on();
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}

export default function DotSign({ messages }: { messages: string[][] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-100px" });
  const vertical = useMedia("(max-width: 639px)");
  const [reduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const last = messages.length - 1;
  const total = messages.length * LAPS; // pasos de la secuencia; el último queda fijo
  const [step, setStep] = useState(reduced ? total - 1 : 0);
  const [lit, setLit] = useState(reduced);
  const [first, setFirst] = useState(!reduced); // primer encendido, con barrido de columnas
  const [started, setStarted] = useState(reduced);

  useEffect(() => {
    if (inView && !started) {
      setStarted(true);
      setLit(true);
    }
  }, [inView, started]);

  useEffect(() => {
    if (reduced || !inView || !started || (lit && step === total - 1)) return;
    const idx = step % messages.length;
    const hold = (idx === last ? HOLD_LAST_MS : HOLD_MS) + (first ? FIRST_ON_MS : 0);
    const id = window.setTimeout(
      () => {
        if (lit) {
          setLit(false);
          setFirst(false);
        } else {
          setStep(step + 1);
          setLit(true);
        }
      },
      lit ? hold : DARK_MS
    );
    return () => window.clearTimeout(id);
  }, [reduced, inView, started, lit, step, first, total, last, messages.length]);

  // Geometría común a todos los mensajes (el cartel nunca cambia de tamaño)
  const layout = useMemo(() => {
    const maps = messages.map((m) => m.map(lineBitmap));
    const textCols = Math.max(...maps.flat().map((l) => l.cols));
    const side = !vertical;
    const cols = side ? MARGIN_X * 2 + PIC + PIC_GAP + textCols : MARGIN_X * 2 + Math.max(PIC, textCols);
    const rows = side ? MARGIN_Y * 2 + PIC : MARGIN_Y * 2 + PIC + PIC_GAP + TEXT_H;
    const textX = side ? MARGIN_X + PIC + PIC_GAP : MARGIN_X + Math.floor((cols - MARGIN_X * 2 - textCols) / 2);
    const textY = side ? MARGIN_Y + (PIC - TEXT_H) / 2 : MARGIN_Y + PIC + PIC_GAP;
    const picX = side ? MARGIN_X : Math.floor((cols - PIC) / 2);
    return { maps, textCols, cols, rows, textX, textY, picX, picY: MARGIN_Y };
  }, [messages, vertical]);

  const { cols, rows } = layout;
  const idx = step % messages.length;
  const d = (x: number) => ({ ["--d" as string]: `${Math.round(((x + 0.5) / cols) * 1000)}ms` });

  const text: { x: number; y: number }[] = [];
  if (lit) {
    layout.maps[idx].forEach((line, li) => {
      const ox = layout.textX + Math.floor((layout.textCols - line.cols) / 2);
      const oy = layout.textY + li * (ROWS + LINE_GAP);
      line.on.forEach(([x, y]) => text.push({ x: ox + x, y: oy + y }));
    });
  }
  const pic = lit ? (PICTOS[idx] ?? []).map((c) => ({ x: layout.picX + c.x, y: layout.picY + c.y, c: c.c })) : [];

  return (
    <div className="max-sm:-mx-3">
      <div
        ref={ref}
        aria-hidden="true"
        data-msg={lit ? idx : "off"}
        className={`mx-auto rounded-lg border border-white/10 bg-obsidian overflow-hidden ${lit ? (first ? "sign-on" : "sign-now") : ""}`}
        style={{ width: `min(100%, ${cols * PITCH}px)` }}
      >
        <svg viewBox={`0 0 ${cols} ${rows}`} className="block w-full h-auto">
          <defs>
            <pattern id="sign-off" width={1} height={1} patternUnits="userSpaceOnUse">
              <circle cx={0.5} cy={0.5} r={R} fill={EMBER} fillOpacity={0.08} />
            </pattern>
          </defs>
          <rect width={cols} height={rows} fill="url(#sign-off)" />
          <g>
            {pic.filter((p) => p.c !== BLACK).map((p) => (
              <circle key={`${idx}p${p.x},${p.y}`} cx={p.x + 0.5} cy={p.y + 0.5} r={R} fill={p.c} className="sign-dot" style={d(p.x)} />
            ))}
          </g>
          <g>
            {pic.filter((p) => p.c === BLACK).map((p) => (
              <circle key={`${idx}k${p.x},${p.y}`} cx={p.x + 0.5} cy={p.y + 0.5} r={R} fill={BLACK} className="sign-dot" style={d(p.x)} />
            ))}
          </g>
          <g fill={EMBER} className="sign-lit">
            {text.map(({ x, y }) => (
              <circle key={`${idx}t${x},${y}`} cx={x + 0.5} cy={y + 0.5} r={R} className="sign-dot" style={d(x)} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
