import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { useAgent } from "@/App";
import ContactModal from "./ContactModal";
import { AGENTE_CONFIG, Burbuja, TEXTOS, type Idioma, type Mensaje } from "./AgentChat";

// Sección "LEX en acción": ventana de chat que escribe sola, una vez, una pregunta real y muestra
// una respuesta de muestra. La respuesta es TEXTO DE PRUEBA hasta que haya una respuesta real de LEX.

const texts: Record<Idioma, {
  title: string;
  question: string;
  line1: string;
  line2: string;
  lexCta: string;
  novaCta: string;
  novaLine: string;
  fuentes: string;
  captionPre: string;
  captionLink: string;
  captionPost: string;
}> = {
  es: {
    title: "LEX en acción",
    question: "¿Necesito coche piloto con 3,20 m de ancho?",
    line1: "Resuelve tus dudas de normativa al momento.",
    line2: "LEX consulta la base normativa propia y localiza lo que aplica a tu caso, con la fuente citada.",
    lexCta: "Pregunta a LEX",
    novaCta: "Pregunta a NOVA",
    novaLine: "Ideas para usar la IA en tu empresa de transporte.",
    fuentes: "Fuentes:",
    captionPre: "Ejemplo de respuesta real de LEX. LEX es IA y puede equivocarse: si no lo ves claro, ",
    captionLink: "cuéntanos tu caso",
    captionPost: ".",
  },
  ca: {
    title: "LEX en acció",
    question: "Necessito cotxe pilot amb 3,20 m d'ample?",
    line1: "Resol els teus dubtes de normativa al moment.",
    line2: "LEX consulta la base normativa pròpia i localitza el que aplica al teu cas, amb la font citada.",
    lexCta: "Pregunta a LEX",
    novaCta: "Pregunta a NOVA",
    novaLine: "Idees per usar la IA a la teva empresa de transport.",
    fuentes: "Fonts:",
    captionPre: "Exemple de resposta real de LEX. LEX és IA i es pot equivocar: si no ho veus clar, ",
    captionLink: "explica'ns el teu cas",
    captionPost: ".",
  },
  en: {
    title: "LEX in action",
    question: "Do I need a pilot car for a 3.20 m wide load?",
    line1: "Answers your regulation questions instantly.",
    line2: "LEX checks our own regulatory base and finds what applies to your case, with the source cited.",
    lexCta: "Ask LEX",
    novaCta: "Ask NOVA",
    novaLine: "Ideas for using AI in your transport business.",
    fuentes: "Sources:",
    captionPre: "Example of a real LEX answer. LEX is AI and can be wrong: if you're not sure, ",
    captionLink: "tell us about your case",
    captionPost: ".",
  },
  fr: {
    title: "LEX en action",
    question: "Ai-je besoin d'un véhicule pilote pour une largeur de 3,20 m ?",
    line1: "Répond à vos questions de réglementation sur-le-champ.",
    line2: "LEX consulte notre propre base réglementaire et trouve ce qui s'applique à votre cas, avec la source citée.",
    lexCta: "Demandez à LEX",
    novaCta: "Demandez à NOVA",
    novaLine: "Des idées pour utiliser l'IA dans votre entreprise de transport.",
    fuentes: "Sources :",
    captionPre: "Exemple de réponse réelle de LEX. LEX est une IA et peut se tromper : si ce n'est pas clair, ",
    captionLink: "racontez-nous votre cas",
    captionPost: ".",
  },
};

// Texto provisional (marcado para que no pase por real). Se sustituirá por una respuesta real de LEX.
const MUESTRA = "[TEXTO DE PRUEBA — se sustituirá por una respuesta real de LEX]";
const MUESTRA_FUENTE = "[FUENTE DE PRUEBA — se sustituirá por la fuente que cite LEX]";

type Fase = { escrito: string; enviado: boolean; pensando: boolean; respuesta: 0 | 1 | 2 };
const INICIAL: Fase = { escrito: "", enviado: false, pensando: false, respuesta: 0 };
const FINAL: Fase = { escrito: "", enviado: true, pensando: false, respuesta: 2 };

function ChatWindow({ fase, idioma, pregunta, escribiendo }: { fase: Fase; idioma: Idioma; pregunta: string; escribiendo: boolean }) {
  const config = AGENTE_CONFIG.LEX;
  const t = TEXTOS[idioma];
  const tx = texts[idioma];

  // Mismo formato que construye hoy el servidor: texto + "\n\n**Fuentes:**\n- documento".
  const respuesta =
    fase.respuesta === 2 ? `${MUESTRA}\n\n**${tx.fuentes}**\n- ${MUESTRA_FUENTE}` : MUESTRA;
  const mensajes: Mensaje[] = [];
  if (fase.enviado) mensajes.push({ role: "user", content: pregunta });
  if (fase.respuesta > 0) mensajes.push({ role: "assistant", content: respuesta, agente: "LEX" });

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden shadow-2xl"
      style={{ backgroundColor: "#0A0E1A", border: `1px solid ${config.colorBorder}` }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: `linear-gradient(135deg, ${config.colorBg} 0%, transparent 100%)` }}
      >
        <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0" style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}>
          <img src={config.avatar} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-tight">LEX</p>
          <p className="text-xs leading-tight truncate text-arctic">{t.taglineLex}</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 lex-demo">
        {mensajes.map((m, i) => (
          <div key={m.role} className={i === mensajes.length - 1 && escribiendo ? "lex-pop" : ""}>
            <Burbuja mensaje={m} config={config} labelCita={t.botonCita} onCita={() => {}} />
          </div>
        ))}
        {fase.pensando && (
          <div className="flex gap-3 justify-start lex-pop">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}>
              <img src={config.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="px-4 py-3 rounded-2xl flex items-center gap-2" style={{ backgroundColor: "rgba(255,255,255,0.06)", borderTopLeftRadius: 4 }}>
              <Loader2 size={14} className="animate-spin text-white/70" />
              <span className="text-white/70 text-sm">{t.pensando}</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <div className="flex-1 text-sm leading-relaxed py-1 min-h-[28px]">
            {fase.escrito ? (
              <span className="text-white">
                {fase.escrito}
                <span className="lex-caret" />
              </span>
            ) : (
              <span className="text-white/30">{t.placeholderLex}</span>
            )}
          </div>
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: fase.escrito ? config.color : "rgba(255,255,255,0.08)", opacity: fase.escrito ? 1 : 0.4 }}
          >
            <Send size={14} className="text-white" style={{ transform: "translateX(1px)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LexEnAccion() {
  const { locale } = useI18n();
  const { abrirAgente } = useAgent();
  const idioma: Idioma = locale === "ca" || locale === "en" || locale === "fr" ? locale : "es";
  const tx = texts[idioma];

  const reducir = useRef(typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches).current;
  const [fase, setFase] = useState<Fase>(reducir ? FINAL : INICIAL);
  const [escribiendo, setEscribiendo] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const zonaRef = useRef<HTMLDivElement>(null);
  const hecho = useRef(false);

  // La animación se ejecuta una sola vez, cuando la ventana entra en pantalla.
  useEffect(() => {
    if (reducir || hecho.current) {
      setFase(FINAL);
      return;
    }
    setFase(INICIAL);
    const el = zonaRef.current;
    if (!el) return;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)); };
    let iniciada = false;

    const escribir = (i: number) => {
      setFase({ ...INICIAL, escrito: tx.question.slice(0, i) });
      if (i < tx.question.length) return later(() => escribir(i + 1), 42 + Math.random() * 40);
      later(() => {
        setEscribiendo(true);
        setFase({ ...INICIAL, enviado: true });
        later(() => {
          setFase({ ...INICIAL, enviado: true, pensando: true });
          later(() => {
            setFase({ ...INICIAL, enviado: true, respuesta: 1 });
            later(() => {
              setFase(FINAL);
              hecho.current = true;
              setEscribiendo(false);
            }, 900);
          }, 1500);
        }, 500);
      }, 700);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || iniciada) return;
        iniciada = true;
        io.disconnect();
        later(() => escribir(1), 400);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [tx.question, reducir]);

  return (
    <section id="lex-en-accion" className="section-y bg-obsidian-light border-b border-white/10" data-testid="section-lex-en-accion">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="t-h2 text-pure text-center head-gap">{tx.title}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-[7fr_4fr] gap-4 lg:gap-12 items-start">
          <div>
            {/* La zona reserva la altura del estado final (ventana invisible) y la ventana viva se dibuja encima:
                así la ventana no tiene hueco vacío mientras se escribe y la página no salta. */}
            <div ref={zonaRef} className="relative">
              <div className="invisible" aria-hidden="true">
                <ChatWindow fase={FINAL} idioma={idioma} pregunta={tx.question} escribiendo={false} />
              </div>
              <div className="absolute top-0 left-0 right-0" aria-hidden="true">
                <ChatWindow fase={fase} idioma={idioma} pregunta={tx.question} escribiendo={escribiendo} />
              </div>
              <p className="sr-only">{tx.question}</p>
            </div>
            <p className="mt-3 t-small text-white/60">
              {tx.captionPre}
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="text-arctic underline underline-offset-2 hover:text-pure transition-colors"
                data-testid="link-lex-cuentanos"
              >
                {tx.captionLink}
              </button>
              {tx.captionPost}
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:self-center mt-6 lg:mt-0">
            <p className="t-lead text-pure">{tx.line1}</p>
            <p className="t-body text-white/70">{tx.line2}</p>
            <div>
              <button onClick={() => abrirAgente("LEX")} className="btn btn-primary" data-testid="button-lex-accion">
                {tx.lexCta}
              </button>
            </div>
          </div>
        </div>

        {/* NOVA: segunda herramienta, más pequeña */}
        <div className="mt-14 md:mt-[72px] pt-7 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
              style={{ backgroundColor: AGENTE_CONFIG.NOVA.colorBg, border: `1px solid ${AGENTE_CONFIG.NOVA.colorBorder}` }}
            >
              <img src={AGENTE_CONFIG.NOVA.avatar} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="t-h3 text-pure">NOVA</h3>
              <p className="t-small text-white/70 mt-0.5">{tx.novaLine}</p>
            </div>
          </div>
          <button onClick={() => abrirAgente("NOVA")} className="btn btn-secondary btn-small" data-testid="button-nova-accion">
            {tx.novaCta}
          </button>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}
