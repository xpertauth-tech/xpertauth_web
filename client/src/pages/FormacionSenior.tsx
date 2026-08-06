import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactModal from "@/components/ContactModal";
import { Calendar } from "lucide-react";

// ─── Gradient style (same pattern as IaPymes) ────────────────────────────────
const emberGradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#E8620A 45%,#ff9a5c 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function RevealDiv({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(32px)",
      transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "", duration = 1800 }: {
  target: number; suffix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal(0.3);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [visible, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}{suffix}
    </span>
  );
}

// ─── Program card ─────────────────────────────────────────────────────────────
function ProgramCard({
  num, title, subtitle, description, topics, badge, isPhilosophy, isEntity,
  ctaLabel, onCta,
}: {
  num?: string; title: string; subtitle: string; description: string;
  topics: string[]; badge?: string; isPhilosophy?: boolean; isEntity?: boolean;
  ctaLabel: string; onCta: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const borderColor = isEntity
    ? hovered ? "rgba(77,159,236,0.5)" : "rgba(77,159,236,0.15)"
    : isPhilosophy
    ? hovered ? "rgba(232,98,10,0.6)" : "rgba(232,98,10,0.25)"
    : hovered ? "rgba(232,98,10,0.4)" : "rgba(255,255,255,0.07)";

  const bg = isEntity
    ? "rgba(27,79,216,0.05)"
    : isPhilosophy
    ? "rgba(232,98,10,0.05)"
    : "rgba(255,255,255,0.02)";

  const glowColor = isEntity
    ? "rgba(77,159,236,0.12)"
    : "rgba(232,98,10,0.1)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 60px ${glowColor}` : "none",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Background glow for philosophy card */}
      {isPhilosophy && (
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at 50% 0%, rgba(232,98,10,0.08) 0%, transparent 70%)",
        }} />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {num && !isPhilosophy && (
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
              color: isEntity ? "#4D9FEC" : "#E8620A",
              fontFamily: "JetBrains Mono, monospace",
            }}>
              {num}
            </span>
          )}
          {isPhilosophy && (
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(232,98,10,0.15)",
              border: "1px solid rgba(232,98,10,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                <path d="M10 2l2.4 4.8L18 7.6l-4 3.9.9 5.5L10 14.4l-4.9 2.6.9-5.5L2 7.6l5.6-.8L10 2z"
                  fill="rgba(232,98,10,0.6)" stroke="#E8620A" strokeWidth="1.2"/>
              </svg>
            </div>
          )}
          {isEntity && (
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(77,159,236,0.12)",
              border: "1px solid rgba(77,159,236,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none">
                <path d="M3 17V8l7-5 7 5v9M7 17v-5h6v5" stroke="#4D9FEC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
          <div>
            <h3 style={{
              color: "#fff", fontWeight: 700, fontSize: 17, lineHeight: 1.3,
              margin: 0,
            }}>{title}</h3>
            <p style={{
              color: isEntity ? "rgba(77,159,236,0.7)" : "rgba(232,98,10,0.7)",
              fontSize: 12, margin: "3px 0 0", fontWeight: 500,
            }}>{subtitle}</p>
          </div>
        </div>
        {badge && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            padding: "4px 10px", borderRadius: 20,
            background: isEntity ? "rgba(77,159,236,0.15)" : "rgba(232,98,10,0.15)",
            color: isEntity ? "#4D9FEC" : "#E8620A",
            border: `1px solid ${isEntity ? "rgba(77,159,236,0.3)" : "rgba(232,98,10,0.3)"}`,
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            {badge}
          </span>
        )}
      </div>

      {/* Description */}
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>
        {description}
      </p>

      {/* Topics */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {topics.map((topic, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%", flexShrink: 0, marginTop: 7,
              background: isEntity ? "#4D9FEC" : "#E8620A",
              boxShadow: isEntity ? "0 0 6px rgba(77,159,236,0.5)" : "0 0 6px rgba(232,98,10,0.5)",
            }} />
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.5 }}>
              {topic}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onCta}
        style={{
          marginTop: 4,
          padding: "11px 22px",
          borderRadius: 10,
          fontWeight: 600, fontSize: 14, cursor: "pointer",
          transition: "all 0.25s ease",
          alignSelf: "flex-start",
          background: isEntity
            ? hovered ? "#1B4FD8" : "rgba(27,79,216,0.12)"
            : hovered ? "#E8620A" : "rgba(232,98,10,0.12)",
          color: isEntity
            ? hovered ? "#fff" : "#4D9FEC"
            : hovered ? "#fff" : "#E8620A",
          border: isEntity
            ? `1px solid ${hovered ? "#1B4FD8" : "rgba(27,79,216,0.35)"}`
            : `1px solid ${hovered ? "#E8620A" : "rgba(232,98,10,0.35)"}`,
        }}
      >
        {ctaLabel} →
      </button>
    </div>
  );
}

// ─── Texts by locale ──────────────────────────────────────────────────────────
const texts: Record<string, {
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaMain: string;
  heroCtaSecondary: string;
  statsLabel: string;
  stats: { value: number; suffix: string; label: string }[];
  quoteText: string;
  quoteAuthor: string;
  programsLabel: string;
  programsTitle: string;
  programsSubtitle: string;
  cards: {
    num?: string; title: string; subtitle: string;
    description: string; topics: string[]; badge?: string;
    isPhilosophy?: boolean; isEntity?: boolean; ctaLabel: string;
  }[];
  entitySectionLabel: string;
  entitySectionTitle: string;
  entitySectionBody: string;
  entityFormTitle: string;
  entityNamePlaceholder: string;
  entityOrgPlaceholder: string;
  entityEmailPlaceholder: string;
  entityTypePlaceholder: string;
  entityTypes: string[];
  entitySubmit: string;
  entitySubmitOk: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaBtn: string;
  ctaBtnSecondary: string;
  ctaAgendar: string;
  seniorFormOk: string;
  entityPills: string[];
}> = {
  es: {
    heroLabel: "Formación Senior",
    heroTitle: "La experiencia no se aprende.\nLa tecnología, sí.",
    heroSubtitle: "Grupos pequeños, ritmo humano, sin argot. Desde el smartphone hasta la IA — hasta donde tú quieras llegar.",
    heroCtaMain: "Quiero apuntarme",
    heroCtaSecondary: "Soy una entidad",
    statsLabel: "El programa en números",
    stats: [
      { value: 6, suffix: "", label: "personas por grupo, máximo" },
      { value: 3, suffix: "", label: "sesiones presenciales" },
      { value: 3, suffix: " meses", label: "de seguimiento incluido" },
      { value: 100, suffix: "%", label: "gratuito, siempre" },
    ],
    quoteText: "He visto a personas de 70 años descubrir la IA y no querer parar. No porque sea fácil, sino porque alguien les explicó sin prisa y sin hacerles sentir torpes. Eso es lo que hacemos.",
    quoteAuthor: "José Luis Echezarreta · Fundador de XpertAuth",
    programsLabel: "El programa",
    programsTitle: "Cuatro módulos, un solo límite:\nel que tú pongas.",
    programsSubtitle: "No hay techo. Empiezas donde estás y llegas hasta donde quieres. Nosotros acompañamos.",
    cards: [
      {
        num: "01",
        title: "Digital con seguridad",
        subtitle: "El punto de partida · Nivel 1 → 2",
        description: "Para quien usa el móvil pero siente que podría sacarle mucho más. Sin miedo, sin prisa, con ejemplos reales.",
        topics: [
          "Móvil sin miedo: fotos, contactos, WhatsApp avanzado",
          "Banca online y administración electrónica paso a paso",
          "Detectar fraudes y correos falsos — el escudo digital",
          "Primera conversación con la IA: qué es y para qué sirve",
        ],
        badge: "Gratuito",
        ctaLabel: "Me interesa este módulo",
      },
      {
        num: "02",
        title: "IA sin miedo",
        subtitle: "El siguiente paso · Nivel 2 → 3",
        description: "Para quien ya se maneja y quiere explorar la inteligencia artificial más allá de lo que ha visto en las noticias.",
        topics: [
          "Cómo hacer buenas preguntas a la IA — el arte del prompt",
          "ChatGPT, Claude, Gemini: cuál usar y para qué",
          "IA para el día a día: cartas, búsquedas, resúmenes, traducciones",
          "Tu propio flujo: integrar la IA en lo que ya haces",
        ],
        badge: "Gratuito",
        ctaLabel: "Me interesa este módulo",
      },
      {
        num: "03",
        title: "A tu ritmo, sin techo",
        subtitle: "La filosofía del programa",
        description: "No hay nivel máximo. No hay un punto donde 'ya está'. Cada persona decide hasta dónde quiere llegar — y nosotros seguimos ahí.",
        topics: [
          "El límite lo pones tú, no el programa",
          "Seguimiento de 3 meses tras las sesiones",
          "Posibilidad de continuar con módulos avanzados",
          "Comunidad de alumnos para seguir aprendiendo juntos",
        ],
        isPhilosophy: true,
        ctaLabel: "Así quiero aprender",
      },
      {
        num: "04",
        title: "¿Eres una entidad?",
        subtitle: "Centros cívicos · Asociaciones · Bibliotecas · Colegios",
        description: "Llevamos la formación a tu espacio. Adaptamos el programa a tu comunidad — seniors, artesanos, vecinos, lo que necesites. Gratuito o simbólico, con el único requisito de asociarse a XpertAuth.",
        topics: [
          "Formación adaptada al perfil de tu comunidad",
          "Tú pones el espacio, nosotros el conocimiento",
          "Gratuito o precio simbólico — requisito: asociación a XpertAuth",
          "Biblioteca, centro cívico, asociación de artesanos... todos bienvenidos",
        ],
        isEntity: true,
        badge: "Hablemos",
        ctaLabel: "Quiero colaborar",
      },
    ],
    entitySectionLabel: "Colaboración institucional",
    entitySectionTitle: "¿Tienes una comunidad?\nNosotros tenemos la formación.",
    entitySectionBody: "Si gestionas un centro cívico, una biblioteca, una asociación o cualquier espacio donde se reúne gente que quiere aprender — escríbenos. Nos adaptamos a ti.",
    entityFormTitle: "Abre la puerta",
    entityNamePlaceholder: "Tu nombre",
    entityOrgPlaceholder: "Nombre de tu entidad",
    entityEmailPlaceholder: "Email de contacto",
    entityTypePlaceholder: "Tipo de entidad",
    entityTypes: ["Centro cívico", "Biblioteca", "Asociación de vecinos", "Asociación de artesanos", "Colegio o instituto", "Ayuntamiento", "Otra entidad"],
    entitySubmit: "Nos ponemos en contacto",
    entitySubmitOk: "¡Recibido! Te escribimos pronto.",
    ctaTitle: "El primer paso es el más fácil.",
    ctaSubtitle: "Déjanos tu nombre y teléfono. Te llamamos nosotros. Sin formularios raros, sin esperas.",
    ctaBtn: "Quiero apuntarme",
    ctaAgendar: "Agendar cita gratuita",
    ctaBtnSecondary: "Tengo una pregunta",
    seniorFormOk: "¡Perfecto! Te llamamos pronto. 📞",
    entityPills: ["🏛️ Centros cívicos", "📚 Bibliotecas", "🏘️ Asociaciones", "🎨 Artesanos", "🏫 Colegios", "🏢 Ayuntamientos"],
  },
  ca: {
    heroLabel: "Formació Sènior",
    heroTitle: "L'experiència no s'aprèn.\nLa tecnologia, sí.",
    heroSubtitle: "Grups petits, ritme humà, sense argot. Del smartphone fins a la IA — fins on tu vulguis arribar.",
    heroCtaMain: "Vull apuntar-me",
    heroCtaSecondary: "Soc una entitat",
    statsLabel: "El programa en xifres",
    stats: [
      { value: 6, suffix: "", label: "persones per grup, màxim" },
      { value: 3, suffix: "", label: "sessions presencials" },
      { value: 3, suffix: " mesos", label: "de seguiment inclòs" },
      { value: 100, suffix: "%", label: "gratuït, sempre" },
    ],
    quoteText: "He vist persones de 70 anys descobrir la IA i no voler parar. No perquè sigui fàcil, sinó perquè algú els ho va explicar sense presses i sense fer-los sentir torpes. Això és el que fem.",
    quoteAuthor: "José Luis Echezarreta · Fundador de XpertAuth",
    programsLabel: "El programa",
    programsTitle: "Quatre mòduls, un sol límit:\nel que tu posis.",
    programsSubtitle: "No hi ha sostre. Comences on ets i arribes fins on vols. Nosaltres acompanyem.",
    cards: [
      {
        num: "01",
        title: "Digital amb seguretat",
        subtitle: "El punt de partida · Nivell 1 → 2",
        description: "Per a qui fa servir el mòbil però sent que li podria treure molt més. Sense por, sense presses, amb exemples reals.",
        topics: [
          "Mòbil sense por: fotos, contactes, WhatsApp avançat",
          "Banca en línia i administració electrònica pas a pas",
          "Detectar fraus i correus falsos — l'escut digital",
          "Primera conversa amb la IA: què és i per a què serveix",
        ],
        badge: "Gratuït",
        ctaLabel: "M'interessa aquest mòdul",
      },
      {
        num: "02",
        title: "IA sense por",
        subtitle: "El següent pas · Nivell 2 → 3",
        description: "Per a qui ja se'n surt i vol explorar la intel·ligència artificial més enllà del que ha vist a les notícies.",
        topics: [
          "Com fer bones preguntes a la IA — l'art del prompt",
          "ChatGPT, Claude, Gemini: quin usar i per a què",
          "IA per al dia a dia: cartes, cerques, resums, traduccions",
          "El teu propi flux: integrar la IA en el que ja fas",
        ],
        badge: "Gratuït",
        ctaLabel: "M'interessa aquest mòdul",
      },
      {
        num: "03",
        title: "Al teu ritme, sense sostre",
        subtitle: "La filosofia del programa",
        description: "No hi ha nivell màxim. No hi ha un punt on 'ja n'hi ha prou'. Cada persona decideix fins on vol arribar — i nosaltres seguim aquí.",
        topics: [
          "El límit el poses tu, no el programa",
          "Seguiment de 3 mesos després de les sessions",
          "Possibilitat de continuar amb mòduls avançats",
          "Comunitat d'alumnes per seguir aprenent junts",
        ],
        isPhilosophy: true,
        ctaLabel: "Així vull aprendre",
      },
      {
        num: "04",
        title: "Ets una entitat?",
        subtitle: "Centres cívics · Associacions · Biblioteques · Col·legis",
        description: "Portem la formació al teu espai. Adaptem el programa a la teva comunitat — sèniors, artesans, veïns, el que necessitis. Gratuït o simbòlic, amb l'únic requisit d'associar-se a XpertAuth.",
        topics: [
          "Formació adaptada al perfil de la teva comunitat",
          "Tu poses l'espai, nosaltres el coneixement",
          "Gratuït o preu simbòlic — requisit: associació a XpertAuth",
          "Biblioteca, centre cívic, associació d'artesans... tots benvinguts",
        ],
        isEntity: true,
        badge: "Parlem",
        ctaLabel: "Vull col·laborar",
      },
    ],
    entitySectionLabel: "Col·laboració institucional",
    entitySectionTitle: "Tens una comunitat?\nNosaltres tenim la formació.",
    entitySectionBody: "Si gestiones un centre cívic, una biblioteca, una associació o qualsevol espai on es reuneix gent que vol aprendre — escriu-nos. Ens adaptem a tu.",
    entityFormTitle: "Obre la porta",
    entityNamePlaceholder: "El teu nom",
    entityOrgPlaceholder: "Nom de la teva entitat",
    entityEmailPlaceholder: "Email de contacte",
    entityTypePlaceholder: "Tipus d'entitat",
    entityTypes: ["Centre cívic", "Biblioteca", "Associació de veïns", "Associació d'artesans", "Col·legi o institut", "Ajuntament", "Una altra entitat"],
    entitySubmit: "Ens posem en contacte",
    entitySubmitOk: "Rebut! T'escrivim aviat.",
    ctaTitle: "El primer pas és el més fàcil.",
    ctaSubtitle: "Deixa'ns el teu nom i telèfon. Et truquem nosaltres. Sense formularis estranys, sense esperes.",
    ctaBtn: "Vull apuntar-me",
    ctaAgendar: "Agenda una cita gratuïta",
    ctaBtnSecondary: "Tinc una pregunta",
    seniorFormOk: "Perfecte! Et truquem aviat. 📞",
    entityPills: ["🏛️ Centres cívics", "📚 Biblioteques", "🏘️ Associacions", "🎨 Artesans", "🏫 Col·legis", "🏢 Ajuntaments"],
  },
  en: {
    heroLabel: "Senior Training",
    heroTitle: "Experience can't be taught.\nTechnology can.",
    heroSubtitle: "Small groups, human pace, no jargon. From smartphone to AI — as far as you want to go.",
    heroCtaMain: "I want to join",
    heroCtaSecondary: "I represent an organisation",
    statsLabel: "The programme in numbers",
    stats: [
      { value: 6, suffix: "", label: "people per group, maximum" },
      { value: 3, suffix: "", label: "in-person sessions" },
      { value: 3, suffix: " months", label: "follow-up included" },
      { value: 100, suffix: "%", label: "free, always" },
    ],
    quoteText: "I have seen 70-year-olds discover AI and not want to stop. Not because it's easy, but because someone explained it without rushing and without making them feel foolish. That's what we do.",
    quoteAuthor: "José Luis Echezarreta · Founder of XpertAuth",
    programsLabel: "The programme",
    programsTitle: "Four modules, one limit:\nthe one you set.",
    programsSubtitle: "No ceiling. You start where you are and go as far as you want. We walk alongside.",
    cards: [
      {
        num: "01",
        title: "Digital with confidence",
        subtitle: "The starting point · Level 1 → 2",
        description: "For those who use their phone but feel they could get much more out of it. No fear, no rush, real examples.",
        topics: [
          "Phone without fear: photos, contacts, advanced WhatsApp",
          "Online banking and e-government step by step",
          "Spotting scams and fake emails — the digital shield",
          "First conversation with AI: what it is and what it's for",
        ],
        badge: "Free",
        ctaLabel: "I'm interested in this module",
      },
      {
        num: "02",
        title: "AI without fear",
        subtitle: "The next step · Level 2 → 3",
        description: "For those who already manage well and want to explore artificial intelligence beyond what they've seen in the news.",
        topics: [
          "How to ask AI good questions — the art of prompting",
          "ChatGPT, Claude, Gemini: which to use and when",
          "AI for everyday life: letters, searches, summaries, translations",
          "Your own flow: integrating AI into what you already do",
        ],
        badge: "Free",
        ctaLabel: "I'm interested in this module",
      },
      {
        num: "03",
        title: "At your pace, no ceiling",
        subtitle: "The programme philosophy",
        description: "There is no maximum level. There is no point where 'that's enough'. Each person decides how far they want to go — and we're still there.",
        topics: [
          "You set the limit, not the programme",
          "3-month follow-up after the sessions",
          "Option to continue with advanced modules",
          "Alumni community to keep learning together",
        ],
        isPhilosophy: true,
        ctaLabel: "This is how I want to learn",
      },
      {
        num: "04",
        title: "Are you an organisation?",
        subtitle: "Civic centres · Associations · Libraries · Schools",
        description: "We bring the training to your space. We adapt the programme to your community — seniors, craftspeople, residents, whatever you need. Free or symbolic cost, with the only requirement of joining XpertAuth.",
        topics: [
          "Training adapted to your community's profile",
          "You provide the space, we provide the knowledge",
          "Free or symbolic fee — requirement: XpertAuth membership",
          "Library, civic centre, craftspeople association... all welcome",
        ],
        isEntity: true,
        badge: "Let's talk",
        ctaLabel: "I want to collaborate",
      },
    ],
    entitySectionLabel: "Institutional collaboration",
    entitySectionTitle: "You have a community.\nWe have the training.",
    entitySectionBody: "If you manage a civic centre, library, association or any space where people gather to learn — write to us. We adapt to you.",
    entityFormTitle: "Open the door",
    entityNamePlaceholder: "Your name",
    entityOrgPlaceholder: "Organisation name",
    entityEmailPlaceholder: "Contact email",
    entityTypePlaceholder: "Type of organisation",
    entityTypes: ["Civic centre", "Library", "Residents' association", "Craftspeople association", "School or college", "Local council", "Other organisation"],
    entitySubmit: "Get in touch",
    entitySubmitOk: "Received! We'll write to you soon.",
    ctaTitle: "The first step is the easiest.",
    ctaSubtitle: "Leave us your name and phone number. We call you. No strange forms, no waiting.",
    ctaBtn: "I want to join",
    ctaBtnSecondary: "I have a question",
    seniorFormOk: "Perfect! We'll call you soon. 📞",
    entityPills: ["🏛️ Civic centres", "📚 Libraries", "🏘️ Associations", "🎨 Craftspeople", "🏫 Schools", "🏢 Local councils"],
  },
  fr: {
    heroLabel: "Formation Senior",
    heroTitle: "L'expérience ne s'apprend pas.\nLa technologie, si.",
    heroSubtitle: "Petits groupes, rythme humain, sans jargon. Du smartphone à l'IA — aussi loin que vous voulez aller.",
    heroCtaMain: "Je veux m'inscrire",
    heroCtaSecondary: "Je représente une organisation",
    statsLabel: "Le programme en chiffres",
    stats: [
      { value: 6, suffix: "", label: "personnes par groupe, maximum" },
      { value: 3, suffix: "", label: "séances en présentiel" },
      { value: 3, suffix: " mois", label: "de suivi inclus" },
      { value: 100, suffix: "%", label: "gratuit, toujours" },
    ],
    quoteText: "J'ai vu des personnes de 70 ans découvrir l'IA et ne plus vouloir s'arrêter. Non pas parce que c'est facile, mais parce que quelqu'un leur a expliqué sans se presser et sans les faire sentir maladroits. C'est ce que nous faisons.",
    quoteAuthor: "José Luis Echezarreta · Fondateur de XpertAuth",
    programsLabel: "Le programme",
    programsTitle: "Quatre modules, une seule limite :\ncelle que vous fixez.",
    programsSubtitle: "Pas de plafond. Vous commencez là où vous êtes et allez aussi loin que vous voulez. Nous accompagnons.",
    cards: [
      {
        num: "01",
        title: "Numérique en confiance",
        subtitle: "Le point de départ · Niveau 1 → 2",
        description: "Pour ceux qui utilisent leur téléphone mais sentent qu'ils pourraient en tirer beaucoup plus. Sans peur, sans précipitation, avec des exemples concrets.",
        topics: [
          "Téléphone sans peur: photos, contacts, WhatsApp avancé",
          "Banque en ligne et administration électronique étape par étape",
          "Détecter les arnaques et les faux emails — le bouclier numérique",
          "Première conversation avec l'IA: ce que c'est et à quoi ça sert",
        ],
        badge: "Gratuit",
        ctaLabel: "Ce module m'intéresse",
      },
      {
        num: "02",
        title: "L'IA sans peur",
        subtitle: "L'étape suivante · Niveau 2 → 3",
        description: "Pour ceux qui s'en sortent déjà bien et veulent explorer l'intelligence artificielle au-delà de ce qu'ils ont vu aux informations.",
        topics: [
          "Comment poser de bonnes questions à l'IA — l'art du prompt",
          "ChatGPT, Claude, Gemini: lequel utiliser et pour quoi",
          "L'IA au quotidien: lettres, recherches, résumés, traductions",
          "Votre propre flux: intégrer l'IA dans ce que vous faites déjà",
        ],
        badge: "Gratuit",
        ctaLabel: "Ce module m'intéresse",
      },
      {
        num: "03",
        title: "À votre rythme, sans plafond",
        subtitle: "La philosophie du programme",
        description: "Il n'y a pas de niveau maximum. Il n'y a pas de point où 'c'est assez'. Chaque personne décide jusqu'où elle veut aller — et nous sommes toujours là.",
        topics: [
          "C'est vous qui fixez la limite, pas le programme",
          "Suivi de 3 mois après les séances",
          "Possibilité de continuer avec des modules avancés",
          "Communauté d'anciens élèves pour continuer à apprendre ensemble",
        ],
        isPhilosophy: true,
        ctaLabel: "C'est ainsi que je veux apprendre",
      },
      {
        num: "04",
        title: "Vous êtes une organisation?",
        subtitle: "Centres civiques · Associations · Bibliothèques · Écoles",
        description: "Nous apportons la formation dans votre espace. Nous adaptons le programme à votre communauté — seniors, artisans, riverains, selon vos besoins. Gratuit ou symbolique, avec le seul prérequis d'adhérer à XpertAuth.",
        topics: [
          "Formation adaptée au profil de votre communauté",
          "Vous fournissez l'espace, nous fournissons le savoir",
          "Gratuit ou tarif symbolique — prérequis: adhésion à XpertAuth",
          "Bibliothèque, centre civique, association d'artisans... tous bienvenus",
        ],
        isEntity: true,
        badge: "Parlons",
        ctaLabel: "Je veux collaborer",
      },
    ],
    entitySectionLabel: "Collaboration institutionnelle",
    entitySectionTitle: "Vous avez une communauté.\nNous avons la formation.",
    entitySectionBody: "Si vous gérez un centre civique, une bibliothèque, une association ou tout espace où des personnes se réunissent pour apprendre — écrivez-nous. Nous nous adaptons à vous.",
    entityFormTitle: "Ouvrez la porte",
    entityNamePlaceholder: "Votre nom",
    entityOrgPlaceholder: "Nom de votre organisation",
    entityEmailPlaceholder: "Email de contact",
    entityTypePlaceholder: "Type d'organisation",
    entityTypes: ["Centre civique", "Bibliothèque", "Association de riverains", "Association d'artisans", "École ou lycée", "Mairie", "Autre organisation"],
    entitySubmit: "Nous prenons contact",
    entitySubmitOk: "Reçu ! Nous vous écrirons bientôt.",
    ctaTitle: "Le premier pas est le plus facile.",
    ctaSubtitle: "Laissez-nous votre nom et téléphone. Nous vous appelons. Pas de formulaires compliqués, pas d'attente.",
    ctaBtn: "Je veux m'inscrire",
    ctaAgendar: "Réserver un appel gratuit",
    ctaBtnSecondary: "J'ai une question",
    seniorFormOk: "Parfait ! Nous vous appelons bientôt. 📞",
    entityPills: ["🏛️ Centres civiques", "📚 Bibliothèques", "🏘️ Associations", "🎨 Artisans", "🏫 Écoles", "🏢 Mairies"],
  },
};

// ─── Entity form ──────────────────────────────────────────────────────────────
function EntityForm({ t }: { t: typeof texts["es"] }) {
  const [form, setForm] = useState({ name: "", org: "", email: "", type: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.org || !form.email) return;
    setLoading(true);
    // POST to Supabase tabla "contacto" via server route
    try {
      await fetch("/api/contacto-entidad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.name,
          empresa: form.org,
          email: form.email,
          tipo: form.type || "entidad_formacion_senior",
          mensaje: `Solicitud colaboración formación. Entidad: ${form.org}. Tipo: ${form.type || "no especificado"}`,
        }),
      });
      setSent(true);
    } catch {
      setSent(true); // Show success anyway — fail silently
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, color: "#fff",
    fontSize: 14, outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  if (sent) {
    return (
      <div style={{
        textAlign: "center", padding: "40px 20px",
        background: "rgba(232,98,10,0.08)",
        border: "1px solid rgba(232,98,10,0.25)",
        borderRadius: 16,
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🤝</div>
        <p style={{ color: "#E8620A", fontWeight: 700, fontSize: 18, margin: "0 0 8px" }}>
          {t.entitySubmitOk}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        style={inputStyle}
        placeholder={t.entityNamePlaceholder}
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        onFocus={e => e.target.style.borderColor = "rgba(232,98,10,0.5)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
      <input
        style={inputStyle}
        placeholder={t.entityOrgPlaceholder}
        value={form.org}
        onChange={e => setForm({ ...form, org: e.target.value })}
        onFocus={e => e.target.style.borderColor = "rgba(232,98,10,0.5)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
      <input
        style={inputStyle}
        type="email"
        placeholder={t.entityEmailPlaceholder}
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
        onFocus={e => e.target.style.borderColor = "rgba(232,98,10,0.5)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
      />
      <select
        style={{ ...inputStyle, cursor: "pointer" }}
        value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value })}
      >
        <option value="" style={{ background: "#0A0E1A" }}>{t.entityTypePlaceholder}</option>
        {t.entityTypes.map((type, i) => (
          <option key={i} value={type} style={{ background: "#0A0E1A" }}>{type}</option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "13px 24px",
          background: "#E8620A",
          border: "none", borderRadius: 10,
          color: "#fff", fontWeight: 700, fontSize: 15,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          transition: "opacity 0.2s, transform 0.2s",
          marginTop: 4,
        }}
        onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        {loading ? "..." : t.entitySubmit} →
      </button>
    </div>
  );
}

// ─── Senior signup form ───────────────────────────────────────────────────────
function SeniorForm({ t }: { t: typeof texts["es"] }) {
  const [form, setForm] = useState({ name: "", phone: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.phone) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads-senior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.name, telefono: form.phone }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || `Error ${res.status}`);
      } else {
        setSent(true);
      }
    } catch (e) {
      setError("Error de conexión. Inténtalo de nuevo.");
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: "14px 18px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#fff",
    fontSize: 15, outline: "none",
    transition: "border-color 0.2s",
    minWidth: 0,
  };

  if (sent) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p style={{ color: "#E8620A", fontWeight: 700, fontSize: 18 }}>
          {t.seniorFormOk}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      <input
        style={inputStyle}
        placeholder={t.entityNamePlaceholder}
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
        onFocus={e => e.target.style.borderColor = "rgba(232,98,10,0.5)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
      />
      <input
        style={inputStyle}
        placeholder="Teléfono"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
        onFocus={e => e.target.style.borderColor = "rgba(232,98,10,0.5)"}
        onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: "14px 28px",
          background: "#E8620A",
          border: "none", borderRadius: 10,
          color: "#fff", fontWeight: 700, fontSize: 15,
          cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.7 : 1,
          whiteSpace: "nowrap",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
      >
        {loading ? "..." : t.ctaBtn} →
      </button>
      {error && (
        <p style={{ color: "#f87171", fontSize: 13, margin: 0, width: "100%", textAlign: "center" }}>
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FormacionSenior() {
  const [location] = useLocation();
  const locale = location.split("/")[1] || "es";
  const t = texts[locale] || texts.es;
  const [contactOpen, setContactOpen] = useState(false);
  const entityRef = useRef<HTMLDivElement>(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const scrollToEntity = () => {
    entityRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // Split hero title at \n
  const heroLines = t.heroTitle.split("\n");

  return (
    <div className="min-h-screen" style={{ background: "#0A0E1A" }}>
      <style>{`
        @keyframes snGrad {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes emberPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }
      `}</style>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight: "90vh", display: "flex", alignItems: "center",
        padding: "120px 24px 80px", position: "relative", overflow: "hidden",
      }}>
        {/* Ember radial glow background */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,98,10,0.12) 0%, transparent 70%)",
        }} />
        {/* Floating ember orb */}
        <div style={{
          position: "absolute", top: "15%", right: "8%",
          width: 320, height: 320, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,98,10,0.08) 0%, transparent 70%)",
          animation: "floatY 6s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "5%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,98,10,0.05) 0%, transparent 70%)",
          animation: "floatY 8s ease-in-out 2s infinite",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <RevealDiv>
            <span style={{
              display: "inline-block",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
              color: "#E8620A", marginBottom: 24,
              padding: "6px 16px", borderRadius: 20,
              background: "rgba(232,98,10,0.1)",
              border: "1px solid rgba(232,98,10,0.25)",
            }}>
              {t.heroLabel.toUpperCase()}
            </span>
          </RevealDiv>

          <RevealDiv delay={80}>
            <h1 style={{
              fontSize: "clamp(40px, 7vw, 80px)",
              fontWeight: 800, lineHeight: 1.1,
              margin: "0 0 28px", letterSpacing: "-0.02em",
            }}>
              {heroLines.map((line, i) => (
                <span key={i} style={{ display: "block" }}>
                  <span style={emberGradientStyle}>{line}</span>
                </span>
              ))}
            </h1>
          </RevealDiv>

          <RevealDiv delay={160}>
            <p style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "clamp(16px, 2.5vw, 20px)",
              lineHeight: 1.7, maxWidth: 600, margin: "0 auto 40px",
            }}>
              {t.heroSubtitle}
            </p>
          </RevealDiv>

          <RevealDiv delay={220}>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => document.getElementById("senior-form")?.scrollIntoView({ behavior: "smooth", block: "center" })}
                style={{
                  padding: "14px 32px",
                  background: "#E8620A",
                  border: "none", borderRadius: 12,
                  color: "#fff", fontWeight: 700, fontSize: 16,
                  cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s",
                  boxShadow: "0 4px 24px rgba(232,98,10,0.35)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(232,98,10,0.5)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 24px rgba(232,98,10,0.35)";
                }}
              >
                {t.heroCtaMain} →
              </button>
              <button
                onClick={scrollToEntity}
                style={{
                  padding: "14px 32px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 12, color: "rgba(255,255,255,0.8)",
                  fontWeight: 600, fontSize: 16,
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,98,10,0.4)";
                  (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)";
                }}
              >
                {t.heroCtaSecondary}
              </button>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{
        padding: "60px 24px",
        borderTop: "1px solid rgba(232,98,10,0.12)",
        borderBottom: "1px solid rgba(232,98,10,0.12)",
        background: "rgba(232,98,10,0.03)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <RevealDiv>
            <p style={{
              textAlign: "center", color: "rgba(232,98,10,0.7)",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              marginBottom: 40,
            }}>
              {t.statsLabel.toUpperCase()}
            </p>
          </RevealDiv>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 32,
          }}>
            {t.stats.map((stat, i) => (
              <RevealDiv key={i} delay={i * 80}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: "clamp(44px, 6vw, 64px)",
                    fontWeight: 800, lineHeight: 1,
                    color: "#E8620A", marginBottom: 8,
                    fontFamily: "JetBrains Mono, monospace",
                  }}>
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 13, lineHeight: 1.4, margin: 0,
                  }}>
                    {stat.label}
                  </p>
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE — José Luis ── */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <RevealDiv>
            <div style={{
              position: "relative",
              padding: "48px 48px 48px 64px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(232,98,10,0.2)",
              borderLeft: "4px solid #E8620A",
              borderRadius: "0 16px 16px 0",
            }}>
              {/* Quote mark */}
              <div style={{
                position: "absolute", top: 24, left: 20,
                fontSize: 80, lineHeight: 1, color: "#E8620A",
                opacity: 0.3, fontFamily: "Georgia, serif",
                userSelect: "none",
              }}>
                "
              </div>
              <p style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: "clamp(16px, 2.2vw, 20px)",
                lineHeight: 1.75, margin: "0 0 24px",
                fontStyle: "italic",
              }}>
                {t.quoteText}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <img
                  src="https://supabase.xpertauth.com/storage/v1/object/public/web-images/equipo/jose-luis_foto_v1.webp"
                  alt="José Luis"
                  style={{
                    width: 44, height: 44, borderRadius: "50%",
                    border: "2px solid rgba(232,98,10,0.4)",
                    objectFit: "cover",
                  }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <p style={{
                  color: "#E8620A", fontSize: 13, fontWeight: 600,
                  margin: 0, lineHeight: 1.4,
                }}>
                  {t.quoteAuthor}
                </p>
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* ── PROGRAM CARDS ── */}
      <section style={{
        padding: "80px 24px",
        background: "#0F1628",
        borderTop: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <RevealDiv>
              <span style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
                color: "#E8620A", display: "block", marginBottom: 16,
              }}>
                {t.programsLabel.toUpperCase()}
              </span>
            </RevealDiv>
            <RevealDiv delay={60}>
              <h2 style={{
                fontSize: "clamp(28px, 4.5vw, 48px)",
                fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px",
                letterSpacing: "-0.02em",
              }}>
                {t.programsTitle.split("\n").map((line, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {i === 0
                      ? <span style={{ color: "#fff" }}>{line}</span>
                      : <span style={emberGradientStyle}>{line}</span>
                    }
                  </span>
                ))}
              </h2>
            </RevealDiv>
            <RevealDiv delay={120}>
              <p style={{
                color: "rgba(255,255,255,0.5)", fontSize: 16,
                maxWidth: 520, margin: "0 auto",
              }}>
                {t.programsSubtitle}
              </p>
            </RevealDiv>
          </div>

          {/* 2x2 grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
            gap: 20,
            alignItems: "stretch",
          }}>
            {t.cards.map((card, i) => (
              <RevealDiv key={i} delay={i * 90} className="flex">
                <div style={{ width: "100%" }}>
                  <ProgramCard
                    {...card}
                    onCta={() => {
                      if (card.isEntity) { scrollToEntity(); }
                      else { document.getElementById("senior-form")?.scrollIntoView({ behavior: "smooth", block: "center" }); }
                    }}
                  />
                </div>
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      {/* ── ENTITY SECTION ── */}
      <section
        ref={entityRef}
        style={{
          padding: "80px 24px",
          borderTop: "1px solid rgba(77,159,236,0.1)",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
            gap: 60, alignItems: "center",
          }}>
            {/* Left — text */}
            <div>
              <RevealDiv>
                <span style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
                  color: "#4D9FEC", display: "block", marginBottom: 16,
                }}>
                  {t.entitySectionLabel.toUpperCase()}
                </span>
              </RevealDiv>
              <RevealDiv delay={60}>
                <h2 style={{
                  fontSize: "clamp(26px, 4vw, 42px)",
                  fontWeight: 800, lineHeight: 1.2,
                  margin: "0 0 20px", color: "#fff",
                  letterSpacing: "-0.02em",
                }}>
                  {t.entitySectionTitle.split("\n").map((line, i) => (
                    <span key={i} style={{ display: "block" }}>
                      {i === 0 ? line : <span style={emberGradientStyle}>{line}</span>}
                    </span>
                  ))}
                </h2>
              </RevealDiv>
              <RevealDiv delay={120}>
                <p style={{
                  color: "rgba(255,255,255,0.55)", fontSize: 16,
                  lineHeight: 1.7, margin: 0,
                }}>
                  {t.entitySectionBody}
                </p>
              </RevealDiv>

              {/* Entity types pills */}
              <RevealDiv delay={180}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
                  {t.entityPills.map((label, i) => (
                    <span key={i} style={{
                      fontSize: 12, fontWeight: 500,
                      padding: "5px 12px", borderRadius: 20,
                      background: "rgba(77,159,236,0.08)",
                      border: "1px solid rgba(77,159,236,0.2)",
                      color: "rgba(255,255,255,0.6)",
                    }}>
                      {label}
                    </span>
                  ))}
                </div>
              </RevealDiv>
            </div>

            {/* Right — form */}
            <RevealDiv delay={100}>
              <div style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(77,159,236,0.15)",
                borderRadius: 20, padding: "36px",
              }}>
                <h3 style={{
                  color: "#fff", fontWeight: 700, fontSize: 20,
                  margin: "0 0 24px",
                }}>
                  {t.entityFormTitle}
                </h3>
                <EntityForm t={t} />
              </div>
            </RevealDiv>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL — senior signup ── */}
      <section
        id="senior-form"
        style={{
          padding: "80px 24px",
          background: "#070A12",
          borderTop: "1px solid rgba(232,98,10,0.1)",
        }}
      >
        <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <RevealDiv>
            <h2 style={{
              fontSize: "clamp(28px, 4.5vw, 48px)",
              fontWeight: 800, margin: "0 0 16px",
              letterSpacing: "-0.02em",
            }}>
              <span style={emberGradientStyle}>{t.ctaTitle}</span>
            </h2>
          </RevealDiv>
          <RevealDiv delay={60}>
            <p style={{
              color: "rgba(255,255,255,0.55)", fontSize: 17,
              lineHeight: 1.7, margin: "0 0 40px",
            }}>
              {t.ctaSubtitle}
            </p>
          </RevealDiv>
          <RevealDiv delay={120}>
            <SeniorForm t={t} />
          </RevealDiv>
          <RevealDiv delay={180}>
            <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <button
                onClick={() => setContactOpen(true)}
                style={{
                  padding: "0", background: "none", border: "none",
                  color: "rgba(255,255,255,0.4)", fontSize: 14,
                  cursor: "pointer", textDecoration: "underline",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"}
              >
                {t.ctaBtnSecondary}
              </button>
              <a
                href="https://calendar.app.google/q54rranYyoyCfcu77"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-7 py-3 border border-[#E8620A]/40 text-[#E8620A] font-semibold rounded-lg transition-all duration-200 hover:bg-[#E8620A]/10 hover:border-[#E8620A]/60"
              >
                <Calendar className="w-4 h-4" />
                Reserva tu cita
              </a>
            </div>
          </RevealDiv>
        </div>
      </section>

      <Footer />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
