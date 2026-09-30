import { X } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { entrarConGoogle } from "@/lib/supabase";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Agente = "LEX" | "NOVA";
// "registro" = acceso desde el botón "Regístrate" del navbar (sin agente concreto).
export type ModalObjetivo = Agente | "registro";

// Avatares ilustrados (los mismos que usa la sección Equipo)
const AVATAR_BASE = "https://supabase.xpertauth.com/storage/v1/object/public/web-images/equipo";
const LOGO_URL = "https://supabase.xpertauth.com/storage/v1/object/public/web-images/logo/logo_xpertauth_icon_v1.png";

interface AgentModalProps {
  agente: ModalObjetivo | null;    // null = modal cerrado
  onClose: () => void;
}

type Idioma = "es" | "ca" | "en" | "fr";

// ─── Textos por idioma ───────────────────────────────────────────────────────

const TEXTOS: Record<Idioma, {
  taglineLex: string;
  taglineNova: string;
  descLex: string;
  descNova: string;
  google: string;
  consentPre: string;
  consentLink: string;
  consentPost: string;
  cerrar: string;
}> = {
  es: {
    taglineLex: "Especialista en normativa de transporte especial",
    taglineNova: "IA para pymes de transporte",
    descLex:
      "LEX responde consultas sobre permisos de circulación, autorizaciones especiales, normativa DGT y SCT Catalunya, restricciones, vehículos de acompañamiento y mucho más. Basado en una base normativa propia, que crece con cada nueva norma.",
    descNova:
      "NOVA te ayuda a ver qué puede hacer la IA en una pyme de transporte: caducidad de permisos, expedientes, avisos obligatorios, seguimiento de flota. Cómo empezar sin invertir y sin humo.",
    google: "Continuar con Google",
    consentPre: "Al registrarte aceptas la ",
    consentLink: "política de privacidad",
    consentPost: ". Tus consultas se procesan con Claude (Anthropic). No vendemos ni compartimos tus datos.",
    cerrar: "Cerrar",
  },
  ca: {
    taglineLex: "Especialista en normativa de transport especial",
    taglineNova: "IA per a pimes de transport",
    descLex:
      "LEX respon consultes sobre permisos de circulació, autoritzacions especials, normativa DGT i SCT Catalunya, restriccions, vehicles d'acompanyament i molt més. Basat en una base normativa pròpia, que creix amb cada nova norma.",
    descNova:
      "NOVA t'ajuda a veure què pot fer la IA en una pime de transport: caducitat de permisos, expedients, avisos obligatoris, seguiment de flota. Com començar sense invertir i sense fum.",
    google: "Continua amb Google",
    consentPre: "En registrar-te acceptes la ",
    consentLink: "política de privacitat",
    consentPost: ". Les teves consultes es processen amb Claude (Anthropic). No venem ni compartim les teves dades.",
    cerrar: "Tanca",
  },
  en: {
    taglineLex: "Special transport regulations specialist",
    taglineNova: "AI for transport SMEs",
    descLex:
      "LEX answers questions about circulation permits, special authorisations, DGT and SCT Catalunya regulations, restrictions, escort vehicles and much more. Built on our own regulatory base, which grows with every new rule.",
    descNova:
      "NOVA helps you see what AI can do in a transport SME: permit expiry, case files, mandatory alerts, fleet tracking. How to start without investing and without hype.",
    google: "Continue with Google",
    consentPre: "By signing up you accept the ",
    consentLink: "privacy policy",
    consentPost: ". Your queries are processed with Claude (Anthropic). We do not sell or share your data.",
    cerrar: "Close",
  },
  fr: {
    taglineLex: "Spécialiste de la réglementation du transport spécial",
    taglineNova: "IA pour PME de transport",
    descLex:
      "LEX répond aux questions sur les permis de circulation, les autorisations spéciales, la réglementation DGT et SCT Catalunya, les restrictions, les véhicules d'accompagnement et bien plus. Basé sur une base réglementaire propre, qui s'enrichit à chaque nouvelle norme.",
    descNova:
      "NOVA vous aide à voir ce que l'IA peut faire dans une PME de transport : expiration des permis, dossiers, alertes obligatoires, suivi de flotte. Comment commencer sans investir et sans esbroufe.",
    google: "Continuer avec Google",
    consentPre: "En vous inscrivant, vous acceptez la ",
    consentLink: "politique de confidentialité",
    consentPost: ". Vos requêtes sont traitées avec Claude (Anthropic). Nous ne vendons ni ne partageons vos données.",
    cerrar: "Fermer",
  },
};

// ─── Contenido por agente ────────────────────────────────────────────────────

const AGENTE_CONFIG: Record<Agente, {
  color: string;         // color primario del agente
  colorBg: string;       // fondo suave del badge
  colorBorder: string;   // borde del modal
  avatar: string;        // avatar ilustrado del agente
}> = {
  LEX: {
    color: "#1B4FD8",
    colorBg: "rgba(27,79,216,0.08)",
    colorBorder: "rgba(27,79,216,0.25)",
    avatar: `${AVATAR_BASE}/lex_avatar_v1.webp`,
  },
  NOVA: {
    color: "#4D9FEC",
    colorBg: "rgba(77,159,236,0.08)",
    colorBorder: "rgba(77,159,236,0.25)",
    avatar: `${AVATAR_BASE}/nova_avatar_v1.webp`,
  },
};

const REGISTRO_CONFIG = {
  color: "#1B4FD8",
  colorBg: "rgba(27,79,216,0.08)",
  colorBorder: "rgba(27,79,216,0.25)",
  avatar: LOGO_URL,
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function AgentModal({ agente, onClose }: AgentModalProps) {
  const { locale } = useI18n();
  if (!agente) return null;

  const idioma: Idioma = locale === "ca" || locale === "en" || locale === "fr" ? locale : "es";
  const t = TEXTOS[idioma];
  const esRegistro = agente === "registro";
  const config = esRegistro ? REGISTRO_CONFIG : AGENTE_CONFIG[agente];
  const nombre = esRegistro ? "XpertAuth" : agente;
  const tagline = esRegistro ? null : agente === "LEX" ? t.taglineLex : t.taglineNova;
  const descripcion = esRegistro ? null : agente === "LEX" ? t.descLex : t.descNova;

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

        <div className="p-7">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/40 hover:text-white/80 transition-colors"
            aria-label={t.cerrar}
          >
            <X size={20} />
          </button>

          {/* Cabecera */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden"
              style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
            >
              <img
                src={config.avatar}
                alt={nombre}
                className={esRegistro ? "w-8 h-8 object-contain" : "w-full h-full object-cover"}
              />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{nombre}</p>
              {tagline && (
                <p style={{ color: config.color }} className="text-sm leading-tight">
                  {tagline}
                </p>
              )}
            </div>
          </div>

          {descripcion && (
            <p className="text-white/70 text-sm leading-relaxed mb-6">{descripcion}</p>
          )}

          {/* Único acceso: Google */}
          <button
            onClick={() => entrarConGoogle(locale, esRegistro ? null : agente)}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm bg-white text-[#1f1f1f] transition-opacity hover:opacity-90 active:opacity-80"
            data-testid="button-google-agent"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.google}
          </button>

          {/* Consentimiento */}
          <p className="mt-4 text-white/50 text-xs leading-relaxed text-center">
            {t.consentPre}
            <a
              href={`/${locale}/politica-de-privacidad`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
              style={{ color: config.color }}
            >
              {t.consentLink}
            </a>
            {t.consentPost}
          </p>
        </div>
      </div>
    </div>
  );
}
