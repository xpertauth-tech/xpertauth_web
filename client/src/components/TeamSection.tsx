import { motion } from "framer-motion";
import { useI18n } from "@/i18n/context";
import { useAgent } from "@/App";

const SUPABASE_BASE = "https://supabase.xpertauth.com/storage/v1/object/public/web-images";
const JOSE_LUIS_PHOTO = `${SUPABASE_BASE}/equipo/equipo_jose-luis-avatar_v1.webp`;

type Lang = "es" | "ca" | "en" | "fr";

const texts = {
  title: {
    es: "Quién hay detrás",
    ca: "Qui hi ha al darrere",
    en: "Who's behind it",
    fr: "Qui est derrière",
  },
  name: "José Luis",
  bio: {
    es: "Treinta años en el transporte especial, la mayor parte en Catalunya.",
    ca: "Trenta anys en el transport especial, la major part a Catalunya.",
    en: "Thirty years in special transport, most of them in Catalunya.",
    fr: "Trente ans dans le transport spécial, pour la plupart en Catalogne.",
  },
  storyCta: {
    es: "Conoce mi historia",
    ca: "Coneix la meva història",
    en: "Read my story",
    fr: "Découvrez mon histoire",
  },
  toolsTitle: {
    es: "Sus herramientas",
    ca: "Les seves eines",
    en: "His tools",
    fr: "Ses outils",
  },
  lex: {
    es: "Resuelve tus dudas de normativa al momento.",
    ca: "Resol els teus dubtes de normativa al moment.",
    en: "Answers your regulation questions instantly.",
    fr: "Répond à vos questions de réglementation sur-le-champ.",
  },
  nova: {
    es: "Ideas para usar la IA en tu empresa de transporte.",
    ca: "Idees per usar la IA a la teva empresa de transport.",
    en: "Ideas for using AI in your transport business.",
    fr: "Des idées pour utiliser l'IA dans votre entreprise de transport.",
  },
  lexCta: {
    es: "Pregunta a LEX",
    ca: "Pregunta a LEX",
    en: "Ask LEX",
    fr: "Demandez à LEX",
  },
  novaCta: {
    es: "Pregunta a NOVA",
    ca: "Pregunta a NOVA",
    en: "Ask NOVA",
    fr: "Demandez à NOVA",
  },
};

export default function TeamSection() {
  const { locale } = useI18n();
  const { abrirAgente } = useAgent();
  const lang: Lang = (["es", "ca", "en", "fr"] as const).includes(locale as Lang) ? (locale as Lang) : "es";

  return (
    <section id="servicios" className="section-y bg-obsidian-light" data-testid="section-equipo">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center head-gap"
        >
          <h2 className="t-h2 text-pure">{texts.title[lang]}</h2>
        </motion.div>

        {/* Protagonista */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="card border-arctic/30 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
          data-testid="card-team-jose-luis"
        >
          <div className="flex justify-center md:block md:flex-shrink-0">
            <div className="relative w-24 h-24 md:w-36 md:h-36">
              <img
                src={JOSE_LUIS_PHOTO}
                alt={texts.name}
                className="w-full h-full rounded-full object-cover border-2 border-arctic/30"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
              <div
                className="w-full h-full rounded-full bg-arctic/10 border border-arctic/30 items-center justify-center absolute inset-0"
                style={{ display: "none" }}
              >
                <span className="font-heading font-bold text-arctic text-2xl">JL</span>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="t-h3 text-pure">{texts.name}</h3>
            <p className="t-body text-white/70 mt-2">{texts.bio[lang]}</p>
            <div className="mt-4">
              <button
                onClick={() => { window.location.href = `/${locale}/sobre-nosotros`; }}
                className="btn btn-secondary"
                data-testid="button-team-jose-luis"
              >
                {texts.storyCta[lang]}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Herramientas: franja discreta, sin fotos ni tarjetas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mt-10 md:mt-16 pt-8 border-t border-white/10"
        >
          <p className="t-label text-center">{texts.toolsTitle[lang]}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            <div className="flex flex-col">
              <h3 className="t-h3 text-pure">LEX</h3>
              <p className="t-small text-white/70 mt-1 flex-grow">{texts.lex[lang]}</p>
              <button
                onClick={() => abrirAgente("LEX")}
                className="btn btn-primary w-full mt-4"
                data-testid="button-team-lex"
              >
                {texts.lexCta[lang]}
              </button>
            </div>
            <div className="flex flex-col">
              <h3 className="t-h3 text-pure">NOVA</h3>
              <p className="t-small text-white/70 mt-1 flex-grow">{texts.nova[lang]}</p>
              <button
                onClick={() => abrirAgente("NOVA")}
                className="btn btn-primary w-full mt-4"
                data-testid="button-team-nova"
              >
                {texts.novaCta[lang]}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
