import { useEffect } from "react";
import { useLocation } from "wouter";
import { useI18n, useTranslations } from "../i18n/context";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

// ─── TRADUCCIONES ─────────────────────────────────────────────────────────────

const translations = {
  es: {
    historia: {
      etiqueta: "Nuestra historia",
      parrafos: [
        "Llevo más de 30 años trabajando en el mundo del transporte especial por carretera, la mayor parte de ellos en Catalunya. He gestionado permisos, planificado rutas excepcionales y resuelto problemas que la normativa no siempre tiene claros. Lo aprendí todo sobre el terreno.",
        "Cuando llegó el momento de cerrar esa etapa, mi mente inquieta no supo quedarse quieta. Empecé a formarme en inteligencia artificial. Primero por curiosidad. Después con convicción.",
        "Fue entonces cuando lo vi claro. Las herramientas de IA que estaba estudiando podían transformar algo que siempre había sido un problema en el sector: el acceso al conocimiento normativo. Buscar entre cientos de páginas de reglamentos no es lo mismo que hablar con alguien que los conoce a fondo y te responde al instante. Eso era lo que la IA podía hacer. Y yo podía construirlo.",
        "Eso sí, con una condición innegociable: la IA como herramienta, con una persona disponible cuando hace falta. La inteligencia artificial es extraordinaria, pero la experiencia humana —y el sentido común en la toma de decisiones— es y será siempre necesaria. Los agentes responden al momento; cuando un caso lo pide, estoy yo.",
        "XpertAuth es hoy un proyecto personal, en fase de aprendizaje y validación. No hay prisa por llegar a ningún sitio concreto — hay interés real por hacer las cosas bien.",
      ],
      firma: "José Luis Echezarreta — Fundador de XpertAuth",
      fotoAlt: "José Luis Echezarreta — Fundador de XpertAuth (placeholder)",
    },
  },
  ca: {
    historia: {
      etiqueta: "La nostra història",
      parrafos: [
        "Porto més de 30 anys treballant en el món del transport especial per carretera, la major part d'ells a Catalunya. He gestionat permisos, planificat rutes excepcionals i resolt problemes que la normativa no sempre té clars. Ho vaig aprendre tot sobre el terreny.",
        "Quan va arribar el moment de tancar aquella etapa, la meva ment inquieta no va saber quedar-se quieta. Vaig començar a formar-me en intel·ligència artificial. Primer per curiositat. Després amb convicció.",
        "Va ser llavors quan ho vaig veure clar. Les eines d'IA que estava estudiant podien transformar quelcom que sempre havia estat un problema al sector: l'accés al coneixement normatiu. Cercar entre centenars de pàgines de reglaments no és el mateix que parlar amb algú que els coneix a fons i et respon al moment. Això era el que la IA podia fer. I jo podia construir-ho.",
        "Això sí, amb una condició innegociable: la IA com a eina, amb una persona disponible quan cal. La intel·ligència artificial és extraordinària, però l'experiència humana —i el sentit comú en la presa de decisions— és i serà sempre necessària. Els agents responen al moment; quan un cas ho demana, hi sóc jo.",
        "XpertAuth és avui un projecte personal, en fase d'aprenentatge i validació. No hi ha pressa per arribar a cap lloc concret — hi ha interès real per fer les coses bé.",
      ],
      firma: "José Luis Echezarreta — Fundador de XpertAuth",
      fotoAlt: "José Luis Echezarreta — Fundador de XpertAuth (placeholder)",
    },
  },
  en: {
    historia: {
      etiqueta: "Our story",
      parrafos: [
        "I've spent over 30 years working in special road transport, most of them in Catalonia. I've managed permits, planned exceptional routes and solved problems that regulations don't always make clear. I learned everything on the ground.",
        "When the time came to close that chapter, my restless mind couldn't stay still. I started training in artificial intelligence. First out of curiosity. Then out of conviction.",
        "That's when it became clear. The AI tools I was studying could transform something that had always been a problem in the sector: access to regulatory knowledge. Searching through hundreds of pages of regulations is not the same as talking to someone who knows them inside out and answers you instantly. That's what AI could do. And I could build it.",
        "But with one non-negotiable condition: AI as a tool, with a person available when needed. Artificial intelligence is extraordinary, but human experience —and common sense in decision-making— is and will always be necessary. The agents answer instantly; when a case calls for it, I'm there.",
        "XpertAuth today is a personal project, in a learning and validation phase. There's no rush to get anywhere in particular — there's a real interest in doing things well.",
      ],
      firma: "José Luis Echezarreta — Founder of XpertAuth",
      fotoAlt: "José Luis Echezarreta — Founder of XpertAuth (placeholder)",
    },
  },
  fr: {
    historia: {
      etiqueta: "Notre histoire",
      parrafos: [
        "Je travaille depuis plus de 30 ans dans le transport spécial routier, la plupart du temps en Catalogne. J'ai géré des permis, planifié des itinéraires exceptionnels et résolu des problèmes que la réglementation ne clarifie pas toujours. J'ai tout appris sur le terrain.",
        "Quand est venu le moment de clore ce chapitre, mon esprit curieux n'a pas su rester tranquille. J'ai commencé à me former à l'intelligence artificielle. D'abord par curiosité. Puis par conviction.",
        "C'est là que tout est devenu clair. Les outils d'IA que j'étudiais pouvaient transformer quelque chose qui avait toujours été un problème dans le secteur : l'accès à la connaissance réglementaire. Chercher dans des centaines de pages de règlements n'est pas la même chose que parler à quelqu'un qui les connaît parfaitement et vous répond instantanément. C'est ce que l'IA pouvait faire. Et je pouvais le construire.",
        "Mais avec une condition non négociable : l'IA comme outil, avec une personne disponible quand il le faut. L'intelligence artificielle est extraordinaire, mais l'expérience humaine —et le bon sens dans la prise de décision— est et sera toujours nécessaire. Les agents répondent sur le moment ; quand un cas l'exige, je suis là.",
        "XpertAuth est aujourd'hui un projet personnel, en phase d'apprentissage et de validation. Il n'y a pas d'urgence à arriver quelque part en particulier — il y a un intérêt réel à bien faire les choses.",
      ],
      firma: "José Luis Echezarreta — Fondateur de XpertAuth",
      fotoAlt: "José Luis Echezarreta — Fondateur de XpertAuth (placeholder)",
    },
  },
};

const TITULOS = {
  es: "Mi historia — XpertAuth",
  ca: "La meva història — XpertAuth",
  en: "My story — XpertAuth",
  fr: "Mon histoire — XpertAuth",
};

// ─── Foto de "Nuestra historia" ───────────────────────────────────────────────
const FOTO_URL =
  "https://supabase.xpertauth.com/storage/v1/object/public/web-images/equipo/sobre-nosotros_cafe-jose-luis_v1.webp";

export default function MiHistoria() {
  const { locale } = useI18n();
  const lang = locale as keyof typeof translations;
  const t = translations[lang] ?? translations.es;
  const { t: tNotFound } = useTranslations("notFound");
  const [, navigate] = useLocation();

  useEffect(() => {
    const anterior = document.title;
    document.title = TITULOS[lang] ?? TITULOS.es;
    return () => { document.title = anterior; };
  }, [lang]);

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        <section className="page-top section-y-firma px-6" style={{ background: "#0A0E1A" }}>
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
              <span className="t-label">
                {t.historia.etiqueta}
              </span>
              {t.historia.parrafos.map((p, i) => (
                <p key={i} className="t-body" style={{ color: "rgba(255,255,255,.75)", marginTop: i > 0 ? "1.25rem" : 0 }}>{p}</p>
              ))}
              <p className="t-small" style={{ marginTop: "48px", color: "#4D9FEC", fontWeight: 700, fontStyle: "italic" }}>
                {t.historia.firma}
              </p>
            </div>
          </div>

          <div style={{ maxWidth: 1100, margin: "0 auto", marginTop: "64px", display: "flex", justifyContent: "center" }}>
            <button onClick={() => navigate(`/${locale}`)} className="btn btn-secondary" data-testid="button-historia-inicio">
              {tNotFound("button")}
            </button>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
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
        }
      `}</style>
    </div>
  );
}
