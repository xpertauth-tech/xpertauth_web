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
  onLimiteAlcanzado: () => void;
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
  disclaimer: string;
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
    disclaimer: "LEX es IA y puede cometer errores. Verifica siempre la información antes de actuar.",
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
    disclaimer: "NOVA es IA y puede cometer errores. Contrasta siempre la información.",
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
    disclaimer: "ALMA es IA y puede cometer errores. Si tienes dudas, consúltalo con alguien de confianza.",
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

const LIMITE = 5;

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
}: {
  mensaje: Mensaje;
  config: typeof AGENTE_CONFIG[Agente];
}) {
  const esAsistente = mensaje.role === "assistant";
  const { textoLimpio, botones } = parsearBotones(mensaje.content);

  return (
    <div className={`flex gap-3 ${esAsistente ? "justify-start" : "justify-end"}`}>
      {esAsistente && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base mt-0.5"
          style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
        >
          {config.emoji}
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
                  <a
                    key={i}
                    href="mailto:joseluis@xpertauth.com?subject=Solicitud%20de%20cita"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: "rgba(232,98,10,0.15)",
                      border: "1px solid rgba(232,98,10,0.35)",
                      color: "#E8620A",
                    }}
                  >
                    <Calendar size={12} />
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
                      backgroundColor: "rgba(77,159,236,0.15)",
                      border: "1px solid rgba(77,159,236,0.35)",
                      color: "#4D9FEC",
                    }}
                  >
                    <Users size={12} />
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
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      role: "assistant",
      content: config.mensajeBienvenida,
      agente,
    },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);

  const EMAIL_CORPORATIVO = "eche.jose@gmail.com";
  const esCorporativo = email === EMAIL_CORPORATIVO;
  const sinLimite = esAutenticado || esCorporativo;

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const lexDeshabilitado = false;

  useEffect(() => {
    if (abierto) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [mensajes, abierto]);

  useEffect(() => {
    setMensajes([
      {
        role: "assistant",
        content: config.mensajeBienvenida,
        agente,
      },
    ]);
    setInput("");
  }, [agente]);

  async function enviar() {
    const texto = input.trim();
    if (!texto || cargando) return;

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
          agente,
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

      if (!sinLimite) {
        if (esAutenticado) {
          if (data.limitAlcanzado) {
            setLimiteAlcanzado(true);
          }
        } else {
          incrementarConsultas(email);
          const consultasTras = getConsultas(email);
          if (consultasTras >= LIMITE) {
            setLimiteAlcanzado(true);
          }
        }
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

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (limiteAlcanzado) {
      e.preventDefault();
      onLimiteAlcanzado();
      return;
    }
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }

  const consultasRestantes = sinLimite
    ? null
    : LIMITE - getConsultas(email);

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
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
          >
            {config.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">{agente}</p>
            <p className="text-xs leading-tight truncate" style={{ color: config.color }}>
              {config.tagline}
            </p>
          </div>

          {!esAutenticado && consultasRestantes !== null && (
            <span className="text-xs text-white/30 flex-shrink-0">
              {consultasRestantes} consulta{consultasRestantes !== 1 ? "s" : ""} restante{consultasRestantes !== 1 ? "s" : ""}
            </span>
          )}

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

          {limiteAlcanzado && (
            <div
              className="mx-2 px-4 py-3 rounded-xl text-center text-sm"
              style={{
                backgroundColor: "rgba(27,79,216,0.12)",
                border: "1px solid rgba(27,79,216,0.30)",
                color: "rgba(255,255,255,0.70)",
              }}
            >
              {esAutenticado ? (
                <>
                  Has usado tus <strong style={{ color: "#fff" }}>30 consultas de este mes</strong>.
                  <br />
                  <span style={{ color: "rgba(255,255,255,0.50)", fontSize: "0.75rem" }}>
                    Tus consultas se restauran el 1 del mes siguiente.
                  </span>
                </>
              ) : (
                <>
                  Has usado tus <strong style={{ color: "#fff" }}>5 consultas de prueba</strong>.
                  Regístrate gratis y obtén <strong style={{ color: "#fff" }}>30 consultas al mes</strong>.
                  <br />
                  <button
                    onClick={onLimiteAlcanzado}
                    className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-80"
                    style={{ backgroundColor: "#1B4FD8", color: "#fff" }}
                  >
                    Registrarme gratis
                  </button>
                </>
              )}
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
              placeholder={config.placeholder}
              disabled={cargando || limiteAlcanzado}
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

          {/* Disclaimer IA */}
          <p className="text-center text-white/50 text-xs mt-2 leading-snug px-1">
            {config.disclaimer}
          </p>
        </div>
      </div>
    </>
  );
}
