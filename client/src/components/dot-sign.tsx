import { useRef } from "react";
import { useInView } from "framer-motion";

/**
 * Cartel de matriz de puntos tipo panel de mensaje variable de autopista.
 * SVG generado en código con una tipografía propia de 5×7 (más una fila
 * superior para el acento de la É). Solo incluye los caracteres de los 4
 * idiomas. Los puntos se encienden columna a columna una sola vez al entrar
 * en pantalla (.sign-on / .sign-dot en index.css); con reducir movimiento
 * aparece ya encendido.
 */

const ROWS = 8; // 1 de acento + 7 de letra
const GAP = 1; // columnas entre caracteres
const LINE_GAP = 2; // filas entre líneas
const MARGIN_X = 3;
const MARGIN_Y = 2;
const SPACE_W = 3;
const EMBER = "#E8620A";
const PITCH = 7; // px por celda a tamaño de escritorio

const glyph = (...rows: string[]) => rows;
const GLYPHS: Record<string, string[]> = {
  A: glyph("01110", "10001", "10001", "11111", "10001", "10001", "10001"),
  C: glyph("01110", "10001", "10000", "10000", "10000", "10001", "01110"),
  E: glyph("11111", "10000", "10000", "11110", "10000", "10000", "11111"),
  I: glyph("01110", "00100", "00100", "00100", "00100", "00100", "01110"),
  L: glyph("10000", "10000", "10000", "10000", "10000", "10000", "11111"),
  N: glyph("10001", "11001", "10101", "10011", "10001", "10001", "10001"),
  O: glyph("01110", "10001", "10001", "10001", "10001", "10001", "01110"),
  P: glyph("11110", "10001", "10001", "11110", "10000", "10000", "10000"),
  R: glyph("11110", "10001", "10001", "11110", "10100", "10010", "10001"),
  S: glyph("01111", "10000", "10000", "01110", "00001", "00001", "11110"),
  T: glyph("11111", "00100", "00100", "00100", "00100", "00100", "00100"),
  U: glyph("10001", "10001", "10001", "10001", "10001", "10001", "01110"),
  V: glyph("10001", "10001", "10001", "10001", "10001", "01010", "00100"),
  X: glyph("10001", "10001", "01010", "00100", "01010", "10001", "10001"),
  Y: glyph("10001", "10001", "01010", "00100", "00100", "00100", "00100"),
  Z: glyph("11111", "00001", "00010", "00100", "01000", "10000", "11111"),
  "-": glyph("0000", "0000", "0000", "1111", "0000", "0000", "0000"),
  "'": glyph("1", "1", "0", "0", "0", "0", "0"),
};

/** Devuelve las filas (ROWS) de un carácter; la É lleva el acento en la fila 0. */
function rowsOf(ch: string): string[] {
  if (ch === " ") return Array(ROWS).fill("0".repeat(SPACE_W));
  if (ch === "É") return ["00010", ...GLYPHS.E];
  const g = GLYPHS[ch];
  if (!g) return Array(ROWS).fill("0");
  return ["0".repeat(g[0].length), ...g];
}

function lineBitmap(text: string): { cols: number; on: Set<string> } {
  const on = new Set<string>();
  let x = 0;
  Array.from(text).forEach((ch, i) => {
    const rows = rowsOf(ch);
    rows.forEach((row, y) => Array.from(row).forEach((b, dx) => b === "1" && on.add(`${x + dx},${y}`)));
    x += rows[0].length + (i < text.length - 1 ? GAP : 0);
  });
  return { cols: x, on };
}

export default function DotSign({ lines }: { lines: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-100px" });

  const maps = lines.map(lineBitmap);
  const maxCols = Math.max(...maps.map((m) => m.cols));
  const cols = maxCols + MARGIN_X * 2;
  const rows = lines.length * ROWS + (lines.length - 1) * LINE_GAP + MARGIN_Y * 2;

  const dots: { x: number; y: number }[] = [];
  maps.forEach((m, li) => {
    const ox = MARGIN_X + Math.floor((maxCols - m.cols) / 2);
    const oy = MARGIN_Y + li * (ROWS + LINE_GAP);
    m.on.forEach((k) => {
      const [x, y] = k.split(",").map(Number);
      dots.push({ x: ox + x, y: oy + y });
    });
  });

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`mx-auto rounded-lg border border-white/10 bg-obsidian overflow-hidden ${seen ? "sign-on" : ""}`}
      style={{ width: `min(100%, ${cols * PITCH}px)` }}
    >
      <svg viewBox={`0 0 ${cols} ${rows}`} className="block w-full h-auto">
        <defs>
          <pattern id="sign-off" width={1} height={1} patternUnits="userSpaceOnUse">
            <circle cx={0.5} cy={0.5} r={0.38} fill={EMBER} fillOpacity={0.08} />
          </pattern>
        </defs>
        <rect width={cols} height={rows} fill="url(#sign-off)" />
        <g fill={EMBER} className="sign-lit">
          {dots.map(({ x, y }) => (
            <circle
              key={`${x},${y}`}
              cx={x + 0.5}
              cy={y + 0.5}
              r={0.38}
              className="sign-dot"
              style={{ ["--d" as string]: `${Math.round(((x + 0.5) / cols) * 1000)}ms` }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
