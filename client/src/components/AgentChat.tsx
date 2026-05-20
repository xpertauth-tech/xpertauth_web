import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, ExternalLink, Calendar, Users } from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Agente = "LEX" | "NOVA" | "ALMA";

interface Mensaje {
  role: "user" | "assistant";
  content: string;
  agente?: Agente;
}

interface AgentChatProps {
  abierto: boolean;
  agente: Agente;
  nombre: string;
  email: string;
  esAutenticado: boolean;
  onClose: () => void;
  onLimiteAlcanzado: () => void; // dispara pantalla de límite en AgentModal
}

// ─── Config por agente ───────────────────────────────────────────────────────

const AGENTE_CONFIG: Record<Agente, {
  color: string;
  colorBg: string;
  colorBorder: string;
  emoji: string;
  tagline: string;
  mensajeBienvenida: string;
  placeholder: string;
}> = {
  LEX: {
    color: "#1B4FD8",
    colorBg: "rgba(27,79,216,0.10)",
    colorBorder: "rgba(27,79,216,0.25)",
    emoji: "⚖️",
    tagline: "Normativa de transporte especial",
    mensajeBienvenida:
      "Hola, soy LEX. Estoy especializado en normativa de transporte especial — permisos de circulación, autorizaciones DGT y SCT Catalunya, restricciones, vehículos de acompañamiento y más.\n\n¿Cuál es tu consulta?",
    placeholder: "Escribe tu consulta normativa…",
  },
  NOVA: {
    color: "#4D9FEC",
    colorBg: "rgba(77,159,236,0.10)",
    colorBorder: "rgba(77,159,236,0.25)",
    emoji: "🤖",
    tagline: "IA para pequeñas y medianas empresas",
    mensajeBienvenida:
      "Hola, soy NOVA. Te ayudo a entender qué puede hacer la IA por tu negocio: qué herramientas existen, cómo empezar sin invertir y qué procesos se pueden automatizar según tu sector.\n\n¿En qué puedo ayudarte?",
    placeholder: "Pregúntame sobre IA para tu empresa…",
  },
  ALMA: {
    color: "#E8620A",
    colorBg: "rgba(232,98,10,0.10)",
    colorBorder: "rgba(232,98,10,0.25)",
    emoji: "🌱",
    tagline: "Formación digital para personas mayores",
    mensajeBienvenida:
      "Hola, soy ALMA. Estoy aquí para ayudarte con el móvil, WhatsApp, la banca online o cualquier duda sobre tecnología, con calma y sin prisa.\n\nTambién puedo informarte sobre los cursos presenciales gratuitos de XpertAuth en Figueres.\n\n¿Qué necesitas?",
    placeholder: "Escríbeme tu duda…",
  },
};

// ─── Helpers localStorage (contador de consultas) ─────────────────────────────

function getConsultasKey(email: string) {
  const d = new Date();
  return `xpertauth_consultas_${email}_${d.getFullYear()}_${d.getMonth()}`;
}

function getConsultas(email: string): number {
  try {
    return parseInt(localStorage.getItem(getConsultasKey(email)) || "0", 10);
  } catch {
    return 0;
  }
}

function incrementarConsultas(email: string) {
  try {
    const key = getConsultasKey(email);
    const actual = parseInt(localStorage.getItem(key) || "0", 10);
    localStorage.setItem(key, String(actual + 1));
  } catch {}
}

const LIMITE = 3;
const LIMITE_MENSAJES_SESION = 6;

// ─── Parser de botones contextuales ─────────────────────────────────────────

interface BotonContextual {
  tipo: "SCT" | "CITA" | "SOCIO";
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

  // [BOTON_SOCIO:Label]
  textoLimpio = textoLimpio.replace(
    /\[BOTON_SOCIO:([^\]]+)\]/g,
    (_, label) => {
      botones.push({ tipo: "SOCIO", label: label.trim() });
      return "";
    }
  );

  return { textoLimpio: textoLimpio.trim(), botones };
}

// ─── Subcomponente: burbuja de mensaje ───────────────────────────────────────

function Burbuja({
  mensaje,
  config,
}: {
  mensaje: Mensaje;
  config: typeof AGENTE_CONFIG[Agente];
}) {
  const esAsistente = mensaje.role === "assistant";
  const { textoLimpio, botones } = parsearBotones(mensaje.content);

  return (
    <div className={`flex gap-3 ${esAsistente ? "justify-start" : "justify-end"}`}>
      {/* Avatar agente */}
      {esAsistente && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base mt-0.5"
          style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
        >
          {config.emoji}
        </div>
      )}

      <div className={`max-w-[82%] space-y-2 ${esAsistente ? "" : "items-end flex flex-col"}`}>
        {/* Burbuja texto */}
        {textoLimpio && (
          <div
            className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
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
            {textoLimpio}
          </div>
        )}

        {/* Botones contextuales */}
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
                    <ExternalLink size={11} />
                    {btn.label}
                  </a>
                );
              }
              if (btn.tipo === "CITA") {
                return (
                  <a
                    key={i}
                    href="/es/socios#contacto"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: "rgba(232,98,10,0.15)",
                      border: "1px solid rgba(232,98,10,0.35)",
                      color: "#E8620A",
                    }}
                  >
                    <Calendar size={11} />
                    {btn.label}
                  </a>
                );
              }
              if (btn.tipo === "SOCIO") {
                return (
                  <a
                    key={i}
                    href="/es/socios"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: "rgba(27,79,216,0.15)",
                      border: "1px solid rgba(27,79,216,0.35)",
                      color: "#1B4FD8",
                    }}
                  >
                    <Users size={11} />
                    {btn.label}
                  </a>
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
  nombre,
  email,
  esAutenticado,
  onClose,
  onLimiteAlcanzado,
}: AgentChatProps) {
  const config = AGENTE_CONFIG[agente];

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajesSesion, setMensajesSesion] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Inicializar con mensaje de bienvenida al abrir
  useEffect(() => {
    if (abierto) {
      setMensajes([
        {
          role: "assistant",
          content: config.mensajeBienvenida,
          agente,
        },
      ]);
      setMensajesSesion(0);
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [abierto, agente]);

  // Scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  async function enviar() {
    const texto = input.trim();
    if (!texto || cargando) return;

    // Comprobar límite visitante
    if (!esAutenticado) {
      const consultas = getConsultas(email);
      if (consultas >= LIMITE) {
        onLimiteAlcanzado();
        return;
      }
    }

    // Comprobar límite de mensajes por sesión (visitantes)
    if (!esAutenticado && mensajesSesion >= LIMITE_MENSAJES_SESION) {
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Has alcanzado el límite de esta sesión. [BOTON_SOCIO:Hazte socio para continuar sin límites]",
          agente,
        },
      ]);
      return;
    }

    const nuevosMensajes: Mensaje[] = [
      ...mensajes,
      { role: "user", content: texto },
    ];
    setMensajes(nuevosMensajes);
    setInput("");
    setCargando(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nuevosMensajes.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          email: esAutenticado ? undefined : email,
          esAutenticado,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.respuesta,
          agente: data.agente as Agente,
        },
      ]);

      // Incrementar contador solo para visitantes
      if (!esAutenticado) {
        incrementarConsultas(email);
        setMensajesSesion((n) => n + 1);
      }
    } catch (err) {
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Lo siento, ha habido un problema al conectar. Por favor, inténtalo de nuevo en unos segundos.",
          agente,
        },
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

  // Altura dinámica del textarea
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  const consultasRestantes = esAutenticado
    ? null
    : LIMITE - getConsultas(email);

  return (
    <>
      {/* Backdrop semitransparente (solo en móvil) */}
      {abierto && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: "rgba(7,10,18,0.60)" }}
          onClick={onClose}
        />
      )}

      {/* Panel lateral */}
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
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
          >
            {config.emoji}
          </div>

          {/* Nombre + tagline */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">{agente}</p>
            <p className="text-xs leading-tight truncate" style={{ color: config.color }}>
              {config.tagline}
            </p>
          </div>

          {/* Consultas restantes (solo visitantes) */}
          {!esAutenticado && consultasRestantes !== null && (
            <span className="text-xs text-white/30 flex-shrink-0">
              {consultasRestantes} consulta{consultasRestantes !== 1 ? "s" : ""} restante{consultasRestantes !== 1 ? "s" : ""}
            </span>
          )}

          {/* Cerrar */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors ml-1"
            aria-label="Cerrar chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── MENSAJES ── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
          {mensajes.map((msg, i) => (
            <Burbuja key={i} mensaje={msg} config={config} />
          ))}

          {/* Indicador de escritura */}
          {cargando && (
            <div className="flex gap-3 justify-start">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
              >
                {config.emoji}
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-2"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", borderTopLeftRadius: 4 }}
              >
                <Loader2 size={14} className="animate-spin text-white/50" />
                <span className="text-white/40 text-sm">Pensando…</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── INPUT ── */}
        <div
          className="flex-shrink-0 px-4 py-4"
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
              placeholder={config.placeholder}
              disabled={cargando}
              className="flex-1 bg-transparent text-white text-sm placeholder-white/30 outline-none resize-none leading-relaxed py-1"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={enviar}
              disabled={!input.trim() || cargando}
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all mb-0.5"
              style={{
                backgroundColor: input.trim() && !cargando ? config.color : "rgba(255,255,255,0.08)",
                opacity: input.trim() && !cargando ? 1 : 0.4,
              }}
              aria-label="Enviar"
            >
              <Send size={14} className="text-white" style={{ transform: "translateX(1px)" }} />
            </button>
          </div>

          {/* Nota pie */}
          <p className="text-center text-white/20 text-xs mt-2">
            {esAutenticado
              ? "Acceso ilimitado como socio · XpertAuth"
              : "Shift+Enter para nueva línea · Enter para enviar"}
          </p>
        </div>
      </div>
    </>
  );
}
