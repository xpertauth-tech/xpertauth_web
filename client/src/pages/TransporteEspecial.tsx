import { useState, useRef, useCallback } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactModal from "@/components/ContactModal";
import { useAgent } from "@/App";
import { useI18n } from "@/i18n/context";
import { ArrowRight, ExternalLink, FileCheck, Map, MessageSquare, ShieldCheck, BookOpen, Calendar } from "lucide-react";

// ─── Paleta ───────────────────────────────────────────────────────────────────
const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

// ─── Textos por idioma ────────────────────────────────────────────────────────
const texts: Record<string, {
  badge: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaProyecto: string;
  ctaContacta: string;
  ctaAgendar: string;
  servicesLabel: string;
  servicesTitle: string;
  servicesSubtitle: string;
  s01title: string; s01desc: string;
  s02title: string; s02desc: string;
  s03title: string; s03desc: string;
  s01claim: string; s02claim: string; s03claim: string;
  sctLabel: string;
  sctTitle: string;
  sctSubtitle: string;
  sctOpen: string;
  visorTitle: string; visorDesc: string;
  mctTitle: string; mctDesc: string;
  restricTitle: string; restricDesc: string;
  lexLabel: string;
  lexTitle: string;
  lexDesc1: string;
  lexDesc2: string;
  lexCta: string;
  lexSamples: string[];
  ctaTitle: string;
  ctaSubtitle: string;
}> = {
  es: {
    badge: "Servicios · Transporte Especial",
    heroTitle: "30 años acompañando cargas excepcionales.",
    heroSubtitle: "Consultas normativas DGT y SCT. Asesoría en permisos AE, AEG y AET. Apoyo en la planificación de itinerarios. Sin sorpresas legales.",
    ctaProyecto: "Conoce el proyecto",
    ctaContacta: "Contacta con nosotros",
    ctaAgendar: "Agendar cita gratuita",
    servicesLabel: "Lo que hacemos",
    servicesTitle: "Experiencia que se traduce en orientación real",
    servicesSubtitle: "No tramitamos ni planificamos por ti, pero sabemos exactamente cómo acompañarte en cada paso.",
    s01title: "Asesoría en permisos AE, AEG y AET",
    s01desc: "Te orientamos en la gestión de autorizaciones especiales, especiales genéricas y excepcionales ante DGT y SCT. Plazos, documentación y requisitos sin sorpresas.",
    s02title: "Interpretación normativa",
    s02desc: "Lectura experta de la normativa DGT y SCT Catalunya. Instrucciones TV, resoluciones de restricción, catálogo de prescripciones. Criterio humano donde la IA no llega.",
    s03title: "Apoyo en planificación de itinerarios",
    s03desc: "Te ayudamos a entender restricciones horarias, pasos especiales y condiciones específicas por ruta en Catalunya y el resto de España.",
    s01claim: "LEX conoce esta normativa al detalle.",
    s02claim: "Criterio humano, respaldado por inteligencia artificial.",
    s03claim: "Trabajamos siempre con herramientas y fuentes oficiales.",
    sctLabel: "SCT Catalunya",
    sctTitle: "Herramientas oficiales de la Generalitat",
    sctSubtitle: "Consulta itinerarios y el estado del tráfico en tiempo real directamente desde las plataformas oficiales de la SCT.",
    sctOpen: "Abrir herramienta",
    visorTitle: "Visor d'Itineraris SCT",
    visorDesc: "Consulta y planifica itinerarios de transporte especial en Catalunya. Verifica rutas, restricciones de paso y condiciones específicas por tramo.",
    mctTitle: "Mapa Continu de Trànsit",
    mctDesc: "Estado del tráfico en tiempo real en la red viaria de Catalunya. Incidencias, obras, restricciones activas y cámaras de tráfico.",
    restricTitle: "Consulta de Restriccions SCT",
    restricDesc: "Restricciones vigentes para el transporte especial en Catalunya: fechas, tramos, dimensiones máximas y condiciones específicas de circulación.",
    lexLabel: "Agente IA",
    lexTitle: "LEX — Tu experto normativo 24/7",
    lexDesc1: "LEX tiene acceso a más de 7.400 fragmentos de normativa de transporte especial: leyes marco, instrucciones DGT, resoluciones SCT, mercancías peligrosas y jornadas de conducción.",
    lexDesc2: "Pregunta sobre permisos, restricciones horarias, velocidades máximas o trámites con la SCT. LEX cita siempre la fuente exacta.",
    lexCta: "Pregunta a LEX",
    lexSamples: [
      "¿Qué velocidad máxima tiene un VERTE genérico en autopista?",
      "¿Cuáles son las restricciones horarias SCT en agosto?",
      "¿Qué documentación necesito para un AET en Catalunya?",
    ],
    ctaTitle: "¿Tienes una carga que gestionar?",
    ctaSubtitle: "Conoce el proyecto o contáctanos directamente y te orientamos sin compromiso.",
  },
  ca: {
    badge: "Serveis · Transport Especial",
    heroTitle: "30 anys acompanyant càrregues excepcionals.",
    heroSubtitle: "Consultes normatives DGT i SCT. Assessoria en permisos AE, AEG i AET. Suport en la planificació d'itineraris. Sense sorpreses legals.",
    ctaProyecto: "Coneix el projecte",
    ctaContacta: "Contacta amb nosaltres",
    ctaAgendar: "Agenda una cita gratuïta",
    servicesLabel: "El que fem",
    servicesTitle: "Experiència que es tradueix en orientació real",
    servicesSubtitle: "No tramitem ni planifiquem per tu, però sabem exactament com acompanyar-te a cada pas.",
    s01title: "Assessoria en permisos AE, AEG i AET",
    s01desc: "T'orientem en la gestió d'autoritzacions especials, especials genèriques i excepcionals davant DGT i SCT. Terminis, documentació i requisits sense sorpreses.",
    s02title: "Interpretació normativa",
    s02desc: "Lectura experta de la normativa DGT i SCT Catalunya. Instruccions TV, resolucions de restricció, catàleg de prescripcions. Criteri humà on la IA no arriba.",
    s03title: "Suport en planificació d'itineraris",
    s03desc: "T'ajudem a entendre restriccions horàries, passos especials i condicions específiques per ruta a Catalunya i la resta d'Espanya.",
    s01claim: "LEX coneix aquesta normativa al detall.",
    s02claim: "Criteri humà, recolzat per intel·ligència artificial.",
    s03claim: "Treballem sempre amb eines i fonts oficials.",
    sctLabel: "SCT Catalunya",
    sctTitle: "Eines oficials de la Generalitat",
    sctSubtitle: "Consulta itineraris i l'estat del trànsit en temps real directament des de les plataformes oficials de la SCT.",
    sctOpen: "Obrir eina",
    visorTitle: "Visor d'Itineraris SCT",
    visorDesc: "Consulta i planifica itineraris de transport especial a Catalunya. Verifica rutes, restriccions de pas i condicions específiques per tram.",
    mctTitle: "Mapa Continu de Trànsit",
    mctDesc: "Estat del trànsit en temps real a la xarxa viària de Catalunya. Incidències, obres, restriccions actives i càmeres de trànsit.",
    restricTitle: "Consulta de Restriccions SCT",
    restricDesc: "Restriccions vigents per al transport especial a Catalunya: dates, trams, dimensions màximes i condicions específiques de circulació.",
    lexLabel: "Agent IA",
    lexTitle: "LEX — El teu expert normatiu 24/7",
    lexDesc1: "LEX té accés a més de 7.400 fragments de normativa de transport especial: lleis marc, instruccions DGT, resolucions SCT, mercaderies perilloses i jornades de conducció.",
    lexDesc2: "Pregunta sobre permisos, restriccions horàries, velocitats màximes o tràmits amb la SCT. LEX cita sempre la font exacta.",
    lexCta: "Pregunta a LEX",
    lexSamples: [
      "Quina velocitat màxima té un VERTE genèric a l'autopista?",
      "Quines són les restriccions horàries SCT a l'agost?",
      "Quina documentació necessito per a un AET a Catalunya?",
    ],
    ctaTitle: "Tens una càrrega que gestionar?",
    ctaSubtitle: "Coneix el projecte o contacta'ns directament i t'orientem sense compromís.",
  },
  en: {
    badge: "Services · Special Transport",
    heroTitle: "30 years supporting exceptional loads.",
    heroSubtitle: "DGT and SCT regulatory advice. Guidance on AE, AEG and AET permits. Support in route planning. No legal surprises.",
    ctaProyecto: "About the project",
    ctaContacta: "Contact us",
    ctaAgendar: "Book a free call",
    servicesLabel: "What we do",
    servicesTitle: "Experience that translates into real guidance",
    servicesSubtitle: "We don't process or plan for you, but we know exactly how to guide you every step of the way.",
    s01title: "AE, AEG and AET permit advisory",
    s01desc: "We guide you through managing special, generic special and exceptional authorisations with DGT and SCT. Deadlines, documentation and requirements — no surprises.",
    s02title: "Regulatory interpretation",
    s02desc: "Expert reading of DGT and SCT Catalunya regulations. TV instructions, restriction resolutions, prescription catalogue. Human judgement where AI falls short.",
    s03title: "Route planning support",
    s03desc: "We help you understand time restrictions, special passages and route-specific conditions in Catalunya and the rest of Spain.",
    s01claim: "LEX knows this regulation in detail.",
    s02claim: "Human judgement, backed by artificial intelligence.",
    s03claim: "We always work with official tools and sources.",
    sctLabel: "SCT Catalunya",
    sctTitle: "Official Generalitat tools",
    sctSubtitle: "Check itineraries and live traffic conditions directly from the official SCT platforms.",
    sctOpen: "Open tool",
    visorTitle: "SCT Itinerary Viewer",
    visorDesc: "Check and plan special transport itineraries in Catalunya. Verify routes, passage restrictions and specific conditions by section.",
    mctTitle: "Continuous Traffic Map",
    mctDesc: "Real-time traffic conditions on Catalunya's road network. Incidents, roadworks, active restrictions and traffic cameras.",
    restricTitle: "SCT Traffic Restrictions",
    restricDesc: "Current restrictions for special transport in Catalunya: dates, road sections, maximum dimensions and specific circulation conditions.",
    lexLabel: "AI Agent",
    lexTitle: "LEX — Your regulatory expert 24/7",
    lexDesc1: "LEX has access to over 7,400 fragments of special transport regulations: framework laws, DGT instructions, SCT resolutions, dangerous goods and driving hours.",
    lexDesc2: "Ask about permits, time restrictions, maximum speeds or SCT procedures. LEX always cites the exact source.",
    lexCta: "Ask LEX",
    lexSamples: [
      "What is the maximum speed for a generic VERTE on a motorway?",
      "What are the SCT time restrictions in August?",
      "What documents do I need for an AET in Catalunya?",
    ],
    ctaTitle: "Do you have a load to manage?",
    ctaSubtitle: "Get to know the project or contact us directly for no-obligation guidance.",
  },
  fr: {
    badge: "Services · Transport Spécial",
    heroTitle: "30 ans à accompagner les charges exceptionnelles.",
    heroSubtitle: "Conseils réglementaires DGT et SCT. Accompagnement pour les permis AE, AEG et AET. Soutien à la planification des itinéraires. Sans mauvaises surprises légales.",
    ctaProyecto: "Découvrir le projet",
    ctaContacta: "Nous contacter",
    ctaAgendar: "Réserver un appel gratuit",
    servicesLabel: "Ce que nous faisons",
    servicesTitle: "Une expérience qui se traduit par un accompagnement réel",
    servicesSubtitle: "Nous ne traitons pas à votre place, mais nous savons exactement comment vous guider à chaque étape.",
    s01title: "Conseil en permis AE, AEG et AET",
    s01desc: "Nous vous orientons dans la gestion des autorisations spéciales, génériques et exceptionnelles auprès de la DGT et de la SCT. Délais, documents et exigences sans surprise.",
    s02title: "Interprétation réglementaire",
    s02desc: "Lecture experte de la réglementation DGT et SCT Catalunya. Instructions TV, résolutions de restriction, catalogue de prescriptions. Jugement humain là où l'IA ne suffit pas.",
    s03title: "Soutien à la planification des itinéraires",
    s03desc: "Nous vous aidons à comprendre les restrictions horaires, les passages spéciaux et les conditions spécifiques par itinéraire en Catalogne et dans le reste de l'Espagne.",
    s01claim: "LEX connaît cette réglementation en détail.",
    s02claim: "Jugement humain, soutenu par l'intelligence artificielle.",
    s03claim: "Nous travaillons toujours avec des outils et des sources officiels.",
    sctLabel: "SCT Catalunya",
    sctTitle: "Outils officiels de la Generalitat",
    sctSubtitle: "Consultez les itinéraires et l'état du trafic en temps réel directement depuis les plateformes officielles de la SCT.",
    sctOpen: "Ouvrir l'outil",
    visorTitle: "Visionneuse d'itinéraires SCT",
    visorDesc: "Consultez et planifiez des itinéraires de transport spécial en Catalogne. Vérifiez les routes, les restrictions de passage et les conditions spécifiques par tronçon.",
    mctTitle: "Carte Continue de Trafic",
    mctDesc: "État du trafic en temps réel sur le réseau routier de Catalogne. Incidents, travaux, restrictions actives et caméras de trafic.",
    restricTitle: "Consultation des Restrictions SCT",
    restricDesc: "Restrictions en vigueur pour le transport spécial en Catalogne : dates, tronçons, dimensions maximales et conditions spécifiques de circulation.",
    lexLabel: "Agent IA",
    lexTitle: "LEX — Votre expert réglementaire 24h/24",
    lexDesc1: "LEX a accès à plus de 7 400 fragments de réglementation sur le transport spécial : lois cadres, instructions DGT, résolutions SCT, matières dangereuses et temps de conduite.",
    lexDesc2: "Posez des questions sur les permis, les restrictions horaires, les vitesses maximales ou les démarches SCT. LEX cite toujours la source exacte.",
    lexCta: "Demandez à LEX",
    lexSamples: [
      "Quelle est la vitesse maximale d'un VERTE générique sur autoroute ?",
      "Quelles sont les restrictions horaires SCT en août ?",
      "Quels documents sont nécessaires pour un AET en Catalogne ?",
    ],
    ctaTitle: "Vous avez une charge à gérer ?",
    ctaSubtitle: "Découvrez le projet ou contactez-nous directement pour un accompagnement sans engagement.",
  },
};

// ─── Tilt 3D Card ─────────────────────────────────────────────────────────────
function TiltCard({
  title, description, url, icon, accentColor, openLabel,
}: {
  title: string; description: string; url: string;
  icon: React.ReactNode; accentColor: string; openLabel: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 12;
    const rotateX = -((y - rect.height / 2) / (rect.height / 2)) * 12;
    setTransform(`perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04,1.04,1.04)`);
    setShine({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.18 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTransform("perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setShine((s) => ({ ...s, opacity: 0 }));
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => window.open(url, "_blank", "noopener noreferrer")}
      style={{ transform, transition: "transform 0.15s ease-out", transformStyle: "preserve-3d" }}
      className="relative flex flex-col justify-between p-8 rounded-2xl overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 rounded-2xl" style={{ background: `linear-gradient(135deg, ${accentColor}40 0%, transparent 60%)`, border: `1px solid ${accentColor}35` }} />
      <div className="absolute inset-0 rounded-2xl bg-white/[0.03]" />
      <div className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300" style={{ background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.2) 0%, transparent 60%)`, opacity: shine.opacity }} />

      <div className="relative z-10 flex flex-col h-full gap-6">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}20`, border: `1px solid ${accentColor}40` }}>
          {icon}
        </div>
        <div className="flex-grow">
          <h3 className="font-heading font-bold text-pure text-xl mb-3">{title}</h3>
          <p className="text-white/60 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: accentColor }}>
          <span>{openLabel}</span>
          <ExternalLink className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

// ─── Tarjeta de servicio con claim en hover ────────────────────────────────────
function ServiceCard({
  number, title, description, icon, claim,
}: {
  number: string; title: string; description: string;
  icon: React.ReactNode; claim: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: "all 0.35s cubic-bezier(0.34,1.2,0.64,1)",
        transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
      }}
      className={`p-6 rounded-xl border transition-colors duration-300 overflow-hidden ${
        hovered
          ? "bg-xpertblue/10 border-xpertblue/40 shadow-lg shadow-xpertblue/10"
          : "bg-white/[0.03] border-white/[0.08]"
      }`}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
          hovered ? "bg-xpertblue/20 border-xpertblue/40" : "bg-xpertblue/10 border-xpertblue/20"
        }`}>
          {icon}
        </div>
        <div>
          <span className="text-xpertblue text-xs font-bold tracking-widest font-mono">{number}</span>
          <h3 className="font-heading font-semibold text-pure text-base mt-1 mb-2">{title}</h3>
          <p className="text-white/60 text-sm leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Claim que aparece al hover */}
      <div
        style={{
          maxHeight: hovered ? "56px" : "0px",
          opacity: hovered ? 1 : 0,
          transition: "max-height 0.3s ease, opacity 0.3s ease 0.05s",
          overflow: "hidden",
        }}
      >
        <p className="text-arctic text-xs italic leading-relaxed pt-2 border-t border-arctic/20">
          — {claim}
        </p>
      </div>
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────────
export default function TransporteEspecial() {
  const [contactOpen, setContactOpen] = useState(false);
  const { abrirAgente } = useAgent();
  const { locale } = useI18n();
  const t = texts[locale] ?? texts.es;

  return (
    <div className="min-h-screen bg-obsidian text-pure font-sans">
      <style>{`
        @keyframes snGrad {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <Navbar />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-obsidian">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block text-arctic text-xs font-semibold tracking-widest uppercase mb-6">
            {t.badge}
          </span>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6" style={gradientStyle}>
            {t.heroTitle}
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            {t.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = `/${locale}/sobre-nosotros`}
              className="px-7 py-3.5 bg-xpertblue hover:bg-xpertblue/90 text-pure font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {t.ctaProyecto} <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setContactOpen(true)}
              className="px-7 py-3.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-pure font-semibold rounded-lg transition-all duration-200"
            >
              {t.ctaContacta}
            </button>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-obsidian border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-arctic text-xs font-semibold tracking-widest uppercase">{t.servicesLabel}</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mt-4" style={gradientStyle}>
              {t.servicesTitle}
            </h2>
            <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.servicesSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <ServiceCard number="01" icon={<FileCheck className="w-5 h-5 text-xpertblue" />} title={t.s01title} description={t.s01desc} claim={t.s01claim} />
            <ServiceCard number="02" icon={<ShieldCheck className="w-5 h-5 text-xpertblue" />} title={t.s02title} description={t.s02desc} claim={t.s02claim} />
            <ServiceCard number="03" icon={<BookOpen className="w-5 h-5 text-xpertblue" />} title={t.s03title} description={t.s03desc} claim={t.s03claim} />
          </div>
        </div>
      </section>

      {/* ── HERRAMIENTAS SCT ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-obsidian border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-arctic text-xs font-semibold tracking-widest uppercase">{t.sctLabel}</span>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl mt-4" style={gradientStyle}>
              {t.sctTitle}
            </h2>
            <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.sctSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
            <TiltCard
              title={t.visorTitle}
              description={t.visorDesc}
              url="https://visoritineraris.transit.gencat.cat/visorte/"
              accentColor="#1B4FD8"
              icon={<Map className="w-6 h-6 text-xpertblue" />}
              openLabel={t.sctOpen}
            />
            <TiltCard
              title={t.mctTitle}
              description={t.mctDesc}
              url="https://mct.gencat.cat/"
              accentColor="#4D9FEC"
              icon={<ExternalLink className="w-6 h-6 text-arctic" />}
              openLabel={t.sctOpen}
            />
            <TiltCard
              title={t.restricTitle}
              description={t.restricDesc}
              url="https://transit.gencat.cat/ca/informacio-viaria/professionals-transport/mesures-especials/consulta-restriccions/"
              accentColor="#E8620A"
              icon={<ShieldCheck className="w-6 h-6 text-[#E8620A]" />}
              openLabel={t.sctOpen}
            />
          </div>
        </div>
      </section>

      {/* ── LEX ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-obsidian border-t border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1">
              <span className="text-arctic text-xs font-semibold tracking-widest uppercase">{t.lexLabel}</span>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl mt-4 mb-5" style={gradientStyle}>
                {t.lexTitle}
              </h2>
              <p className="text-white/60 leading-relaxed mb-4">{t.lexDesc1}</p>
              <p className="text-white/60 leading-relaxed mb-8">{t.lexDesc2}</p>
              <button
                onClick={() => abrirAgente("LEX")}
                className="px-7 py-3.5 bg-xpertblue hover:bg-xpertblue/90 text-pure font-semibold rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {t.lexCta}
              </button>
            </div>

            {/* Panel decorativo LEX */}
            <div className="flex-1 w-full max-w-sm lg:max-w-none">
              <div className="rounded-2xl border border-xpertblue/20 bg-xpertblue/5 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-xpertblue flex items-center justify-center">
                    <span className="text-pure text-xs font-bold">L</span>
                  </div>
                  <span className="text-pure font-semibold text-sm">LEX · XpertAuth</span>
                  <span className="ml-auto px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Activo</span>
                </div>
                <div className="space-y-3">
                  {t.lexSamples.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => abrirAgente("LEX")}
                      className="w-full text-left px-4 py-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/60 text-sm hover:border-xpertblue/30 hover:text-white/80 transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-white/30 text-xs text-center">Ejemplos de consultas · Haz clic para preguntar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-obsidian border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mb-5" style={gradientStyle}>
            {t.ctaTitle}
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">{t.ctaSubtitle}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = `/${locale}/sobre-nosotros`}
              className="px-7 py-3.5 bg-xpertblue hover:bg-xpertblue/90 text-pure font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {t.ctaProyecto} <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setContactOpen(true)}
              className="px-7 py-3.5 bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-pure font-semibold rounded-lg transition-all duration-200"
            >
              {t.ctaContacta}
            </button>
            <a
              href="https://calendar.app.google/q54rranYyoyCfcu77"
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 border border-[#4D9FEC]/40 text-[#4D9FEC] font-semibold rounded-lg transition-all duration-200 hover:bg-[#4D9FEC]/10 hover:border-[#4D9FEC]/60 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Reserva tu cita
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
