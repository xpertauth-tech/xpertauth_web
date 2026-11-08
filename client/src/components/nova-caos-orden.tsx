import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { useAgent } from "@/App";
import ContactModal from "./ContactModal";
import { TEXTOS } from "./AgentChat";
import { sumarDias, sumarMeses, formatoFecha } from "@/lib/fechas";

// Sección «Del caos al orden» (NOVA): animación plana que se reproduce una sola vez, cuando entra en pantalla
// (≈ 11 s), y se queda en el estado final. Con «reducir movimiento» se muestra directamente el estado final.
// Solo CSS (clases nv-* y las ax-* compartidas con «Así trabaja LEX» en index.css) y temporizadores; sin librerías.

type Aviso = "urgente" | "proximo" | "aldia";
type Gestion = "controlado" | "pendiente" | null;
type Fila = {
  venc: "itv" | "seguro" | "tacografo" | "cap" | "frenos" | "medica" | "acc";
  veh: { tipo?: "tractora" | "camion" | "conductor"; n?: string; matricula?: string; siglas?: string };
  dias?: number;
  meses?: number;
  extraDias?: number;
  aviso: Aviso;
  gestion: Gestion;
};

// Orden por fecha. Matrículas, «ACC genérica DGT» y las siglas JEA y CPG no se traducen.
const FILAS: Fila[] = [
  { venc: "itv", veh: { tipo: "tractora", n: "27" }, dias: 5, aviso: "urgente", gestion: "controlado" },
  { venc: "seguro", veh: { matricula: "R-1085-UIE" }, dias: 12, aviso: "urgente", gestion: "pendiente" },
  { venc: "tacografo", veh: { tipo: "camion", n: "14" }, dias: 34, aviso: "proximo", gestion: "controlado" },
  { venc: "cap", veh: { tipo: "conductor", n: "12", siglas: "JEA" }, dias: 41, aviso: "proximo", gestion: "pendiente" },
  { venc: "frenos", veh: { matricula: "R-2047-AEO" }, dias: 58, aviso: "proximo", gestion: "controlado" },
  { venc: "itv", veh: { tipo: "tractora", n: "8" }, meses: 7, aviso: "aldia", gestion: null },
  { venc: "medica", veh: { tipo: "conductor", n: "7", siglas: "CPG" }, meses: 7, extraDias: 15, aviso: "aldia", gestion: null },
  { venc: "acc", veh: { tipo: "tractora", n: "31" }, meses: 8, aviso: "aldia", gestion: null },
];
// En móvil se quitan «Revisión de frenos» (índice 4) e «ITV Tractora 8» (índice 5).
const FILAS_MOVIL = FILAS.filter((_, i) => i !== 4 && i !== 5);

// Colores pálidos de los papeles (crema, azul, rosa, verde, melocotón, lila, gris Mist y un turquesa pálido para el octavo).
const PAPELES = ["#FBF3DC", "#DCE8FA", "#F8DDE4", "#DCF0E0", "#FBE0CF", "#E6DEF6", "#F4F6FA", "#D9F0F0"];
// Posición desordenada de cada papel: l/t = % del recorrido libre, r = giro plano (grados).
const DESORDEN = [
  { l: 8, t: 55, r: -7 }, { l: 62, t: 10, r: 6 }, { l: 30, t: 72, r: 11 }, { l: 78, t: 62, r: -12 },
  { l: 14, t: 12, r: 5 }, { l: 46, t: 34, r: -4 }, { l: 92, t: 30, r: 9 }, { l: 52, t: 88, r: -9 },
];
const MODOS = {
  escritorio: { fila: 32, hueco: 4, papelAncho: 34, papelAlto: 64 },
  movil: { fila: 50, hueco: 6, papelAncho: 54, papelAlto: 64 },
};

// Inicio de cada etapa (ms): 0 pregunta · 1 desorden · 2 orden · 3 sencillo · 4 sello · 5 botón (final)
const INICIO = [0, 2500, 4800, 7000, 10000, 11000];
const ESCRIBIR_MS = 2500; // la pregunta termina de escribirse a los 2,5 s, cuando empieza el desorden
const FINAL = 5;

// Se reproduce una sola vez por carga de página (aunque se cambie de idioma y se vuelva a montar).
let yaReproducida = false;

export default function NovaCaosOrden() {
  const { messages, locale } = useI18n();
  const m = (messages as any).novaCaos;
  const contactBtn: string = (messages as any).lexTrabaja.contactBtn; // «Cuéntanos tu caso»: se reutiliza el de LEX
  const { abrirAgente } = useAgent();
  const [contactOpen, setContactOpen] = useState(false);

  const reducir = useRef(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches).current;
  const saltar = reducir || yaReproducida;
  const pregunta: string = m.question;
  // La frase final es la de la página de NOVA (AgentChat.TEXTOS), sin duplicar la traducción.
  const frase: string = TEXTOS[locale === "ca" || locale === "en" || locale === "fr" ? locale : "es"].fraseNova;

  const [movil, setMovil] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches);
  const [etapa, setEtapa] = useState(saltar ? FINAL : -1);
  const [tecleado, setTecleado] = useState(saltar ? pregunta.length : 0);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fechas: se calculan al cargar la página, a partir del día de la visita.
  const hoy = useMemo(() => new Date(), []);
  const fecha = (f: Fila) => {
    let d = hoy;
    if (f.meses) d = sumarMeses(d, f.meses);
    if (f.dias) d = sumarDias(d, f.dias);
    if (f.extraDias) d = sumarDias(d, f.extraDias);
    return formatoFecha(d);
  };

  const modo = movil ? "movil" : "escritorio";
  const g = MODOS[modo];
  const filas = movil ? FILAS_MOVIL : FILAS;
  const n = filas.length;
  const altoLista = n * g.fila + (n - 1) * g.hueco;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const f = () => setMovil(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

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
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [saltar, pregunta]);

  const animar = !saltar;
  const encendidos = etapa < 0 ? 0 : Math.min(etapa, 3) + 1;
  const estado: string = etapa >= 1 && etapa <= 2 ? m.status[etapa - 1] : "";
  const ordenado = etapa >= 2;
  const sencillo = etapa >= 3;
  const sellado = etapa >= 4;

  const nombreVeh = (f: Fila) => {
    const v = f.veh;
    if (v.matricula) return v.matricula;
    return `${m.terms[v.tipo!]} ${v.n}${v.siglas ? ` · ${v.siglas}` : ""}`;
  };
  const nombreVenc = (f: Fila) => (f.venc === "acc" ? "ACC genérica DGT" : m.terms[f.venc]);

  return (
    <section id="nova-del-caos" className="section-y bg-obsidian border-b border-white/10" data-testid="section-nova-del-caos">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="t-h2 text-pure text-center mb-4">{m.title}</h2>
        <p className="ax-sub head-gap">{m.subtitle}</p>

        <div className="max-w-3xl mx-auto">
          <div ref={panelRef} className="ax-panel" key={locale}>
            <p className="sr-only">{m.question} {frase}</p>
            <div aria-hidden="true">
              {/* 1 · Pregunta */}
              <div className="flex justify-end">
                <div className={`ax-burbuja ${etapa < 0 ? "ax-off" : ""}`}>
                  <span>{pregunta.slice(0, tecleado)}</span>
                  {etapa === 0 && <span className="ax-caret" />}
                  <span className="invisible">{pregunta.slice(tecleado)}</span>
                </div>
              </div>

              <div className="ax-estado">{estado && <span key={etapa} className="ax-fade">{estado}</span>}</div>

              {/* Escena: altura fija desde el principio */}
              <div className="nv-escena">
                <p className={`nv-etiqueta ${sencillo ? (animar ? "ax-fade" : "") : "ax-off"}`}>{m.tag}</p>

                <div className="nv-lista" style={{ height: altoLista }}>
                  {filas.map((f, i) => {
                    const d = DESORDEN[i];
                    const libreY = altoLista - g.papelAlto;
                    const estilo: React.CSSProperties = ordenado
                      ? { left: 0, width: "100%", top: i * (g.fila + g.hueco), height: g.fila, transform: "rotate(0deg)", backgroundColor: "#0F1628", borderColor: "rgba(244,246,250,0.16)", borderRadius: 8 }
                      : { left: `${(d.l * (100 - g.papelAncho)) / 100}%`, width: `${g.papelAncho}%`, top: (d.t * libreY) / 100, height: g.papelAlto, transform: `rotate(${d.r}deg)`, backgroundColor: PAPELES[i], borderColor: "rgba(10,14,26,0.14)", borderRadius: 4 };
                    const clase = [
                      "nv-hoja",
                      etapa < 1 ? "nv-oculta" : etapa === 1 ? "nv-cae" : "",
                      ordenado ? "nv-orden" : "",
                    ].join(" ");
                    return (
                      <div
                        key={i}
                        className={clase}
                        style={{
                          ...estilo,
                          zIndex: i + 1,
                          ["--r" as string]: `${d.r}deg`,
                          ["--c" as string]: `${((i * 1.8) / (n - 1)).toFixed(2)}s`,
                          ["--o" as string]: `${((i * 1.54) / (n - 1)).toFixed(2)}s`,
                          ["--i" as string]: i,
                        } as React.CSSProperties}
                      >
                        {/* Papel (desorden) */}
                        <div className={`nv-c-papel ${ordenado ? "nv-c-papel-off" : ""}`}>
                          <span className="nv-p-venc">{nombreVenc(f)}</span>
                          <span>{nombreVeh(f)}</span>
                          <span>{fecha(f)}</span>
                        </div>
                        {/* Fila de la lista (orden) */}
                        <div className={`nv-c-fila ${ordenado ? "nv-c-fila-on" : ""}`}>
                          <span className="nv-venc">{nombreVenc(f)}</span>
                          <span className="nv-vf">
                            <span className="nv-veh">{nombreVeh(f)}</span>
                            <span className="nv-fecha">{fecha(f)}</span>
                          </span>
                          <span className={`nv-aviso ${sencillo ? (animar ? "nv-enciende" : "") : "ax-off"}`}>
                            {/* Semáforo: excepción de paleta solo para esta lista (urgente / próximo / al día) */}
                            <span className={`nv-badge nv-b-${f.aviso}`}>{m.avisos[f.aviso]}</span>
                          </span>
                          <span className={`nv-gest ${f.gestion === "controlado" ? "nv-g-ok" : ""} ${sencillo ? (animar ? "nv-enciende nv-enciende-g" : "") : "ax-off"}`}>
                            {f.gestion === "controlado" && <><Check size={12} strokeWidth={2.75} color="#4D9FEC" aria-hidden="true" />{m.gestion.controlado}</>}
                            {f.gestion === "pendiente" && m.gestion.pendiente}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="nv-final">
                  <p className={`nv-frase ${!sencillo ? "ax-off" : ""}`}>
                    {frase.split(" ").map((w, i) => (
                      <span key={i} className={`ax-pal ${animar && sencillo ? "nv-pal-in" : ""}`} style={{ ["--w" as string]: i } as React.CSSProperties}>
                        {w}{" "}
                      </span>
                    ))}
                  </p>
                  <div className="nv-sello-w">
                    <div className={`ax-sello ${sellado ? "ax-sello-in" : "ax-off"}`}>
                      {sellado && <span className="ax-onda" />}
                      <div className="ax-sello-caja">
                        <span className="ax-sello-f">{m.sealTitle}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`ax-boton ${etapa >= FINAL ? "ax-boton-on" : ""}`}>
              <button type="button" onClick={() => abrirAgente("NOVA")} className="btn btn-primary" data-testid="button-nova-accion" tabIndex={etapa >= FINAL ? 0 : -1}>
                {m.cta}
              </button>
            </div>
          </div>

          {/* Indicador de 4 pasos */}
          <ol className="ax-pasos ax-pasos-4" aria-label={m.title}>
            <span className="ax-pasos-linea" aria-hidden="true" />
            <span className="ax-pasos-relleno" aria-hidden="true" style={{ width: `calc(75% * ${Math.max(encendidos - 1, 0)} / 3)` }} />
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
            <button type="button" onClick={() => setContactOpen(true)} className="btn btn-secondary btn-small mt-3" data-testid="link-nova-cuentanos">
              {contactBtn}
            </button>
          </div>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}
