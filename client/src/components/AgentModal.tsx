import { useState, useEffect } from "react";
import { X, Shield } from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Agente = "LEX" | "NOVA" | "ALMA";

interface AgentModalProps {
  agente: Agente | null;           // null = modal cerrado
  onConfirm: (nombre: string, email: string) => void;
  onClose: () => void;
}

// ─── Contenido por agente ────────────────────────────────────────────────────

const AGENTE_CONFIG: Record<Agente, {
  color: string;         // color primario del agente
  colorBg: string;       // fondo suave del badge
  colorBorder: string;   // borde del modal
  colorBtn: string;      // color del botón CTA
  colorBtnHover: string;
  emoji: string;
  tagline: string;       // subtítulo del modal
  descripcion: string;   // qué puede hacer
  placeholder: string;   // hint en el campo nombre
  ctaLabel: string;      // texto del botón
}> = {
  LEX: {
    color: "#1B4FD8",
    colorBg: "rgba(27,79,216,0.08)",
    colorBorder: "rgba(27,79,216,0.25)",
    colorBtn: "#1B4FD8",
    colorBtnHover: "#1640b0",
    emoji: "⚖️",
    tagline: "Especialista en normativa de transporte especial",
    descripcion:
      "LEX responde consultas sobre permisos de circulación, autorizaciones especiales, normativa DGT y SCT Catalunya, restricciones, vehículos de acompañamiento y mucho más. Basado en una base normativa de más de 16.000 fragmentos actualizados.",
    placeholder: "Tu nombre",
    ctaLabel: "Consultar con LEX",
  },
  NOVA: {
    color: "#4D9FEC",
    colorBg: "rgba(77,159,236,0.08)",
    colorBorder: "rgba(77,159,236,0.25)",
    colorBtn: "#4D9FEC",
    colorBtnHover: "#3a8fd8",
    emoji: "🤖",
    tagline: "Especialista en IA para pequeñas y medianas empresas",
    descripcion:
      "NOVA te ayuda a entender qué puede hacer la IA por tu negocio, qué herramientas existen, cómo empezar sin invertir y qué procesos se automatizan bien según tu sector. Sin humo, sin promesas vacías.",
    placeholder: "Tu nombre",
    ctaLabel: "Consultar con NOVA",
  },
  ALMA: {
    color: "#E8620A",
    colorBg: "rgba(232,98,10,0.08)",
    colorBorder: "rgba(232,98,10,0.25)",
    colorBtn: "#E8620A",
    colorBtnHover: "#c9530a",
    emoji: "🌱",
    tagline: "Especialista en formación digital para personas mayores",
    descripcion:
      "ALMA ayuda a personas mayores (o a sus familiares) a entender y usar el móvil, WhatsApp, la banca online y la tecnología del día a día, con calma y sin jerga. También informa sobre los cursos presenciales gratuitos de XpertAuth en Figueres.",
    placeholder: "Tu nombre o el de tu familiar",
    ctaLabel: "Hablar con ALMA",
  },
};

// ─── Helpers localStorage ────────────────────────────────────────────────────

const STORAGE_KEY = "xpertauth_agent_user";

function getStoredUser(): { nombre: string; email: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeUser(nombre: string, email: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ nombre, email }));
}

function getConsultasEsteMes(email: string): number {
  try {
    const key = `xpertauth_consultas_${email}_${new Date().getFullYear()}_${new Date().getMonth()}`;
    return parseInt(localStorage.getItem(key) || "0", 10);
  } catch {
    return 0;
  }
}

const LIMITE_CONSULTAS = 3;

// ─── Componente ──────────────────────────────────────────────────────────────

export default function AgentModal({ agente, onConfirm, onClose }: AgentModalProps) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [privacidad, setPrivacidad] = useState(false);
  const [error, setError] = useState("");
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);

  // Al abrir, intentar recuperar datos previos y comprobar límite
  useEffect(() => {
    if (!agente) return;

    const stored = getStoredUser();
    if (stored) {
      setNombre(stored.nombre);
      setEmail(stored.email);
      setPrivacidad(true);
      const consultas = getConsultasEsteMes(stored.email);
      if (consultas >= LIMITE_CONSULTAS) {
        setLimiteAlcanzado(true);
      }
    }
  }, [agente]);

  if (!agente) return null;

  const config = AGENTE_CONFIG[agente];

  // Validación básica de email
  const emailValido = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  function handleSubmit() {
    setError("");
    if (!nombre.trim()) {
      setError("Introduce tu nombre para continuar.");
      return;
    }
    if (!emailValido(email)) {
      setError("Introduce un email válido.");
      return;
    }
    if (!privacidad) {
      setError("Acepta la política de privacidad para continuar.");
      return;
    }

    storeUser(nombre.trim(), email.trim().toLowerCase());
    onConfirm(nombre.trim(), email.trim().toLowerCase());
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(7,10,18,0.85)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{
          backgroundColor: "#0F1628",
          border: `1px solid ${config.colorBorder}`,
        }}
      >
        {/* Franja superior de color */}
        <div style={{ height: 4, backgroundColor: config.color }} />

        {/* Contenido */}
        <div className="p-7">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/40 hover:text-white/80 transition-colors"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>

          {/* Badge agente */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl"
              style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
            >
              {config.emoji}
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{agente}</p>
              <p style={{ color: config.color }} className="text-sm leading-tight">
                {config.tagline}
              </p>
            </div>
          </div>

          {/* ── PANTALLA LÍMITE ALCANZADO ── */}
          {limiteAlcanzado ? (
            <div className="text-center py-2">
              <p className="text-white/80 text-sm mb-2">
                Has usado tus <strong className="text-white">3 consultas gratuitas</strong> de este mes.
              </p>
              <p className="text-white/60 text-sm mb-6">
                Hazte socio de XpertAuth para acceder sin límites a {agente} y al resto del equipo.
              </p>
              <a
                href="/es/socios"
                className="block w-full text-center py-3 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: config.color }}
              >
                Hazte socio
              </a>
              <button
                onClick={onClose}
                className="mt-3 w-full text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            /* ── PANTALLA FORMULARIO ── */
            <>
              {/* Descripción */}
              <p className="text-white/70 text-sm leading-relaxed mb-6">
                {config.descripcion}
              </p>

              {/* Formulario */}
              <div className="space-y-3">
                {/* Nombre */}
                <input
                  type="text"
                  placeholder={config.placeholder}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = config.color)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />

                {/* Email */}
                <input
                  type="email"
                  placeholder="Tu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 outline-none transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = config.color)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />

                {/* Privacidad */}
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={privacidad}
                      onChange={(e) => setPrivacidad(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center transition-colors"
                      style={{
                        backgroundColor: privacidad ? config.color : "rgba(255,255,255,0.06)",
                        border: `1px solid ${privacidad ? config.color : "rgba(255,255,255,0.20)"}`,
                      }}
                    >
                      {privacidad && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-white/50 text-xs leading-relaxed group-hover:text-white/70 transition-colors">
                    Acepto la{" "}
                    <a
                      href="/es/privacidad"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-white transition-colors"
                      style={{ color: config.color }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      política de privacidad
                    </a>
                    . Mis datos se usan únicamente para gestionar el acceso al agente y no se ceden a terceros.
                  </span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <p className="mt-3 text-sm" style={{ color: "#f87171" }}>
                  {error}
                </p>
              )}

              {/* CTA */}
              <button
                onClick={handleSubmit}
                className="mt-5 w-full py-3 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90 active:opacity-80"
                style={{ backgroundColor: config.color }}
              >
                {config.ctaLabel}
              </button>

              {/* Nota gratuita */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-white/35 text-xs">
                <Shield size={12} />
                <span>3 consultas gratuitas al mes · Sin tarjeta</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
