import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/context";
import { useAgent } from "@/App";
import ContactModal from "./ContactModal";
import { TEXTOS } from "./AgentChat";

// Sección «Así trabaja LEX»: animación plana que se reproduce una sola vez, cuando entra en pantalla,
// y se queda en el estado final (≈ 9 s). Con «reducir movimiento» se muestra directamente el estado final.
// Solo CSS (clases ax-* en index.css) y temporizadores; sin librerías.

// Siglas de las fichas: no se traducen.
const FUENTES = ["BOE", "DGT", "SCT", "DOGC"];
const FILA_ELEGIDAS = ["BOE", "DGT", "SCT"];
// Índices de las 3 fichas elegidas (BOE, DGT, SCT) según el número de fichas.
const ELEGIDAS = { escritorio: [4, 13, 22], movil: [8, 1, 6] };
const FICHAS = { escritorio: 24, movil: 12 };
const COLUMNAS = { escritorio: 6, movil: 4 };
// Alto del hueco (px) donde se colocan las 3 elegidas, medido desde arriba de la rejilla.
const CENTRO_FILA_Y = { escritorio: 40, movil: 38 };
const HUECO = 12;

// Inicio de cada etapa (ms): 0 pregunta · 1 busca · 2 selecciona · 3 explica (denso → frase, ≈ 3,8 s) · 4 sello · 5 botón (final)
const INICIO = [0, 2000, 4400, 6200, 10000, 11000];
const ESCRIBIR_MS = 1900;
const FINAL = 5;

// Se reproduce una sola vez por carga de página (aunque se cambie de idioma y se vuelva a montar).
let yaReproducida = false;

type Pos = { tx: number; ty: number; s: number };

// ─── «De lo denso a lo claro» (paso 4): un bloque apretado de letra diminuta ilegible se aplasta y deja
// paso a la frase de la página de LEX, palabra a palabra. ───
// Filas de barritas: segmentos de ancho variable, deterministas (sin azar) para que no cambien entre renders.
const FILAS_DENSAS: { fin: number; seg: number[] }[] = Array.from({ length: 13 }, (_, r) => {
  let x = 7 + r * 13;
  const rnd = () => ((x = (x * 73 + 41) % 997) / 997);
  const n = 6 + Math.floor(rnd() * 4);
  return { fin: r === 12 ? 46 : 90 + Math.floor(rnd() * 11), seg: Array.from({ length: n }, () => 2 + Math.floor(rnd() * 9)) };
});

function DeLoDensoAClaro({ etapa, frase, filas, animar }: { etapa: number; frase: string; filas: number; animar: boolean }) {
  const palabras = frase.split(" ");
  const visibles = filas >= 13 ? FILAS_DENSAS : [...FILAS_DENSAS.slice(0, filas - 1), FILAS_DENSAS[12]];
  return (
    <div className="ax-zona-texto">
      {animar && etapa >= 3 && (
        <div className="ax-denso-w" aria-hidden="true">
          <div className="ax-denso">
            {visibles.map((f, r) => (
              <div key={r} className="ax-fila" style={{ width: `${f.fin}%`, ["--r" as string]: r } as React.CSSProperties}>
                {f.seg.map((w, i) => (
                  <span key={i} style={{ flexGrow: w }} />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      <p className={`ax-frase ${etapa < 3 ? "ax-off" : ""}`}>
        {palabras.map((w, i) => (
          <span key={i} className={`ax-pal ${animar && etapa >= 3 ? "ax-pal-in" : ""}`} style={{ ["--w" as string]: i } as React.CSSProperties}>
            {w}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}

export default function AsiTrabajaLex() {
  const { messages, locale } = useTranslations("lexTrabaja");
  const m = messages as any;
  const { abrirAgente } = useAgent();
  const [contactOpen, setContactOpen] = useState(false);

  const reducir = useRef(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches).current;
  const saltar = reducir || yaReproducida;
  const pregunta: string = m.question;
  // La frase es la de la página de LEX (AgentChat.TEXTOS), sin duplicar la traducción.
  const frase: string = TEXTOS[locale === "ca" || locale === "en" || locale === "fr" ? locale : "es"].fraseLex;

  const [movil, setMovil] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches);
  const [etapa, setEtapa] = useState(saltar ? FINAL : -1);
  const [tecleado, setTecleado] = useState(saltar ? pregunta.length : 0);
  const [pos, setPos] = useState<Pos[] | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const rejillaRef = useRef<HTMLDivElement>(null);
  const fichaRefs = useRef<(HTMLDivElement | null)[]>([]);

  const modo = movil ? "movil" : "escritorio";
  const elegidas = ELEGIDAS[modo];
  const total = FICHAS[modo];
  const columnas = COLUMNAS[modo];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const f = () => setMovil(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  // Posición de las 3 elegidas en la fila central (se recalcula si cambia el ancho).
  const medir = useCallback(() => {
    const g = rejillaRef.current;
    if (!g) return;
    const r = elegidas.map((i) => fichaRefs.current[i]);
    if (r.some((e) => !e)) return;
    const cw = r[0]!.offsetWidth;
    const ch = r[0]!.offsetHeight;
    const W = g.clientWidth;
    const s = Math.min(1.5, (W - 2 * HUECO) / (3 * cw));
    const paso = cw * s + HUECO;
    const cx = W / 2;
    const cy = CENTRO_FILA_Y[modo];
    setPos(
      r.map((e, k) => ({
        tx: cx + (k - 1) * paso - (e!.offsetLeft + cw / 2),
        ty: cy - (e!.offsetTop + ch / 2),
        s,
      }))
    );
  }, [elegidas, modo]);

  useLayoutEffect(() => {
    medir();
    const g = rejillaRef.current;
    if (!g || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(medir);
    ro.observe(g);
    return () => ro.disconnect();
  }, [medir]);

  // Línea de tiempo: arranca una vez, cuando el panel entra en pantalla.
  useEffect(() => {
    if (saltar) {
      setEtapa(FINAL);
      setTecleado(pregunta.length);
      return;
    }
    const el = panelRef.current;
    if (!el) return;
    const timers: number[] = [];
    let iniciada = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || iniciada) return;
        iniciada = true;
        io.disconnect();
        setEtapa(0);
        const paso = ESCRIBIR_MS / pregunta.length;
        for (let i = 1; i <= pregunta.length; i++) timers.push(window.setTimeout(() => setTecleado(i), i * paso));
        for (let k = 1; k <= FINAL; k++) timers.push(window.setTimeout(() => setEtapa(k), INICIO[k]));
        timers.push(window.setTimeout(() => { yaReproducida = true; }, INICIO[FINAL]));
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [saltar, pregunta]);

  const encendidos = etapa < 0 ? 0 : Math.min(etapa, 4) + 1;
  const estado: string = etapa >= 1 && etapa <= 3 ? m.status[etapa - 1] : "";
  const sellado = etapa >= 4;

  return (
    <section id="asi-trabaja-lex" className="section-y bg-obsidian border-b border-white/10" data-testid="section-asi-trabaja-lex">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="t-h2 text-pure text-center mb-4">{m.title}</h2>
        <p className="ax-sub head-gap">{m.subtitle}</p>

        <div className="max-w-3xl mx-auto">
          <div ref={panelRef} className="ax-panel" key={locale}>
            <p className="sr-only">{m.question} {m.sealTitle}: {FILA_ELEGIDAS.join(" · ")}</p>
            <div aria-hidden="true">
              {/* 1 · Pregunta */}
              <div className="flex justify-end">
                <div className={`ax-burbuja ${etapa < 0 ? "ax-off" : ""}`}>
                  <span>{pregunta.slice(0, tecleado)}</span>
                  {etapa === 0 && <span className="ax-caret" />}
                  <span className="invisible">{pregunta.slice(tecleado)}</span>
                </div>
              </div>

              {/* Frase de estado: la altura queda reservada */}
              <div className="ax-estado">
                {estado && <span key={etapa} className="ax-fade">{estado}</span>}
              </div>

              {/* Zona de trabajo: altura fija para que la página no salte */}
              <div className="ax-escena">
                <div ref={rejillaRef} className="ax-rejilla">
                  {etapa >= 1 && etapa <= 2 && <span className="ax-barrido" />}
                  {Array.from({ length: total }, (_, i) => {
                    const k = elegidas.indexOf(i);
                    const esElegida = k >= 0;
                    const col = i % columnas;
                    const p = esElegida && pos ? pos[k] : null;
                    const fuera = etapa >= 2 && !esElegida;
                    const styleW: React.CSSProperties = {
                      ["--ax-d" as string]: `${((i * 7) % 21) * 0.03}s`,
                    };
                    if (esElegida && etapa >= 2 && p) styleW.transform = `translate(${p.tx}px, ${p.ty}px) scale(${p.s})`;
                    const styleC: React.CSSProperties = {
                      ["--i" as string]: i,
                      ["--lit" as string]: `${0.8 + (1.2 * (col + 0.5)) / columnas}s`,
                    };
                    const claseC = [
                      "ax-ficha",
                      etapa < 1 ? "ax-ficha-oculta" : etapa === 1 ? "ax-ficha-in" : "",
                      esElegida && etapa >= 2 ? "ax-ficha-sel" : "",
                      esElegida && sellado ? "ax-ficha-ember" : "",
                    ].join(" ");
                    return (
                      <div
                        key={i}
                        ref={(e) => { fichaRefs.current[i] = e; }}
                        className={`ax-w ${fuera ? "ax-w-fuera" : ""} ${esElegida && etapa >= 2 ? "ax-w-sel" : ""}`}
                        style={styleW}
                      >
                        <div className={claseC} style={styleC}>
                          {esElegida ? FILA_ELEGIDAS[k] : FUENTES[i % 4]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <DeLoDensoAClaro etapa={etapa} frase={frase} filas={movil ? 8 : 13} animar={!saltar} />

                <div className="ax-zona-sello">
                  <div className={`ax-sello ${sellado ? "ax-sello-in" : "ax-off"}`}>
                    {sellado && <span className="ax-onda" />}
                    <div className="ax-sello-caja">
                      <span className="ax-sello-t">{m.sealTitle}</span>
                      <span className="ax-sello-f">BOE · DGT · SCT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`ax-boton ${etapa >= FINAL ? "ax-boton-on" : ""}`}>
              <button type="button" onClick={() => abrirAgente("LEX")} className="btn btn-primary" data-testid="button-lex-accion" tabIndex={etapa >= FINAL ? 0 : -1}>
                {m.cta}
              </button>
            </div>
          </div>

          {/* Indicador de 5 pasos */}
          <ol className="ax-pasos" aria-label={m.title}>
            <span className="ax-pasos-linea" aria-hidden="true" />
            <span className="ax-pasos-relleno" aria-hidden="true" style={{ width: `calc(80% * ${Math.max(encendidos - 1, 0)} / 4)` }} />
            {(m.steps as string[]).map((s, i) => (
              <li key={i} className={`ax-paso ${i < encendidos ? "ax-paso-on" : ""}`}>
                <span className="ax-paso-n" aria-hidden="true">{i + 1}</span>
                <span className="sr-only sm:not-sr-only ax-paso-t">{s}</span>
              </li>
            ))}
          </ol>
          <p className="ax-paso-movil" aria-hidden="true">{encendidos > 0 ? m.steps[encendidos - 1] : ""}</p>

          <div className="text-center mt-8">
            <p className="ax-aviso">{m.disclaimer}</p>
            <button type="button" onClick={() => setContactOpen(true)} className="btn btn-secondary btn-small mt-3" data-testid="link-lex-cuentanos">
              {m.contactBtn}
            </button>
          </div>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}
