import { useState } from "react";
import { useI18n } from "../i18n/context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactModal from "@/components/ContactModal";

// ─── TRADUCCIONES ─────────────────────────────────────────────────────────────

const translations = {
  es: {
    hero: {
      titulo: "Conocimiento real.\nConstruido desde dentro.",
      subtitulo:
        "XpertAuth nació de 30 años en el sector del transporte especial y de una pregunta sencilla: ¿por qué el conocimiento experto sigue siendo inaccesible para quien más lo necesita?",
    },
    historia: {
      etiqueta: "Nuestra historia",
      parrafos: [
        "Llevo más de 30 años trabajando en el mundo del transporte especial por carretera, la mayor parte de ellos en Catalunya. He gestionado permisos, planificado rutas excepcionales y resuelto problemas que la normativa no siempre tiene claros. Lo aprendí todo sobre el terreno.",
        "Cuando llegó el momento de cerrar esa etapa, mi mente inquieta no supo quedarse quieta. Empecé a formarme en inteligencia artificial. Primero por curiosidad. Después con convicción.",
        "Fue entonces cuando lo vi claro. Las herramientas de IA que estaba estudiando podían transformar algo que siempre había sido un problema en el sector: el acceso al conocimiento normativo. Buscar entre cientos de páginas de reglamentos no es lo mismo que hablar con alguien que los conoce a fondo y te responde al instante. Eso era lo que la IA podía hacer. Y yo podía construirlo.",
        "Eso sí, con una condición innegociable: la IA siempre supervisada por personas. La inteligencia artificial es una herramienta extraordinaria, pero la experiencia humana —y el sentido común en la toma de decisiones— es y será siempre necesaria. En XpertAuth, los agentes no trabajan solos. Trabajan conmigo.",
        "Con el tiempo, ese mismo enfoque —experiencia real más IA bien supervisada— fue tomando forma en otro terreno: la alfabetización digital de las personas mayores, un proyecto hermano que nace de la misma convicción, aunque camina por su cuenta.",
        "XpertAuth es hoy un proyecto personal, en fase de aprendizaje y validación. No hay prisa por llegar a ningún sitio concreto — hay interés real por hacer las cosas bien.",
      ],
      firma: "José Luis Echezarreta — Fundador de XpertAuth",
      fotoAlt: "José Luis Echezarreta — Fundador de XpertAuth (placeholder)",
    },
    mision: {
      etiqueta: "Misión",
      titulo: "Por qué existimos",
      texto:
        "XpertAuth combina experiencia real del sector con inteligencia artificial para hacer accesible el conocimiento experto en transporte especial: orientación normativa clara, con las fuentes a la vista, y herramientas de IA pensadas para quien vive el sector cada día. Siempre con tecnología al servicio de las personas, nunca al revés.",
    },
    valores: {
      etiqueta: "Valores",
      titulo: "Lo que nos define",
      hint: "Haz clic en una tarjeta para leerla",
      items: [
        {
          num: "01",
          titulo: "Transparencia radical",
          texto: "Usamos inteligencia artificial y lo decimos abiertamente. Sabemos lo que la IA puede hacer y lo que no puede hacer. Y cuando no sabemos algo, también lo decimos.",
        },
        {
          num: "02",
          titulo: "La IA como herramienta, el humano como criterio",
          texto: "Los agentes de XpertAuth no trabajan solos. Cada respuesta está respaldada por experiencia real. La tecnología amplifica el conocimiento humano; no lo sustituye.",
        },
        {
          num: "03",
          titulo: "Empatía tecnológica",
          texto: "No todo el mundo llegó a la tecnología al mismo tiempo ni de la misma manera. En XpertAuth no juzgamos desde dónde empieza cada persona. Empezamos desde ahí.",
        },
        {
          num: "04",
          titulo: "Sin prisa, sin humo",
          texto: "Este es un proyecto que avanza a su ritmo, sin presión de plazos ni de resultado comercial. Preferimos hacer las cosas bien que hacerlas rápido.",
        },
      ],
    },
    cta: {
      titulo: "¿Quieres saber más?",
      subtitulo:
        "XpertAuth está en fase de aprendizaje y construcción, pero el rumbo está claro. Conoce el proyecto o escríbenos si tienes alguna pregunta.",
      boton1: "Conoce el proyecto",
      boton2: "Contacta con nosotros",
    },
  },

  ca: {
    hero: {
      titulo: "Coneixement real.\nConstruït des de dins.",
      subtitulo:
        "XpertAuth va néixer de 30 anys al sector del transport especial i d'una pregunta senzilla: per què el coneixement expert continua sent inaccessible per a qui més el necessita?",
    },
    historia: {
      etiqueta: "La nostra història",
      parrafos: [
        "Porto més de 30 anys treballant en el món del transport especial per carretera, la major part d'ells a Catalunya. He gestionat permisos, planificat rutes excepcionals i resolt problemes que la normativa no sempre té clars. Ho vaig aprendre tot sobre el terreny.",
        "Quan va arribar el moment de tancar aquella etapa, la meva ment inquieta no va saber quedar-se quieta. Vaig començar a formar-me en intel·ligència artificial. Primer per curiositat. Després amb convicció.",
        "Va ser llavors quan ho vaig veure clar. Les eines d'IA que estava estudiant podien transformar quelcom que sempre havia estat un problema al sector: l'accés al coneixement normatiu. Cercar entre centenars de pàgines de reglaments no és el mateix que parlar amb algú que els coneix a fons i et respon al moment. Això era el que la IA podia fer. I jo podia construir-ho.",
        "Això sí, amb una condició innegociable: la IA sempre supervisada per persones. La intel·ligència artificial és una eina extraordinària, però l'experiència humana —i el sentit comú en la presa de decisions— és i serà sempre necessària. A XpertAuth, els agents no treballen sols. Treballen amb mi.",
        "Amb el temps, aquest mateix enfocament —experiència real més IA ben supervisada— va anar prenent forma en un altre terreny: l'alfabetització digital de les persones grans, un projecte germà que neix de la mateixa convicció, tot i que camina pel seu compte.",
        "XpertAuth és avui un projecte personal, en fase d'aprenentatge i validació. No hi ha pressa per arribar a cap lloc concret — hi ha interès real per fer les coses bé.",
      ],
      firma: "José Luis Echezarreta — Fundador de XpertAuth",
      fotoAlt: "José Luis Echezarreta — Fundador de XpertAuth (placeholder)",
    },
    mision: {
      etiqueta: "Missió",
      titulo: "Per què existim",
      texto:
        "XpertAuth combina experiència real del sector amb intel·ligència artificial per fer accessible el coneixement expert en transport especial: orientació normativa clara, amb les fonts a la vista, i eines d'IA pensades per a qui viu el sector cada dia. Sempre amb tecnologia al servei de les persones, mai al revés.",
    },
    valores: {
      etiqueta: "Valors",
      titulo: "El que ens defineix",
      hint: "Fes clic en una targeta per llegir-la",
      items: [
        {
          num: "01",
          titulo: "Transparència radical",
          texto: "Usem intel·ligència artificial i ho diem obertament. Sabem el que la IA pot fer i el que no pot fer. I quan no sabem alguna cosa, també ho diem.",
        },
        {
          num: "02",
          titulo: "La IA com a eina, l'humà com a criteri",
          texto: "Els agents de XpertAuth no treballen sols. Cada resposta està avalada per experiència real. La tecnologia amplifica el coneixement humà; no el substitueix.",
        },
        {
          num: "03",
          titulo: "Empatia tecnològica",
          texto: "No tothom va arribar a la tecnologia al mateix temps ni de la mateixa manera. A XpertAuth no jutgem des d'on comença cada persona. Comencem des d'allà.",
        },
        {
          num: "04",
          titulo: "Sense pressa, sense fum",
          texto: "Aquest és un projecte que avança al seu ritme, sense pressió de terminis ni de resultat comercial. Preferim fer les coses bé que fer-les de pressa.",
        },
      ],
    },
    cta: {
      titulo: "Vols saber-ne més?",
      subtitulo:
        "XpertAuth està en fase d'aprenentatge i construcció, però el rumb és clar. Coneix el projecte o escriu-nos si tens alguna pregunta.",
      boton1: "Coneix el projecte",
      boton2: "Contacta amb nosaltres",
    },
  },

  en: {
    hero: {
      titulo: "Real knowledge.\nBuilt from the inside.",
      subtitulo:
        "XpertAuth was born from 30 years in the special transport sector and a simple question: why is expert knowledge still out of reach for those who need it most?",
    },
    historia: {
      etiqueta: "Our story",
      parrafos: [
        "I've spent over 30 years working in special road transport, most of them in Catalonia. I've managed permits, planned exceptional routes and solved problems that regulations don't always make clear. I learned everything on the ground.",
        "When the time came to close that chapter, my restless mind couldn't stay still. I started training in artificial intelligence. First out of curiosity. Then out of conviction.",
        "That's when it became clear. The AI tools I was studying could transform something that had always been a problem in the sector: access to regulatory knowledge. Searching through hundreds of pages of regulations is not the same as talking to someone who knows them inside out and answers you instantly. That's what AI could do. And I could build it.",
        "But with one non-negotiable condition: AI always supervised by humans. Artificial intelligence is an extraordinary tool, but human experience —and common sense in decision-making— is and will always be necessary. At XpertAuth, agents don't work alone. They work with me.",
        "Over time, that same approach —real experience plus well-supervised AI— started taking shape in another area: digital literacy for older people, a sister project born from the same conviction, though it walks its own path.",
        "XpertAuth today is a personal project, in a learning and validation phase. There's no rush to get anywhere in particular — there's a real interest in doing things well.",
      ],
      firma: "José Luis Echezarreta — Founder of XpertAuth",
      fotoAlt: "José Luis Echezarreta — Founder of XpertAuth (placeholder)",
    },
    mision: {
      etiqueta: "Mission",
      titulo: "Why we exist",
      texto:
        "XpertAuth combines real sector experience with artificial intelligence to make expert knowledge in special transport accessible: clear regulatory guidance, with the sources in plain view, and AI tools built for the people who live the sector every day. Always with technology serving people, never the other way around.",
    },
    valores: {
      etiqueta: "Values",
      titulo: "What defines us",
      hint: "Click a card to read it",
      items: [
        {
          num: "01",
          titulo: "Radical transparency",
          texto: "We use artificial intelligence and we say so openly. We know what AI can do and what it can't. And when we don't know something, we say that too.",
        },
        {
          num: "02",
          titulo: "AI as a tool, humans as the judge",
          texto: "XpertAuth's agents don't work alone. Every answer is backed by real experience. Technology amplifies human knowledge; it doesn't replace it.",
        },
        {
          num: "03",
          titulo: "Technological empathy",
          texto: "Not everyone arrived at technology at the same time or in the same way. At XpertAuth we don't judge where each person starts from. We start from there.",
        },
        {
          num: "04",
          titulo: "No rush, no hype",
          texto: "This is a project that moves at its own pace, with no pressure of deadlines or commercial results. We'd rather do things well than do them fast.",
        },
      ],
    },
    cta: {
      titulo: "Want to know more?",
      subtitulo:
        "XpertAuth is in a learning and building phase, but the direction is clear. Get to know the project or write to us if you have any questions.",
      boton1: "About the project",
      boton2: "Contact us",
    },
  },

  fr: {
    hero: {
      titulo: "Un savoir réel.\nConstruit de l'intérieur.",
      subtitulo:
        "XpertAuth est né de 30 ans dans le secteur du transport spécial et d'une question simple : pourquoi l'expertise reste-t-elle inaccessible à ceux qui en ont le plus besoin ?",
    },
    historia: {
      etiqueta: "Notre histoire",
      parrafos: [
        "Je travaille depuis plus de 30 ans dans le transport spécial routier, la plupart du temps en Catalogne. J'ai géré des permis, planifié des itinéraires exceptionnels et résolu des problèmes que la réglementation ne clarifie pas toujours. J'ai tout appris sur le terrain.",
        "Quand est venu le moment de clore ce chapitre, mon esprit curieux n'a pas su rester tranquille. J'ai commencé à me former à l'intelligence artificielle. D'abord par curiosité. Puis par conviction.",
        "C'est là que tout est devenu clair. Les outils d'IA que j'étudiais pouvaient transformer quelque chose qui avait toujours été un problème dans le secteur : l'accès à la connaissance réglementaire. Chercher dans des centaines de pages de règlements n'est pas la même chose que parler à quelqu'un qui les connaît parfaitement et vous répond instantanément. C'est ce que l'IA pouvait faire. Et je pouvais le construire.",
        "Mais avec une condition non négociable : l'IA toujours supervisée par des humains. L'intelligence artificielle est un outil extraordinaire, mais l'expérience humaine —et le bon sens dans la prise de décision— est et sera toujours nécessaire. Chez XpertAuth, les agents ne travaillent pas seuls. Ils travaillent avec moi.",
        "Avec le temps, cette même approche —expérience réelle et IA bien supervisée— a pris forme sur un autre terrain : l'alphabétisation numérique des personnes âgées, un projet frère né de la même conviction, même s'il suit son propre chemin.",
        "XpertAuth est aujourd'hui un projet personnel, en phase d'apprentissage et de validation. Il n'y a pas d'urgence à arriver quelque part en particulier — il y a un intérêt réel à bien faire les choses.",
      ],
      firma: "José Luis Echezarreta — Fondateur de XpertAuth",
      fotoAlt: "José Luis Echezarreta — Fondateur de XpertAuth (placeholder)",
    },
    mision: {
      etiqueta: "Mission",
      titulo: "Pourquoi nous existons",
      texto:
        "XpertAuth combine une expérience réelle du secteur et l'intelligence artificielle pour rendre accessible le savoir expert du transport spécial : une orientation réglementaire claire, avec les sources en évidence, et des outils d'IA pensés pour ceux qui vivent le secteur au quotidien. Toujours avec la technologie au service des personnes, jamais l'inverse.",
    },
    valores: {
      etiqueta: "Valeurs",
      titulo: "Ce qui nous définit",
      hint: "Cliquez sur une carte pour la lire",
      items: [
        {
          num: "01",
          titulo: "Transparence radicale",
          texto: "Nous utilisons l'intelligence artificielle et nous le disons ouvertement. Nous savons ce que l'IA peut faire et ce qu'elle ne peut pas faire. Et quand nous ne savons pas quelque chose, nous le disons aussi.",
        },
        {
          num: "02",
          titulo: "L'IA comme outil, l'humain comme critère",
          texto: "Les agents de XpertAuth ne travaillent pas seuls. Chaque réponse est soutenue par une expérience réelle. La technologie amplifie la connaissance humaine ; elle ne la remplace pas.",
        },
        {
          num: "03",
          titulo: "Empathie technologique",
          texto: "Tout le monde n'est pas arrivé à la technologie au même moment ni de la même façon. Chez XpertAuth, nous ne jugeons pas le point de départ de chaque personne. Nous partons de là.",
        },
        {
          num: "04",
          titulo: "Sans précipitation, sans esbroufe",
          texto: "C'est un projet qui avance à son rythme, sans pression de délais ni de résultat commercial. Nous préférons bien faire les choses plutôt que de les faire vite.",
        },
      ],
    },
    cta: {
      titulo: "Vous voulez en savoir plus ?",
      subtitulo:
        "XpertAuth est en phase d'apprentissage et de construction, mais la direction est claire. Découvrez le projet ou écrivez-nous si vous avez des questions.",
      boton1: "Découvrir le projet",
      boton2: "Nous contacter",
    },
  },
};

// ─── PLACEHOLDER foto ─────────────────────────────────────────────────────────
const FOTO_URL =
  "https://supabase.xpertauth.com/storage/v1/object/public/web-images/equipo/jose-luis_foto_v1.webp";

// ─── COLORES TARJETAS POR SLOT ────────────────────────────────────────────────
const SLOT_BG = [
  "rgba(30,58,138,0.55)",
  "rgba(22,40,100,0.50)",
  "rgba(18,28,72,0.50)",
  "rgba(14,20,52,0.48)",
];
const SLOT_BORDER = [
  "rgba(77,159,236,0.55)",
  "rgba(77,159,236,0.25)",
  "rgba(77,159,236,0.12)",
  "rgba(77,159,236,0.06)",
];
const SLOT_SHADOW = [
  "0 12px 48px rgba(27,79,216,0.45), 0 0 0 1px rgba(77,159,236,0.2)",
  "0 6px 24px rgba(0,0,0,0.4)",
  "0 4px 16px rgba(0,0,0,0.35)",
  "0 2px 8px rgba(0,0,0,0.3)",
];

// ─── DISPLAY CARDS ────────────────────────────────────────────────────────────

interface ValorItem { num: string; titulo: string; texto: string; }

function ValoresStack({ items, hint }: { items: ValorItem[]; hint: string }) {
  const [order, setOrder] = useState([0, 1, 2, 3]);

  function traerAlFrente(idx: number) {
    setOrder((prev) => [idx, ...prev.filter((i) => i !== idx)]);
  }

  const CARD_W = 448;
  const CARD_H = 210;
  const OFFSET_X = 32;
  const OFFSET_Y = 22;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
      <div style={{ position: "relative", width: CARD_W + OFFSET_X * 3 + 16, height: CARD_H + OFFSET_Y * 3 + 16 }}>
        {[...order].reverse().map((itemIdx) => {
          const slot = order.indexOf(itemIdx);
          const isFrente = slot === 0;
          const item = items[itemIdx];

          return (
            <div
              key={itemIdx}
              onClick={() => !isFrente && traerAlFrente(itemIdx)}
              style={{
                position: "absolute",
                left: (3 - slot) * OFFSET_X,
                top: (3 - slot) * OFFSET_Y,
                width: CARD_W,
                height: CARD_H,
                zIndex: slot + 1,
                cursor: isFrente ? "default" : "pointer",
                transform: "skewY(-5deg)",
                transition: "left 0.45s cubic-bezier(0.34,1.4,0.64,1), top 0.45s cubic-bezier(0.34,1.4,0.64,1), box-shadow 0.3s, background 0.3s",
                borderRadius: "1rem",
                border: `1px solid ${SLOT_BORDER[slot]}`,
                background: SLOT_BG[slot],
                boxShadow: SLOT_SHADOW[slot],
                backdropFilter: "blur(10px)",
                padding: "1.5rem 1.75rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                filter: slot === 0 ? "none" : `brightness(${1 - slot * 0.12})`,
              }}
            >
              <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.18em", color: "#4D9FEC", textTransform: "uppercase" as const }}>
                {item.num}
              </span>
              <p style={{ fontSize: "1rem", fontWeight: 700, color: "#ffffff", lineHeight: 1.4 }}>
                {item.titulo}
              </p>
              <p style={{ fontSize: "0.85rem", color: "#ffffff", lineHeight: 1.7 }}>
                {item.texto}
              </p>
            </div>
          );
        })}
      </div>

      {/* Indicadores */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => traerAlFrente(idx)}
            style={{
              width: order[0] === idx ? "2.25rem" : "0.5rem",
              height: "0.5rem",
              borderRadius: "9999px",
              background: order[0] === idx ? "#1B4FD8" : "rgba(255,255,255,0.25)",
              border: "none",
              cursor: "pointer",
              transition: "width 0.35s ease, background 0.35s ease",
              padding: 0,
            }}
          />
        ))}
      </div>

      <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em", marginTop: "0.1rem" }}>
        {hint}
      </p>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

export default function SobreNosotros() {
  const { locale } = useI18n();
  const lang = locale as keyof typeof translations;
  const t = translations[lang] ?? translations.es;

  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main style={{ fontFamily: "'Sora','Inter',sans-serif" }}>

        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section style={{ background: "#0A0E1A", minHeight: "55vh", display: "flex", alignItems: "center", padding: "140px 24px 80px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
            <h1
              style={{
                background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "snGrad 6s ease infinite",
                fontSize: "clamp(2rem,5vw,3.4rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "1.5rem",
                whiteSpace: "pre-line",
              }}
            >
              {t.hero.titulo}
            </h1>
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: "clamp(.95rem,2vw,1.15rem)", lineHeight: 1.8, maxWidth: 620, margin: "0 auto" }}>
              {t.hero.subtitulo}
            </p>
          </div>
        </section>

        {/* ══ HISTORIA ══════════════════════════════════════════════════ */}
        <section style={{ background: "#0A0E1A", padding: "80px 24px" }}>
          <div
            style={{
              maxWidth: 1100,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr",
              gap: "4rem",
              alignItems: "start",
            }}
            className="sn-grid-historia"
          >
            <div style={{ display: "flex", justifyContent: "center" }}>
              <img
                src={FOTO_URL}
                alt={t.historia.fotoAlt}
                className="sn-foto"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fb = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fb) fb.style.display = "flex";
                }}
              />
              <div style={{ display: "none", width: 280, height: 373, borderRadius: "1rem", background: "#1B4FD8", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: 800, color: "#fff" }}>
                JL
              </div>
            </div>
            <div>
              <span style={{ display: "block", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const, color: "#4D9FEC", marginBottom: ".75rem" }}>
                {t.historia.etiqueta}
              </span>
              {t.historia.parrafos.map((p, i) => (
                <p key={i} style={{ color: "rgba(255,255,255,.75)", fontSize: ".97rem", lineHeight: 1.85, marginTop: i > 0 ? "1.25rem" : 0 }}>{p}</p>
              ))}
              <p style={{ marginTop: "2rem", color: "#4D9FEC", fontWeight: 700, fontSize: ".88rem", fontStyle: "italic" }}>
                {t.historia.firma}
              </p>
            </div>
          </div>
        </section>

        {/* ══ MISIÓN ════════════════════════════════════════════════════ */}
        <section style={{ background: "#0F1628", padding: "80px 24px" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <span style={{ display: "block", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const, color: "#4D9FEC", marginBottom: ".75rem" }}>
              {t.mision.etiqueta}
            </span>
            <h2
              style={{
                background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "snGrad 6s ease infinite",
                fontSize: "clamp(1.7rem,3.5vw,2.6rem)",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: "1.5rem",
              }}
            >
              {t.mision.titulo}
            </h2>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: "1.02rem", lineHeight: 1.9 }}>
              {t.mision.texto}
            </p>
          </div>
        </section>

        {/* ══ VALORES ═══════════════════════════════════════════════════ */}
        <section style={{ background: "#0A0E1A", padding: "80px 24px 160px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <span style={{ display: "block", fontSize: ".7rem", fontWeight: 700, letterSpacing: ".15em", textTransform: "uppercase" as const, color: "#4D9FEC", marginBottom: ".75rem" }}>
                {t.valores.etiqueta}
              </span>
              <h2
                style={{
                  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
                  backgroundSize: "300% 300%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "snGrad 6s ease infinite",
                  fontSize: "clamp(1.7rem,3.5vw,2.6rem)",
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                {t.valores.titulo}
              </h2>
            </div>
            <div className="sn-stack-scale" style={{ display: "flex", justifyContent: "center" }}>
              <ValoresStack items={t.valores.items} hint={t.valores.hint} />
            </div>
          </div>
        </section>

        {/* ══ CTA FINAL ═════════════════════════════════════════════════ */}
        <section style={{ background: "#070A12", padding: "80px 24px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2
              style={{
                background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "snGrad 6s ease infinite",
                fontSize: "clamp(1.7rem,3.5vw,2.6rem)",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: "1.25rem",
              }}
            >
              {t.cta.titulo}
            </h2>
            <p style={{ color: "rgba(255,255,255,.55)", fontSize: "1rem", lineHeight: 1.8, marginBottom: "2.5rem" }}>
              {t.cta.subtitulo}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                /* Destino provisional — pendiente de confirmar (ancla interna o página de servicios de transporte). */
                onClick={() => { window.location.href = `/${locale}/servicios/transporte-especial`; }}
                style={{ background: "#1B4FD8", color: "#fff", border: "none", borderRadius: ".5rem", padding: ".875rem 2rem", fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: ".95rem", cursor: "pointer", transition: "background .2s,transform .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#1641b0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1B4FD8"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {t.cta.boton1}
              </button>
              <button
                onClick={() => setContactOpen(true)}
                style={{ background: "transparent", color: "#fff", border: "1.5px solid rgba(255,255,255,.4)", borderRadius: ".5rem", padding: ".875rem 2rem", fontFamily: "'Sora',sans-serif", fontWeight: 600, fontSize: ".95rem", cursor: "pointer", transition: "border-color .2s,background .2s,transform .2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,.4)"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {t.cta.boton2}
              </button>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />

      {/* Keyframe animación degradado — inyectado una sola vez */}
      <style>{`
        @keyframes snGrad {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .sn-foto {
          width: 100%; max-width: 320px; aspect-ratio: 3/4; object-fit: cover;
          border-radius: 1rem; filter: grayscale(100%);
          transition: filter .6s ease, transform .6s ease;
          box-shadow: 0 20px 60px rgba(0,0,0,.45);
          display: block; cursor: pointer;
        }
        .sn-foto:hover { filter: grayscale(0%); transform: scale(1.02); }
        @media(max-width: 768px){
          .sn-grid-historia { grid-template-columns: 1fr !important; }
          .sn-foto { max-width: 200px !important; margin: 0 auto; }
          .sn-stack-scale { transform: scale(.58) !important; transform-origin: top center; }
        }
      `}</style>
    </div>
  );
}
