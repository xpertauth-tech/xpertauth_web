import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, ExternalLink, Calendar } from "lucide-react";
import ContactModal from "./ContactModal";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/i18n/context";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Agente = "LEX" | "NOVA";

// Avatares ilustrados (los mismos que usa la sección Equipo)
const AVATAR_BASE = "https://supabase.xpertauth.com/storage/v1/object/public/web-images/equipo";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
  agente?: Agente;
}

interface AgentChatProps {
  abierto: boolean;
  agente: Agente;
  onClose: () => void;
  onSesionRequerida: () => void;
}

type Idioma = "es" | "ca" | "en" | "fr";

// ─── Config por agente ───────────────────────────────────────────────────────

const AGENTE_CONFIG: Record<Agente, {
  color: string;
  colorBg: string;
  colorBorder: string;
  avatar: string;
}> = {
  LEX: {
    color: "#1B4FD8",
    colorBg: "rgba(27,79,216,0.10)",
    colorBorder: "rgba(27,79,216,0.25)",
    avatar: `${AVATAR_BASE}/lex_avatar_v1.webp`,
  },
  NOVA: {
    color: "#4D9FEC",
    colorBg: "rgba(77,159,236,0.10)",
    colorBorder: "rgba(77,159,236,0.25)",
    avatar: `${AVATAR_BASE}/nova_avatar_v1.webp`,
  },
};

// ─── Textos por idioma ───────────────────────────────────────────────────────

const TEXTOS: Record<Idioma, {
  taglineLex: string;
  taglineNova: string;
  bienvenidaLex: string;
  bienvenidaNova: string;
  placeholderLex: string;
  placeholderNova: string;
  disclaimer: (agente: Agente) => string;
  pensando: string;
  errorConexion: string;
  limitePre: string;
  limiteNegrita: string;
  limitePost: string;
  limiteRestaura: string;
  cerrar: string;
  enviar: string;
}> = {
  es: {
    taglineLex: "Normativa de transporte especial",
    taglineNova: "IA para pymes de transporte",
    bienvenidaLex:
      "Hola, soy LEX. Estoy especializado en normativa de transporte especial: permisos de circulación, autorizaciones DGT y SCT Catalunya, restricciones, vehículos de acompañamiento y más.\n\n¿Cuál es tu consulta?",
    bienvenidaNova:
      "Hola, soy NOVA. Te ayudo a ver qué puede hacer la IA en una pyme de transporte: caducidad de permisos, expedientes, avisos obligatorios, seguimiento de flota. Cómo empezar sin invertir y sin humo.\n\n¿En qué puedo ayudarte?",
    placeholderLex: "Escribe tu consulta normativa…",
    placeholderNova: "Pregúntame sobre IA para tu empresa…",
    disclaimer: (a) => `${a} es IA y puede equivocarse. Verifica siempre la información antes de actuar.`,
    pensando: "Pensando…",
    errorConexion: "Lo siento, ha habido un problema al conectar. Por favor, inténtalo de nuevo en unos segundos.",
    limitePre: "Has usado tus ",
    limiteNegrita: "30 consultas de este mes",
    limitePost: ".",
    limiteRestaura: "Tus consultas se restauran el 1 del mes siguiente.",
    cerrar: "Cerrar chat",
    enviar: "Enviar",
  },
  ca: {
    taglineLex: "Normativa de transport especial",
    taglineNova: "IA per a pimes de transport",
    bienvenidaLex:
      "Hola, sóc LEX. Estic especialitzat en normativa de transport especial: permisos de circulació, autoritzacions DGT i SCT Catalunya, restriccions, vehicles d'acompanyament i més.\n\nQuina és la teva consulta?",
    bienvenidaNova:
      "Hola, sóc NOVA. T'ajudo a veure què pot fer la IA en una pime de transport: caducitat de permisos, expedients, avisos obligatoris, seguiment de flota. Com començar sense invertir i sense fum.\n\nEn què et puc ajudar?",
    placeholderLex: "Escriu la teva consulta normativa…",
    placeholderNova: "Pregunta'm sobre IA per a la teva empresa…",
    disclaimer: (a) => `${a} és IA i es pot equivocar. Verifica sempre la informació abans d'actuar.`,
    pensando: "Pensant…",
    errorConexion: "Ho sento, hi ha hagut un problema en connectar. Torna-ho a provar d'aquí a uns segons.",
    limitePre: "Has fet servir les teves ",
    limiteNegrita: "30 consultes d'aquest mes",
    limitePost: ".",
    limiteRestaura: "Les teves consultes es restauren l'1 del mes següent.",
    cerrar: "Tanca el xat",
    enviar: "Envia",
  },
  en: {
    taglineLex: "Special transport regulations",
    taglineNova: "AI for transport SMEs",
    bienvenidaLex:
      "Hi, I'm LEX. I specialise in special transport regulations: circulation permits, DGT and SCT Catalunya authorisations, restrictions, escort vehicles and more.\n\nWhat's your question?",
    bienvenidaNova:
      "Hi, I'm NOVA. I help you see what AI can do in a transport SME: permit expiry, case files, mandatory alerts, fleet tracking. How to start without investing and without hype.\n\nHow can I help you?",
    placeholderLex: "Write your regulatory question…",
    placeholderNova: "Ask me about AI for your business…",
    disclaimer: (a) => `${a} is AI and can make mistakes. Always verify the information before acting on it.`,
    pensando: "Thinking…",
    errorConexion: "Sorry, there was a problem connecting. Please try again in a few seconds.",
    limitePre: "You have used your ",
    limiteNegrita: "30 queries for this month",
    limitePost: ".",
    limiteRestaura: "Your queries reset on the 1st of next month.",
    cerrar: "Close chat",
    enviar: "Send",
  },
  fr: {
    taglineLex: "Réglementation du transport spécial",
    taglineNova: "IA pour PME de transport",
    bienvenidaLex:
      "Bonjour, je suis LEX. Je suis spécialisé dans la réglementation du transport spécial : permis de circulation, autorisations DGT et SCT Catalunya, restrictions, véhicules d'accompagnement et plus encore.\n\nQuelle est votre question ?",
    bienvenidaNova:
      "Bonjour, je suis NOVA. Je vous aide à voir ce que l'IA peut faire dans une PME de transport : expiration des permis, dossiers, alertes obligatoires, suivi de flotte. Comment commencer sans investir et sans esbroufe.\n\nComment puis-je vous aider ?",
    placeholderLex: "Écrivez votre question réglementaire…",
    placeholderNova: "Posez-moi vos questions sur l'IA pour votre entreprise…",
    disclaimer: (a) => `${a} est une IA et peut se tromper. Vérifiez toujours les informations avant d'agir.`,
    pensando: "Réflexion…",
    errorConexion: "Désolé, un problème de connexion est survenu. Veuillez réessayer dans quelques secondes.",
    limitePre: "Vous avez utilisé vos ",
    limiteNegrita: "30 requêtes de ce mois",
    limitePost: ".",
    limiteRestaura: "Vos requêtes sont réinitialisées le 1er du mois suivant.",
    cerrar: "Fermer le chat",
    enviar: "Envoyer",
  },
};

// ─── Parser de botones contextuales ─────────────────────────────────────────

interface BotonContextual {
  tipo: "SCT" | "CITA";
  label: string;
  url?: string;
}

function parsearBotones(texto: string): { textoLimpio: string; botones: BotonContextual[] } {
  const botones: BotonContextual[] = [];
  let textoLimpio = texto;

  // [BOTON_SCT:Label:URL]
  textoLimpio = textoLimpio.replace(
    /\[BOTON_SCT:([^:]+):([^\]]+)\]/g,
    (_, label, url) => {
      botones.push({ tipo: "SCT", label: label.trim(), url: url.trim() });
      return "";
    }
  );

  // [BOTON_CITA:Label]
  textoLimpio = textoLimpio.replace(
    /\[BOTON_CITA:([^\]]+)\]/g,
    (_, label) => {
      botones.push({ tipo: "CITA", label: label.trim() });
      return "";
    }
  );

  // [BOTON_SOCIO:Label] — esta web no ofrece alta de socios; se elimina el tag sin renderizar botón.
  textoLimpio = textoLimpio.replace(/\[BOTON_SOCIO:[^\]]+\]/g, "");

  // Links markdown estándar [Label](URL) → botón SCT
  textoLimpio = textoLimpio.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    (_, label, url) => {
      botones.push({ tipo: "SCT", label: label.trim(), url: url.trim() });
      return "";
    }
  );

  // Links mailto [Label](mailto:...) → botón CITA
  textoLimpio = textoLimpio.replace(
    /\[([^\]]+)\]\((mailto:[^)]+)\)/g,
    (_, label) => {
      botones.push({ tipo: "CITA", label: label.trim() });
      return "";
    }
  );

  return { textoLimpio: textoLimpio.trim(), botones };
}

// ─── Subcomponente: burbuja de mensaje ───────────────────────────────────────

function renderMarkdown(texto: string): React.ReactNode[] {
  const lineas = texto.split("\n");
  const nodos: React.ReactNode[] = [];
  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    if (linea.startsWith("## ")) {
      nodos.push(<p key={i} className="font-bold text-white mt-3 mb-1" style={{ fontSize: "0.82rem" }}>{linea.replace(/^## /, "")}</p>);
    } else if (linea.startsWith("### ")) {
      nodos.push(<p key={i} className="font-semibold mt-2 mb-0.5" style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.75)" }}>{linea.replace(/^### /, "")}</p>);
    } else if (/^[-*] /.test(linea)) {
      nodos.push(<div key={i} className="flex gap-2 my-0.5"><span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-white/40" /><span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{parsearInline(linea.replace(/^[-*] /, ""))}</span></div>);
    } else if (/^\d+\. /.test(linea)) {
      const num = linea.match(/^(\d+)\. /)?.[1];
      nodos.push(<div key={i} className="flex gap-2 my-0.5"><span className="flex-shrink-0 text-xs font-medium" style={{ color: "rgba(255,255,255,0.40)", minWidth: "1rem" }}>{num}.</span><span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{parsearInline(linea.replace(/^\d+\. /, ""))}</span></div>);
    } else if (linea.trim() === "") {
      nodos.push(<div key={i} className="h-1.5" />);
    } else {
      nodos.push(<p key={i} className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.88)" }}>{parsearInline(linea)}</p>);
    }
    i++;
  }
  return nodos;
}

function parsearInline(texto: string): React.ReactNode {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return partes.map((parte, i) => {
    if (parte.startsWith("**") && parte.endsWith("**")) {
      return <strong key={i} className="font-semibold text-white">{parte.slice(2, -2)}</strong>;
    }
    if (parte.startsWith("*") && parte.endsWith("*")) {
      return <em key={i} className="italic">{parte.slice(1, -1)}</em>;
    }
    return parte;
  });
}

function Burbuja({
  mensaje,
  config,
  onCita,
}: {
  mensaje: Mensaje;
  config: typeof AGENTE_CONFIG[Agente];
  onCita: () => void;
}) {
  const esAsistente = mensaje.role === "assistant";
  const { textoLimpio, botones } = parsearBotones(mensaje.content);

  return (
    <div className={`flex gap-3 ${esAsistente ? "justify-start" : "justify-end"}`}>
      {esAsistente && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden mt-0.5"
          style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
        >
          <img src={config.avatar} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className={`max-w-[82%] space-y-2 ${esAsistente ? "" : "items-end flex flex-col"}`}>
        {textoLimpio && (
          <div
            className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
            style={
              esAsistente
                ? {
                    backgroundColor: "rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.90)",
                    borderTopLeftRadius: 4,
                  }
                : {
                    backgroundColor: config.color,
                    color: "#ffffff",
                    borderTopRightRadius: 4,
                  }
            }
          >
            {esAsistente ? renderMarkdown(textoLimpio) : textoLimpio}
          </div>
        )}

        {botones.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {botones.map((btn, i) => {
              if (btn.tipo === "SCT" && btn.url) {
                return (
                  <a
                    key={i}
                    href={btn.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: "rgba(27,79,216,0.15)",
                      border: "1px solid rgba(27,79,216,0.35)",
                      color: "#4D9FEC",
                    }}
                  >
                    <ExternalLink size={12} />
                    {btn.label}
                  </a>
                );
              }

              if (btn.tipo === "CITA") {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={onCita}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: "rgba(232,98,10,0.15)",
                      border: "1px solid rgba(232,98,10,0.35)",
                      color: "#E8620A",
                    }}
                  >
                    <Calendar size={12} />
                    {btn.label}
                  </button>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function AgentChat({
  abierto,
  agente,
  onClose,
  onSesionRequerida,
}: AgentChatProps) {
  const { locale } = useI18n();
  const idioma: Idioma = locale === "ca" || locale === "en" || locale === "fr" ? locale : "es";
  const t = TEXTOS[idioma];
  const config = AGENTE_CONFIG[agente];
  const bienvenida = agente === "LEX" ? t.bienvenidaLex : t.bienvenidaNova;
  const tagline = agente === "LEX" ? t.taglineLex : t.taglineNova;
  const placeholder = agente === "LEX" ? t.placeholderLex : t.placeholderNova;

  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { role: "assistant", content: bienvenida, agente },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (abierto) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [mensajes, abierto]);

  // Cambio de agente o de idioma: conversación nueva con la bienvenida correspondiente.
  useEffect(() => {
    setMensajes([{ role: "assistant", content: bienvenida, agente }]);
    setInput("");
  }, [agente, idioma]);

  async function enviar() {
    const texto = input.trim();
    if (!texto || cargando || limiteAlcanzado) return;

    // El servidor valida la sesión y cuenta las consultas: se envía el token de Google.
    const { data: sesion } = await supabase.auth.getSession();
    const token = sesion.session?.access_token;
    if (!token) {
      onSesionRequerida();
      return;
    }

    const nuevosMensajes: Mensaje[] = [...mensajes, { role: "user", content: texto }];

    setMensajes(nuevosMensajes);
    setInput("");
    setCargando(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: nuevosMensajes.map((m) => ({ role: m.role, content: m.content })),
          agente,
        }),
      });

      if (res.status === 401) {
        setMensajes(mensajes);
        onSesionRequerida();
        return;
      }
      if (res.status === 429) {
        // Límite mensual alcanzado (lo decide el servidor).
        setMensajes(mensajes);
        setLimiteAlcanzado(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.respuesta,
          agente: data.agente === "LEX" || data.agente === "NOVA" ? data.agente : agente,
        },
      ]);
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        { role: "assistant", content: t.errorConexion, agente },
      ]);
    } finally {
      setCargando(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  return (
    <>
      {abierto && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: "rgba(7,10,18,0.60)" }}
          onClick={onClose}
        />
      )}

      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{
          width: "min(420px, 100vw)",
          backgroundColor: "#0A0E1A",
          borderLeft: `1px solid ${config.colorBorder}`,
          transform: abierto ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* ── HEADER ── */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{
            borderBottom: `1px solid rgba(255,255,255,0.07)`,
            background: `linear-gradient(135deg, ${config.colorBg} 0%, transparent 100%)`,
          }}
        >
          <div
            className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0"
            style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
          >
            <img src={config.avatar} alt={agente} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">{agente}</p>
            <p className="text-xs leading-tight truncate" style={{ color: config.color }}>
              {tagline}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors ml-1"
            aria-label={t.cerrar}
          >
            <X size={18} />
          </button>
        </div>

        {/* ── MENSAJES ── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {mensajes.map((msg, i) => (
            <Burbuja key={i} mensaje={msg} config={config} onCita={() => setContactOpen(true)} />
          ))}

          {cargando && (
            <div className="flex gap-3 justify-start">
              <div
                className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
              >
                <img src={config.avatar} alt="" className="w-full h-full object-cover" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-2"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", borderTopLeftRadius: 4 }}
              >
                <Loader2 size={14} className="animate-spin text-white/50" />
                <span className="text-white/40 text-sm">{t.pensando}</span>
              </div>
            </div>
          )}

          {limiteAlcanzado && (
            <div
              className="mx-2 px-4 py-3 rounded-xl text-center text-sm"
              style={{
                backgroundColor: "rgba(27,79,216,0.12)",
                border: "1px solid rgba(27,79,216,0.30)",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              {t.limitePre}<strong style={{ color: "#fff" }}>{t.limiteNegrita}</strong>{t.limitePost}
              <br />
              <span style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.75rem" }}>
                {t.limiteRestaura}
              </span>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── INPUT ── */}
        <div
          className="flex-shrink-0 px-4 pb-4 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={cargando || limiteAlcanzado}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none resize-none leading-relaxed py-1"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || cargando || limiteAlcanzado}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all mb-0.5"
              style={{
                backgroundColor: input.trim() && !cargando ? config.color : "rgba(255,255,255,0.08)",
                opacity: input.trim() && !cargando ? 1 : 0.4,
              }}
              aria-label={t.enviar}
            >
              <Send size={14} className="text-white" style={{ transform: "translateX(1px)" }} />
            </button>
          </div>

          {/* Aviso IA (igual en los dos agentes) */}
          <p className="text-center text-white/50 text-xs mt-2 leading-snug px-1">
            {t.disclaimer(agente)}
          </p>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
