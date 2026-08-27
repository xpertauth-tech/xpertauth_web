import { motion } from "framer-motion";
import { useI18n } from "@/i18n/context";
import { useAgent } from "@/App";

const SUPABASE_BASE = "https://supabase.xpertauth.com/storage/v1/object/public/web-images";
const JOSE_LUIS_PHOTO = `${SUPABASE_BASE}/equipo/jose-luis_foto_v1.webp`;
const LEX_AVATAR = `${SUPABASE_BASE}/equipo/lex_avatar_v1.webp`;
const NOVA_AVATAR = `${SUPABASE_BASE}/equipo/nova_avatar_v1.webp`;
const ALMA_AVATAR = `${SUPABASE_BASE}/equipo/alma_avatar_v1.webp`;
const SOCIAL_URL = "https://social.xpertauth.com";

const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

const teamMembers = [
  {
    id: "jose-luis",
    name: "José Luis",
    photo: JOSE_LUIS_PHOTO,
    role: {
      es: "Fundador y presidente",
      ca: "Fundador i president",
      en: "Founder and president",
      fr: "Fondateur et président",
    },
    description: {
      es: "30 años en transporte especial. El conocimiento humano detrás de todo lo que hacemos.",
      ca: "30 anys en transport especial. El coneixement humà darrere de tot el que fem.",
      en: "30 years in special transport. The human knowledge behind everything we do.",
      fr: "30 ans dans le transport spécial. La connaissance humaine derrière tout ce que nous faisons.",
    },
    cta: {
      es: "Conoce nuestra historia",
      ca: "Coneix la nostra història",
      en: "Our story",
      fr: "Notre histoire",
    },
    ctaHref: "/sobre-nosotros",
    agente: null as null,
    isHuman: true,
    accentColor: "border-arctic/30",
    numberColor: "text-arctic",
    numberBg: "bg-arctic/10",
    ctaStyle: "border border-arctic/40 text-arctic hover:bg-arctic/10",
    avatarFallback: "JL",
  },
  {
    id: "lex",
    name: "LEX",
    photo: LEX_AVATAR,
    role: {
      es: "Agente IA · Normativa de Transporte",
      ca: "Agent IA · Normativa de Transport",
      en: "AI Agent · Transport Regulations",
      fr: "Agent IA · Réglementation Transport",
    },
    description: {
      es: "Preciso, metódico, cita siempre la fuente. Experto en normativa DGT, SCT y permisos especiales.",
      ca: "Precís, metòdic, cita sempre la font. Expert en normativa DGT, SCT i permisos especials.",
      en: "Precise, methodical, always cites the source. Expert in DGT, SCT regulations and special permits.",
      fr: "Précis, méthodique, cite toujours la source. Expert en réglementation DGT, SCT et permis spéciaux.",
    },
    cta: {
      es: "Pregunta al agente",
      ca: "Pregunta a l'agent",
      en: "Ask the agent",
      fr: "Interroger l'agent",
    },
    ctaHref: null as null,
    agente: "LEX" as const,
    isHuman: false,
    accentColor: "border-xpertblue/30",
    numberColor: "text-xpertblue",
    numberBg: "bg-xpertblue/25",
    ctaStyle: "bg-xpertblue text-pure hover:bg-xpertblue/90",
    avatarFallback: "L",
  },
  {
    id: "nova",
    name: "NOVA",
    photo: NOVA_AVATAR,
    role: {
      es: "Agente IA · IA para PYMEs",
      ca: "Agent IA · IA per a PIMEs",
      en: "AI Agent · AI for SMEs",
      fr: "Agent IA · IA pour PME",
    },
    description: {
      es: "Curiosa, práctica, sin humo. Automatización e implementación de IA para empresas que quieren resultados reales.",
      ca: "Curiosa, pràctica, sense fum. Automatització i implementació d'IA per a empreses que volen resultats reals.",
      en: "Curious, practical, no fluff. Automation and AI implementation for businesses that want real results.",
      fr: "Curieuse, pratique, sans fioriture. Automatisation et implémentation d'IA pour les entreprises qui veulent de vrais résultats.",
    },
    cta: {
      es: "Pregunta al agente",
      ca: "Pregunta a l'agent",
      en: "Ask the agent",
      fr: "Interroger l'agent",
    },
    ctaHref: null as null,
    agente: "NOVA" as const,
    isHuman: false,
    accentColor: "border-arctic/30",
    numberColor: "text-arctic",
    numberBg: "bg-arctic/25",
    ctaStyle: "bg-arctic text-obsidian hover:bg-arctic/90",
    avatarFallback: "N",
  },
  {
    id: "alma",
    name: "ALMA",
    photo: ALMA_AVATAR,
    role: {
      es: "Formación digital para mayores",
      ca: "Formació digital per a la gent gran",
      en: "Digital training for seniors",
      fr: "Formation numérique pour les seniors",
    },
    description: {
      es: "Ayudamos a personas de 60+ a perder el miedo a la tecnología, sin jerga y a su ritmo. Esta formación tiene ahora su propio espacio, separado del transporte especial.",
      ca: "Ajudem a persones de 60+ a perdre la por a la tecnologia, sense argot i al seu ritme. Aquesta formació té ara el seu propi espai, separat del transport especial.",
      en: "We help people 60+ overcome their fear of technology, no jargon, at their own pace. This training now has its own space, separate from special transport.",
      fr: "Nous aidons les personnes de 60 ans et plus à vaincre leur peur de la technologie, sans jargon et à leur rythme. Cette formation a désormais son propre espace, distinct du transport spécial.",
    },
    cta: {
      es: "Descúbrela en XpertAuth.Social",
      ca: "Descobreix-la a XpertAuth.Social",
      en: "Discover it at XpertAuth.Social",
      fr: "Découvrez-la sur XpertAuth.Social",
    },
    ctaHref: SOCIAL_URL,
    agente: null as null,
    isHuman: false,
    accentColor: "border-ember/30",
    numberColor: "text-ember",
    numberBg: "bg-ember/25",
    ctaStyle: "bg-ember text-pure hover:bg-ember/90",
    avatarFallback: "A",
  },
];

const aiBadge = {
  es: "Agente IA",
  ca: "Agent IA",
  en: "AI Agent",
  fr: "Agent IA",
};

const sectionLabel = {
  es: "El equipo",
  ca: "L'equip",
  en: "The team",
  fr: "L'équipe",
};

const sectionTitle = {
  es: "El equipo que nunca para",
  ca: "L'equip que mai s'atura",
  en: "The team that never stops",
  fr: "L'équipe qui ne s'arrête jamais",
};

const sectionSubtitle = {
  es: "Experiencia humana real combinada con agentes de IA disponibles 24/7.",
  ca: "Experiència humana real combinada amb agents d'IA disponibles 24/7.",
  en: "Real human expertise combined with AI agents available 24/7.",
  fr: "Expertise humaine réelle combinée à des agents IA disponibles 24h/24.",
};

function MemberAvatar({ member }: { member: (typeof teamMembers)[0] }) {
  return (
    <div className="relative w-16 h-16">
      <img
        src={member.photo}
        alt={member.name}
        className={`w-16 h-16 rounded-full object-cover border-2 ${member.accentColor}`}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        className={`w-16 h-16 rounded-full ${member.numberBg} border ${member.accentColor} items-center justify-center absolute inset-0`}
        style={{ display: "none" }}
      >
        <span className={`font-heading font-bold ${member.numberColor} text-xl`}>
          {member.avatarFallback}
        </span>
      </div>
    </div>
  );
}

export default function TeamSection() {
  const { locale } = useI18n();
  const { abrirAgente } = useAgent();
  const lang = (locale as keyof typeof sectionTitle) || "es";

  function handleCta(member: (typeof teamMembers)[0]) {
    if (member.agente) {
      abrirAgente(member.agente);
    } else if (member.ctaHref?.startsWith("http")) {
      window.open(member.ctaHref, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = `/${locale}${member.ctaHref}`;
    }
  }

  return (
    <section id="equipo" className="py-20 sm:py-28 bg-obsidian-light" data-testid="section-equipo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-arctic text-xs font-semibold tracking-widest uppercase">
            {sectionLabel[lang]}
          </span>
          <h2
            className="font-heading font-bold text-3xl sm:text-4xl mt-4"
            style={gradientStyle}
          >
            {sectionTitle[lang]}
          </h2>
          <p className="mt-4 text-white/50 text-base max-w-xl mx-auto">
            {sectionSubtitle[lang]}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`relative flex flex-col rounded-xl border ${member.accentColor} bg-white/[0.02] p-6 transition-all duration-300 hover:bg-white/[0.04]`}
              data-testid={`card-team-${member.id}`}
            >
              <div className="mb-5">
                <MemberAvatar member={member} />
              </div>

              {!member.isHuman && (
                <span
                  className={`inline-flex self-start px-2.5 py-1 rounded-full text-xs font-semibold border mb-3 ${member.numberBg} ${member.numberColor}`}
                  style={{ borderColor: "currentColor" }}
                >
                  {aiBadge[lang]}
                </span>
              )}

              <h3 className="font-heading font-bold text-pure text-base leading-tight mb-1">
                {member.name}
              </h3>
              <p className={`text-xs font-medium mb-3 ${member.numberColor}`}>
                {member.role[lang]}
              </p>

              <p className="text-white/80 text-sm leading-relaxed flex-grow mb-6">
                {member.description[lang]}
              </p>

              <button
                onClick={() => handleCta(member)}
                className={`w-full py-2.5 rounded-md text-sm font-semibold text-center transition-all duration-200 ${member.ctaStyle}`}
                data-testid={`button-team-${member.id}`}
              >
                {member.cta[lang]}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
