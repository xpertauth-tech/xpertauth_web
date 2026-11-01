import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { useAgent } from "@/App";
import ContactModal from "./ContactModal";
import { AGENTE_CONFIG, Burbuja, TEXTOS, type Idioma, type Mensaje } from "./AgentChat";

// Sección "LEX en acción": ventana de chat que escribe sola, una vez, una pregunta real y muestra
// una respuesta real de LEX (pregunta y respuesta tal cual salieron de LEX en cada idioma).

const texts: Record<Idioma, {
  title: string;
  question: string;
  answer: string;
  sources: string[];
  line1: string;
  line2: string;
  lexCta: string;
  novaCta: string;
  novaLine: string;
  fuentes: string;
  caption: string;
  captionBtn: string;
  verMas: string;
  verMenos: string;
}> = {
  es: {
    title: "LEX en acción",
    question: "Llevo una excavadora sobre góndola y me paso de ancho. ¿Qué papel necesito y quién me lo da?",
    answer: "Si te pasas de ancho con la excavadora sobre góndola, necesitas una **autorización de transporte especial**.\n\n**Quién te la da depende de dónde circules:**\n\n- **En Catalunya:** la pide el SCT (Servei Català de Trànsit)\n- **En el resto de España:** la pide la DGT (Dirección General de Tráfico)\n\n**Qué tipo de autorización necesitas:**\n\n- **Hasta 3,50 m de ancho:** autorización genérica (sin itinerario fijo)\n- **De 3,51 m hasta 4,99 m de ancho:** autorización específica (con itinerario concreto)\n- **5 m o más de ancho:** autorización excepcional (con itinerario concreto)\n\nSi solo te pasas un poco del ancho (por ejemplo, 3,30 m), con la genérica puedes circular. Si llegas a 3,60 m, ya necesitas la específica con ruta definida.\n\n¿Cuánto mide de ancho tu excavadora cargada?",
    sources: ["PARALELO 07 Tipos de autorizacion y vehiculos piloto (José Luis) (resumen IA)"],
    line1: "Resuelve tus dudas de normativa al momento.",
    line2: "LEX consulta la base normativa propia y localiza lo que aplica a tu caso, con la fuente citada.",
    lexCta: "Pregunta a LEX",
    novaCta: "Pregunta a NOVA",
    novaLine: "Ideas para usar la IA en tu empresa de transporte.",
    fuentes: "Fuentes:",
    caption: "Ejemplo de respuesta real de LEX. LEX es IA y puede equivocarse. Si no lo ves claro:",
    captionBtn: "Cuéntanos tu caso",
    verMas: "Ver respuesta completa",
    verMenos: "Ver menos",
  },
  ca: {
    title: "LEX en acció",
    question: "Porto una excavadora sobre una góndola i em passo d'amplada. Quin paper necessito i qui me'l dona?",
    answer: "Si et passes d'amplada amb l'excavadora sobre la góndola, necessites una **autorització de transport especial**.\n\nQui te la dona depèn de per on circularàs:\n\n- **SCT (Servei Català de Trànsit)**: si el teu itinerari és només per carreteres de Catalunya (xarxa viària interurbana catalana).\n\n- **DGT (Direcció General de Trànsit)**: si surts de Catalunya o circules per carreteres estatals.\n\nPer demanar-la necessitaràs les dades del vehicle, del remolc, de la càrrega i l'itinerari concret (origen i destí).\n\nSi necessites orientació sobre el teu cas concret o ajuda amb el tràmit, pots contactar amb José Luis.\n\n[BOTON_SCT:Tràmits SCT:https://transit.gencat.cat/ca/gestions/autoritzacions-especials-exempcions/autoritzacions-especials-te-ve/index.html]\n[BOTON_SCT:Autorizaciones DGT:https://sede.dgt.gob.es/es/movilidad/autorizaciones-especiales/]",
    sources: ["SCT Autoritzacions Especials Procediments 2025-2026"],
    line1: "Resol els teus dubtes de normativa al moment.",
    line2: "LEX consulta la base normativa pròpia i localitza el que aplica al teu cas, amb la font citada.",
    lexCta: "Pregunta a LEX",
    novaCta: "Pregunta a NOVA",
    novaLine: "Idees per usar la IA a la teva empresa de transport.",
    fuentes: "Fonts:",
    caption: "Exemple de resposta real de LEX. LEX és IA i es pot equivocar. Si no ho veus clar:",
    captionBtn: "Explica'ns el teu cas",
    verMas: "Veure la resposta completa",
    verMenos: "Veure'n menys",
  },
  en: {
    title: "LEX in action",
    question: "I'm carrying an excavator on a low-loader and I'm over the width limit. What permit do I need and who issues it?",
    answer: "If you're over 2.55 metres wide, you need a special transport authorisation.\n\n**Who issues it depends on your route:**\n- **If you're travelling only in Catalonia:** the SCT (Servei Català de Trànsit) issues it.\n- **If you're travelling outside Catalonia or crossing into other regions:** the DGT (Dirección General de Tráfico) issues it.\n\n**What type of authorisation:**\n- **Up to 3.50 m wide:** generic authorisation (no fixed route).\n- **Between 3.50 m and 5 m wide:** specific authorisation (with a concrete route).\n- **5 m or more wide:** exceptional authorisation (with a concrete route).\n\nIf you're between 3 and 5 metres wide, you'll also need a front escort vehicle. If you reach 5 metres, you'll need two escort vehicles.\n\nTo apply or check routes:\n\n[BOTON_SCT:SCT Route Viewer:https://transit.gencat.cat/ca/gestions/autoritzacions-especials-exempcions/visor-itineraris/index.html]\n[BOTON_SCT:SCT Procedures:https://transit.gencat.cat/ca/gestions/autoritzacions-especials-exempcions/autoritzacions-especials-te-ve/index.html]\n[BOTON_SCT:DGT Authorisations:https://sede.dgt.gob.es/es/movilidad/autorizaciones-especiales/]",
    sources: ["PARALELO 01 Dimensiones Masas Cuando Necesito Permiso (AI summary)", "PARALELO 06 Referencias Normativas Exactas LEX (AI summary)", "PARALELO 07 Tipos de autorizacion y vehiculos piloto (José Luis) (AI summary)"],
    line1: "Answers your regulation questions instantly.",
    line2: "LEX checks our own regulatory base and finds what applies to your case, with the source cited.",
    lexCta: "Ask LEX",
    novaCta: "Ask NOVA",
    novaLine: "Ideas for using AI in your transport business.",
    fuentes: "Sources:",
    caption: "Example of a real LEX answer. LEX is AI and can make mistakes. If it isn't clear to you:",
    captionBtn: "Tell us about your case",
    verMas: "See full answer",
    verMenos: "See less",
  },
  fr: {
    title: "LEX en action",
    question: "Je transporte une pelleteuse sur un porte-engins et je dépasse la largeur. De quel document ai-je besoin et qui le délivre ?",
    answer: "Si vous dépassez 2,55 mètres de largeur avec votre ensemble (porte-engins + pelleteuse), vous avez besoin d'une **autorisation de transport spécial**.\n\n**Qui la délivre :**\n- **SCT (Servei Català de Trànsit)** si vous circulez en Catalogne\n- **DGT (Dirección General de Tráfico)** si vous circulez dans le reste de l'Espagne\n\n**Type d'autorisation selon votre largeur :**\n- Jusqu'à 3,50 m de large : autorisation **générique** (sans itinéraire fixe)\n- Entre 3,50 m et 5 m de large : autorisation **spécifique** (avec itinéraire concret)\n- 5 m ou plus de large : autorisation **exceptionnelle** (avec itinéraire concret)\n\n**Important :** Si vous dépassez 3 mètres de large, vous devrez également circuler avec un **véhicule pilote** à l'avant.\n\nVous devez avoir ce document dans la cabine pendant le transport, accompagné du permis de circulation, de l'ITV en vigueur, de l'assurance obligatoire et du permis de conduire.\n\nQuelle est la largeur totale de votre ensemble ?\n\n[BOTON_SCT:Tràmits SCT:https://transit.gencat.cat/ca/gestions/autoritzacions-especials-exempcions/autoritzacions-especials-te-ve/index.html]\n[BOTON_SCT:Autorizaciones DGT:https://sede.dgt.gob.es/es/movilidad/autorizaciones-especiales/]",
    sources: ["PARALELO 07 Tipos de autorizacion y vehiculos piloto (José Luis) (résumé IA)", "PARALELO 02 Permisos DGT SCT Quien Pide Que (résumé IA)", "PARALELO 06 Referencias Normativas Exactas LEX (résumé IA)"],
    line1: "Répond à vos questions de réglementation sur-le-champ.",
    line2: "LEX consulte notre propre base réglementaire et trouve ce qui s'applique à votre cas, avec la source citée.",
    lexCta: "Demandez à LEX",
    novaCta: "Demandez à NOVA",
    novaLine: "Des idées pour utiliser l'IA dans votre entreprise de transport.",
    fuentes: "Sources :",
    caption: "Exemple de réponse réelle de LEX. LEX est une IA et peut se tromper. Si ce n'est pas clair pour vous :",
    captionBtn: "Racontez-nous votre cas",
    verMas: "Voir la réponse complète",
    verMenos: "Voir moins",
  },
};

// Altura fija (px) de la zona de mensajes de la ventana de muestra, igual en los 4 idiomas: la respuesta se corta
// por abajo con un degradado y el botón «Ver respuesta completa» la despliega.
const ALTO_MUESTRA = 330;

type Fase = { escrito: string; enviado: boolean; pensando: boolean; respuesta: 0 | 1 | 2 };
const INICIAL: Fase = { escrito: "", enviado: false, pensando: false, respuesta: 0 };
const FINAL: Fase = { escrito: "", enviado: true, pensando: false, respuesta: 2 };

function ChatWindow({ fase, idioma, pregunta, escribiendo, expandido }: { fase: Fase; idioma: Idioma; pregunta: string; escribiendo: boolean; expandido: boolean }) {
  const config = AGENTE_CONFIG.LEX;
  const t = TEXTOS[idioma];
  const tx = texts[idioma];

  // Mismo formato que construye hoy el servidor: texto + "\n\n**Fuentes:**\n- documento".
  const respuesta =
    fase.respuesta === 2 ? `${tx.answer}\n\n**${tx.fuentes}**\n${tx.sources.map((f) => `- ${f}`).join("\n")}` : tx.answer;
  const mensajes: Mensaje[] = [];
  if (fase.enviado) mensajes.push({ role: "user", content: pregunta });
  if (fase.respuesta > 0) mensajes.push({ role: "assistant", content: respuesta, agente: "LEX" });

  return (
    <div
      className="flex flex-col h-full rounded-2xl overflow-hidden shadow-2xl"
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

      <div className="relative flex-1">
        <div
          className="px-4 py-5 space-y-4 lex-demo"
          style={expandido ? undefined : { height: ALTO_MUESTRA, overflow: "hidden" }}
        >
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
        {!expandido && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
            style={{ background: "linear-gradient(to bottom, rgba(10,14,26,0), #0A0E1A)" }}
          />
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
  const [expandido, setExpandido] = useState(false);
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
                <ChatWindow fase={FINAL} idioma={idioma} pregunta={tx.question} escribiendo={false} expandido={expandido} />
              </div>
              <div className="absolute inset-0" aria-hidden="true">
                <ChatWindow fase={fase} idioma={idioma} pregunta={tx.question} escribiendo={escribiendo} expandido={expandido} />
              </div>
              <p className="sr-only">{tx.question}</p>
            </div>
            <button
              type="button"
              onClick={() => setExpandido((v) => !v)}
              aria-expanded={expandido}
              className="btn btn-secondary btn-small mt-3"
              style={{ borderColor: "rgba(255,255,255,0.28)", color: "rgba(255,255,255,0.8)" }}
              data-testid="button-lex-respuesta-completa"
            >
              {expandido ? tx.verMenos : tx.verMas}
            </button>
            <p className="mt-4 t-small text-white/60">{tx.caption}</p>
            <button
              type="button"
              onClick={() => setContactOpen(true)}
              className="btn btn-secondary btn-small mt-3"
              data-testid="link-lex-cuentanos"
            >
              {tx.captionBtn}
            </button>
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
