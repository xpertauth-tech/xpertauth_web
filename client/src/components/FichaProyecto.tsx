import { useTranslations } from "@/i18n/context";

type Resp = "yes" | "no" | "study";
interface Fila { q: string; a: Resp; note: string }

// Ficha del proyecto: impreso con casillas. Los textos están en messages/*.ts (sección "ficha").
export default function FichaProyecto() {
  const { messages: m } = useTranslations("ficha");
  const filas = m.rows as Fila[];
  const opciones = m.options as Record<Resp, string>;

  return (
    <section className="section-y px-6" style={{ background: "#0A0E1A" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div className="head-gap text-center">
          <span className="t-label">{m.label}</span>
          <h2 className="t-h2 text-pure">{m.title}</h2>
          <p className="t-lead ficha-entrada text-white/70 lead-gap">{m.intro}</p>
        </div>

        <div className="ficha-impreso">
          <div className="ficha-cab">{m.header}</div>
          {filas.map((f, i) => {
            const orden: Resp[] = f.a === "study" ? ["yes", "no", "study"] : ["yes", "no"];
            return (
              <div key={i} className="ficha-fila">
                <div className="ficha-celda ficha-pregunta">{f.q}</div>
                <div className="ficha-celda">
                  <div className="ficha-opciones">
                    {orden.map((o) => (
                      <span key={o} className={`ficha-op${o === f.a ? " marcada" : ""}`}>
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
                <div className="ficha-celda ficha-nota">{f.note}</div>
              </div>
            );
          })}
          <div className="ficha-pie">{m.footer}</div>
        </div>
      </div>
    </section>
  );
}
