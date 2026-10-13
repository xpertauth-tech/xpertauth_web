import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/i18n/context";

type Resp = "yes" | "no" | "study";
interface Fila { q: string; a: Resp; note: string }

const INICIO_MS = 800; // pausa antes de la primera casilla
const PASO_MS = 600; // entre casilla y casilla (en total, unos 5 s)
const VISIBLE_MIN = 0.6; // el impreso debe verse al menos en un 60 %

// Ficha del proyecto: impreso con casillas. Los textos están en messages/*.ts (sección "ficha").
// Las casillas son decorativas (aria-hidden): cada fila se lee como "pregunta — respuesta — aclaración".
export default function FichaProyecto() {
  const { messages: m } = useTranslations("ficha");
  const filas = m.rows as Fila[];
  const opciones = m.options as Record<Resp, string>;

  const ref = useRef<HTMLDivElement>(null);
  const [visto, setVisto] = useState(false);
  const [reducir] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [marcadas, setMarcadas] = useState(reducir ? filas.length : 0);

  // Se considera visto cuando se ve el 60 % del impreso o, si es más alto que la ventana (móvil),
  // cuando ocupa el 60 % del alto de la ventana. Una sola vez.
  useEffect(() => {
    const el = ref.current;
    if (reducir || !el || !("IntersectionObserver" in window)) {
      setVisto(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        const referencia = Math.min(e.boundingClientRect.height, e.rootBounds?.height ?? window.innerHeight);
        if (e.isIntersecting && e.intersectionRect.height >= VISIBLE_MIN * referencia) {
          setVisto(true);
          obs.disconnect();
        }
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reducir]);

  // Una vez visto: pausa inicial y las casillas se marcan una a una
  useEffect(() => {
    if (reducir || !visto) return;
    const ids = filas.map((_, i) => window.setTimeout(() => setMarcadas(i + 1), INICIO_MS + PASO_MS * i));
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [visto, reducir, filas.length]);

  return (
    <section className="ficha-seccion px-6">
      <div className="ficha-pantalla">
      <div style={{ maxWidth: 980, width: "100%", margin: "0 auto" }}>
        <div className="ficha-head">
          <span className="t-label">{m.label}</span>
          <h2 className="t-h2 text-pure">{m.title}</h2>
          <p className="t-lead ficha-entrada text-white/70">{m.intro}</p>
        </div>

        <div className="ficha-impreso" ref={ref}>
          <div className="ficha-cab">{m.header}</div>
          <div role="list">
          {filas.map((f, i) => {
            const orden: Resp[] = f.a === "study" ? ["yes", "no", "study"] : ["yes", "no"];
            return (
              <div key={i} className="ficha-fila" role="listitem">
                <span className="sr-only">{f.q} — {opciones[f.a]} — {f.note}</span>
                <div className="ficha-celda ficha-pregunta" aria-hidden="true">{f.q}</div>
                <div className="ficha-celda" aria-hidden="true">
                  <div className="ficha-opciones">
                    {orden.map((o) => (
                      <span key={o} className={`ficha-op${o === f.a && i < marcadas ? " marcada" : ""}`}>
                        <span className="ficha-caja">
                          {o === f.a && (
                            <svg viewBox="0 0 20 20"><path pathLength={1} d="M5 10.5l3.4 3.4L15 6.6" /></svg>
                          )}
                        </span>
                        {opciones[o]}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="ficha-celda ficha-nota" aria-hidden="true">{f.note}</div>
              </div>
            );
          })}
          </div>
          <div className="ficha-pie">{m.footer}</div>
        </div>
      </div>
      </div>
    </section>
  );
}
