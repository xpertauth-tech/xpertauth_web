import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useI18n } from "@/i18n/context";

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
  lex: {
    es: "Responde al momento a tus dudas sobre normativa de transporte especial. Consulta una base normativa del sector y te dice de dónde sale cada respuesta.",
    ca: "Respon a l'instant els teus dubtes sobre normativa de transport especial. Consulta una base normativa del sector i et diu d'on surt cada resposta.",
    en: "Answers your questions on special transport regulations instantly. It consults a regulatory knowledge base for the sector and tells you where each answer comes from.",
    fr: "Répond instantanément à vos questions sur la réglementation du transport exceptionnel. Il consulte une base réglementaire du secteur et vous indique d'où vient chaque réponse.",
  },
  nova: {
    es: "Te da ideas prácticas para usar la inteligencia artificial en tu empresa de transporte, explicadas sin tecnicismos.",
    ca: "Et dona idees pràctiques per fer servir la intel·ligència artificial a la teva empresa de transport, explicades sense tecnicismes.",
    en: "Gives you practical ideas for using artificial intelligence in your transport company, explained without jargon.",
    fr: "Vous donne des idées pratiques pour utiliser l'intelligence artificielle dans votre entreprise de transport, expliquées sans jargon.",
  },
};

export default function TeamSection() {
  const { locale } = useI18n();
  const [, navigate] = useLocation();
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
                onClick={() => navigate(`/${locale}/mi-historia`)}
                className="btn btn-secondary"
                data-testid="button-team-jose-luis"
              >
                {texts.storyCta[lang]}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Herramientas: presentación breve, sin botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mt-10 md:mt-16 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
        >
          <div>
            <h3 className="t-h3 text-pure">LEX</h3>
            <p className="t-small text-white/70 mt-1">{texts.lex[lang]}</p>
          </div>
          <div>
            <h3 className="t-h3 text-pure">NOVA</h3>
            <p className="t-small text-white/70 mt-1">{texts.nova[lang]}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
