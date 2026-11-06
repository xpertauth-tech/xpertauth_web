import { useState, useEffect, useRef } from "react";
import ExternalMark, { useExternalLinkProps } from "@/components/external-mark";
import { Send, Loader2, Calendar, AlertTriangle } from "lucide-react";
import ContactModal from "./ContactModal";
import { supabase, entrarConGoogle } from "@/lib/supabase";
import { TEXTOS_ACCESO } from "./AgentModal";
import { useI18n } from "@/i18n/context";
import { imagenReducida } from "@/lib/imagenes";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type Agente = "LEX" | "NOVA";

// Avatares ilustrados (los mismos que usa la sección Equipo)
const AVATAR_BASE = "https://supabase.xpertauth.com/storage/v1/object/public/web-images/equipo";

export interface Mensaje {
  role: "user" | "assistant";
  content: string;
  agente?: Agente;
}

export type Idioma = "es" | "ca" | "en" | "fr";

// ─── Config por agente ───────────────────────────────────────────────────────

export const AGENTE_CONFIG: Record<Agente, {
  color: string;
  colorBg: string;
  colorBorder: string;
  avatar: string;
  avatarGrande: string;
}> = {
  LEX: {
    color: "#1B4FD8",
    colorBg: "rgba(27,79,216,0.10)",
    colorBorder: "rgba(27,79,216,0.25)",
    avatar: imagenReducida(`${AVATAR_BASE}/lex_avatar_v1.webp`, 96),
    avatarGrande: imagenReducida(`${AVATAR_BASE}/lex_avatar_v1.webp`, 256),
  },
  NOVA: {
    color: "#4D9FEC",
    colorBg: "rgba(77,159,236,0.10)",
    colorBorder: "rgba(77,159,236,0.25)",
    avatar: imagenReducida(`${AVATAR_BASE}/nova_avatar_v1.webp`, 96),
    avatarGrande: imagenReducida(`${AVATAR_BASE}/nova_avatar_v1.webp`, 256),
  },
};

// ─── Textos por idioma ───────────────────────────────────────────────────────

export const TEXTOS: Record<Idioma, {
  taglineLex: string;
  taglineNova: string;
  bienvenidaLex: string;
  bienvenidaNova: string;
  placeholderLex: string;
  placeholderNova: string;
  disclaimer: (agente: Agente) => string;
  revisionPre: string;
  revisionLink: string;
  revisionPost: string;
  pensando: string;
  errorConexion: string;
  limitePre: string;
  limiteNegrita: (n: number | null) => string;
  limitePost: string;
  limiteRestaura: string;
  botonCita: string;
  cerrar: string;
  enviar: string;
  fraseLex: string;
  fraseNova: string;
  ejemplosLex: [string, string];
  ejemplosNova: [string, string];
  entrarLex: string;
  entrarNova: string;
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
    revisionPre: "LEX está en revisión. Mientras lo mejoramos, sus respuestas pueden contener errores. Para casos importantes, ",
    revisionLink: "cuéntanos tu caso",
    revisionPost: ".",
    pensando: "Pensando…",
    errorConexion: "Lo siento, ha habido un problema al conectar. Por favor, inténtalo de nuevo en unos segundos.",
    limitePre: "Has usado tus ",
    limiteNegrita: (n) => (n === null ? "consultas de este mes" : `${n} consultas de este mes`),
    limitePost: ".",
    limiteRestaura: "Tus consultas se restauran el 1 del mes siguiente.",
    botonCita: "Consultar con José Luis",
    cerrar: "Cerrar chat",
    enviar: "Enviar",
    fraseLex: "La normativa del transporte especial, explicada con claridad.",
    fraseNova: "Pon orden en tu empresa con ayuda de la IA.",
    ejemplosLex: ["¿Qué autorización necesito para un transporte de 22 m?", "¿Cuándo hace falta vehículo piloto?"],
    ejemplosNova: ["¿Cómo organizo los vencimientos de mis vehículos?", "¿Por dónde empiezo a usar la IA en mi empresa?"],
    entrarLex: "Entra con Google para preguntar a LEX",
    entrarNova: "Entra con Google para preguntar a NOVA",
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
    revisionPre: "LEX està en revisió. Mentre el millorem, les seves respostes poden contenir errors. Per a casos importants, ",
    revisionLink: "explica'ns el teu cas",
    revisionPost: ".",
    pensando: "Pensant…",
    errorConexion: "Ho sento, hi ha hagut un problema en connectar. Torna-ho a provar d'aquí a uns segons.",
    limitePre: "Has fet servir les teves ",
    limiteNegrita: (n) => (n === null ? "consultes d'aquest mes" : `${n} consultes d'aquest mes`),
    limitePost: ".",
    limiteRestaura: "Les teves consultes es restauren l'1 del mes següent.",
    botonCita: "Consultar amb José Luis",
    cerrar: "Tanca el xat",
    enviar: "Envia",
    fraseLex: "La normativa del transport especial, explicada amb claredat.",
    fraseNova: "Posa ordre a la teva empresa amb l'ajuda de la IA.",
    ejemplosLex: ["Quina autorització necessito per a un transport de 22 m?", "Quan cal vehicle pilot?"],
    ejemplosNova: ["Com organitzo els venciments dels meus vehicles?", "Per on començo a fer servir la IA a la meva empresa?"],
    entrarLex: "Entra amb Google per preguntar a LEX",
    entrarNova: "Entra amb Google per preguntar a NOVA",
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
    revisionPre: "LEX is under review. While we improve it, its answers may contain errors. For important cases, ",
    revisionLink: "tell us about your case",
    revisionPost: ".",
    pensando: "Thinking…",
    errorConexion: "Sorry, there was a problem connecting. Please try again in a few seconds.",
    limitePre: "You have used your ",
    limiteNegrita: (n) => (n === null ? "queries for this month" : `${n} queries for this month`),
    limitePost: ".",
    limiteRestaura: "Your queries reset on the 1st of next month.",
    botonCita: "Consult José Luis",
    cerrar: "Close chat",
    enviar: "Send",
    fraseLex: "Special transport regulations, explained clearly.",
    fraseNova: "Bring order to your business with the help of AI.",
    ejemplosLex: ["What authorisation do I need for a 22 m transport?", "When is an escort vehicle required?"],
    ejemplosNova: ["How do I organise the expiry dates of my vehicles?", "Where do I start using AI in my business?"],
    entrarLex: "Sign in with Google to ask LEX",
    entrarNova: "Sign in with Google to ask NOVA",
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
    revisionPre: "LEX est en cours de révision. Pendant que nous l'améliorons, ses réponses peuvent contenir des erreurs. Pour les cas importants, ",
    revisionLink: "racontez-nous votre cas",
    revisionPost: ".",
    pensando: "Réflexion…",
    errorConexion: "Désolé, un problème de connexion est survenu. Veuillez réessayer dans quelques secondes.",
    limitePre: "Vous avez utilisé vos ",
    limiteNegrita: (n) => (n === null ? "requêtes de ce mois" : `${n} requêtes de ce mois`),
    limitePost: ".",
    limiteRestaura: "Vos requêtes sont réinitialisées le 1er du mois suivant.",
    botonCita: "Consulter José Luis",
    cerrar: "Fermer le chat",
    enviar: "Envoyer",
    fraseLex: "La réglementation du transport spécial, expliquée avec clarté.",
    fraseNova: "Mettez de l'ordre dans votre entreprise avec l'aide de l'IA.",
    ejemplosLex: ["Quelle autorisation me faut-il pour un transport de 22 m ?", "Quand un véhicule pilote est-il nécessaire ?"],
    ejemplosNova: ["Comment organiser les échéances de mes véhicules ?", "Par où commencer pour utiliser l'IA dans mon entreprise ?"],
    entrarLex: "Connectez-vous avec Google pour poser une question à LEX",
    entrarNova: "Connectez-vous avec Google pour poser une question à NOVA",
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

  // [BOTON_SCT:Label:URL] (el modelo a veces escribe BOTON_DGT para el botón de la DGT: se acepta igual)
  textoLimpio = textoLimpio.replace(
    /\[BOTON_(?:SCT|DGT):([^:\]]+):([^\]]+)\]/g,
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
      nodos.push(<p key={i} className="font-bold text-white mt-3 mb-1" style={{ fontSize: "0.9375rem" }}>{linea.replace(/^## /, "")}</p>);
    } else if (linea.startsWith("### ")) {
      nodos.push(<p key={i} className="font-semibold mt-2 mb-0.5" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.75)" }}>{linea.replace(/^### /, "")}</p>);
    } else if (/^[-*] /.test(linea)) {
      nodos.push(<div key={i} className="flex gap-2 my-0.5"><span className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full bg-white/40" /><span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{parsearInline(linea.replace(/^[-*] /, ""))}</span></div>);
    } else if (/^\d+\. /.test(linea)) {
      const num = linea.match(/^(\d+)\. /)?.[1];
      nodos.push(<div key={i} className="flex gap-2 my-0.5"><span className="flex-shrink-0 text-xs font-medium" style={{ color: "rgba(255,255,255,0.70)", minWidth: "1rem" }}>{num}.</span><span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{parsearInline(linea.replace(/^\d+\. /, ""))}</span></div>);
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

export function Burbuja({
  mensaje,
  config,
  labelCita,
  onCita,
}: {
  mensaje: Mensaje;
  config: typeof AGENTE_CONFIG[Agente];
  labelCita: string;
  onCita: () => void;
}) {
  const esAsistente = mensaje.role === "assistant";
  const externalProps = useExternalLinkProps();
  const { textoLimpio, botones } = parsearBotones(mensaje.content);

  return (
    <div className={`flex gap-3 ${esAsistente ? "justify-start" : "justify-end"}`}>
      {esAsistente && (
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden mt-0.5"
          style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
        >
          <img src={config.avatar} alt="" width={64} height={64} decoding="async" className="w-full h-full object-cover" />
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
                    {...externalProps}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: "rgba(27,79,216,0.15)",
                      border: "1px solid rgba(27,79,216,0.35)",
                      color: "#4D9FEC",
                    }}
                  >
                    {btn.label}
                    <ExternalMark className="w-3 h-3" />
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
                    {labelCita}
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

// ─── Aviso «LEX está en revisión» (mismo texto que tenía el panel) ───────────

export function AvisoLexRevision() {
  const { locale } = useI18n();
  const idioma: Idioma = locale === "ca" || locale === "en" || locale === "fr" ? locale : "es";
  const t = TEXTOS[idioma];
  const [contactOpen, setContactOpen] = useState(false);
  return (
    <>
      <div
        role="note"
        className="flex items-start gap-2.5 px-4 py-3 text-sm leading-snug rounded-xl text-left"
        style={{
          backgroundColor: "#0F1628",
          border: "1px solid rgba(255,255,255,0.07)",
          borderLeft: "3px solid #E8620A",
          color: "rgba(255,255,255,0.85)",
        }}
        data-testid="aviso-lex-revision"
      >
        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#E8620A" }} aria-hidden="true" />
        <p>
          {t.revisionPre}
          <button
            type="button"
            onClick={() => setContactOpen(true)}
            className="underline underline-offset-2 hover:text-white transition-colors"
            style={{ color: "#E8620A" }}
          >
            {t.revisionLink}
          </button>
          {t.revisionPost}
        </p>
      </div>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

// ─── Chat a ancho completo (misma lógica y mismo /api/chat que el antiguo panel) ───

interface ChatAgenteProps {
  agente: Agente;
}

export default function ChatAgente({ agente }: ChatAgenteProps) {
  const { locale } = useI18n();
  const idioma: Idioma = locale === "ca" || locale === "en" || locale === "fr" ? locale : "es";
  const t = TEXTOS[idioma];
  const config = AGENTE_CONFIG[agente];
  const bienvenida = agente === "LEX" ? t.bienvenidaLex : t.bienvenidaNova;
  const placeholder = agente === "LEX" ? t.placeholderLex : t.placeholderNova;
  const ejemplos = agente === "LEX" ? t.ejemplosLex : t.ejemplosNova;
  const textoEntrar = agente === "LEX" ? t.entrarLex : t.entrarNova;
  const textosModal = TEXTOS_ACCESO[idioma];

  // null = aún se comprueba la sesión; false = sin sesión (se ofrece entrar con Google)
  const [haySesion, setHaySesion] = useState<boolean | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { role: "assistant", content: bienvenida, agente },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [limite, setLimite] = useState<number | null>(null); // cifra que devuelve el servidor
  const [contactOpen, setContactOpen] = useState(false);

  const mensajesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setHaySesion(!!data.session?.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setHaySesion(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // Se baja solo dentro de la caja de mensajes (la página no se mueve).
  useEffect(() => {
    const el = mensajesRef.current;
    if (el && mensajes.length > 1) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [mensajes, cargando]);

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
      setHaySesion(false);
      return;
    }

    const nuevosMensajes: Mensaje[] = [...mensajes, { role: "user", content: texto }];

    setMensajes(nuevosMensajes);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setCargando(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          messages: nuevosMensajes.map((m) => ({ role: m.role, content: m.content })),
          agente,
          idioma,
        }),
      });

      // Tras cada consulta (también si se alcanza el límite) el navbar vuelve a pedir las que quedan.
      if (res.status !== 401) window.dispatchEvent(new Event("xpertauth:consultas"));

      if (res.status === 401) {
        setMensajes(mensajes);
        setHaySesion(false);
        return;
      }
      if (res.status === 429) {
        // Límite mensual alcanzado (lo decide el servidor).
        setMensajes(mensajes);
        const cuerpo = await res.json().catch(() => null);
        setLimite(typeof cuerpo?.limite === "number" ? cuerpo.limite : null);
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

  function ajustarAltura(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    ajustarAltura(e.target);
  }

  // Una pregunta de ejemplo rellena la caja; no envía.
  function usarEjemplo(texto: string) {
    setInput(texto);
    setTimeout(() => {
      if (inputRef.current) {
        ajustarAltura(inputRef.current);
        inputRef.current.focus();
      }
    }, 0);
  }

  const mostrarEjemplos = haySesion === true && mensajes.length === 1 && !cargando;

  return (
    <>
      <div
        className="flex flex-col w-full rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "#0A0E1A",
          border: `1px solid ${config.colorBorder}`,
          height: "min(72vh, 720px)",
          minHeight: 480,
        }}
        data-testid={`chat-${agente.toLowerCase()}`}
      >
        {/* ── MENSAJES ── */}
        <div ref={mensajesRef} className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {mensajes.map((msg, i) => (
            <Burbuja key={i} mensaje={msg} config={config} labelCita={t.botonCita} onCita={() => setContactOpen(true)} />
          ))}

          {cargando && (
            <div className="flex gap-3 justify-start">
              <div
                className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
              >
                <img src={config.avatar} alt="" width={64} height={64} decoding="async" className="w-full h-full object-cover" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-2"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", borderTopLeftRadius: 4 }}
              >
                <Loader2 size={14} className="animate-spin text-white/70" />
                <span className="text-white/70 text-sm">{t.pensando}</span>
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
              {t.limitePre}<strong style={{ color: "#fff" }}>{t.limiteNegrita(limite)}</strong>{t.limitePost}
              <br />
              <span style={{ color: "rgba(255,255,255,0.70)", fontSize: "0.875rem" }}>
                {t.limiteRestaura}
              </span>
            </div>
          )}
        </div>

        {/* ── ENTRADA ── */}
        <div
          className="flex-shrink-0 px-4 sm:px-6 pb-4 pt-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {mostrarEjemplos && (
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              {ejemplos.map((ej) => (
                <button
                  key={ej}
                  type="button"
                  onClick={() => usarEjemplo(ej)}
                  className="text-left px-4 py-2 rounded-lg text-sm text-white/70 hover:text-white transition-colors"
                  style={{ backgroundColor: "rgba(255,255,255,0.04)", border: `1px solid ${config.colorBorder}` }}
                >
                  {ej}
                </button>
              ))}
            </div>
          )}

          {haySesion === false ? (
            <div className="py-1">
              <button
                onClick={() => entrarConGoogle(locale, agente)}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm bg-white text-[#1f1f1f] transition-opacity hover:opacity-90 active:opacity-80"
                data-testid="button-google-chat"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {textoEntrar}
              </button>
              <p className="mt-3 text-white/70 text-xs leading-relaxed text-left">
                {textosModal.consentPre}
                <a
                  href={`/${locale}/politica-de-privacidad`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white transition-colors"
                  style={{ color: config.color }}
                >
                  {textosModal.consentLink}
                </a>
                {textosModal.consentPost}
              </p>
            </div>
          ) : (
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
                disabled={cargando || limiteAlcanzado || haySesion === null}
                aria-label={placeholder}
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
          )}

          {/* Aviso IA (igual en los dos agentes, siempre visible) */}
          <p className="text-center text-white/70 text-xs mt-2 leading-snug px-1">
            {t.disclaimer(agente)}
          </p>
        </div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
