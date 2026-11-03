import { useEffect } from "react";
import { useI18n, LOCALES, type Locale } from "@/i18n/context";

// Identidad de cada página para buscadores y para quien comparte el enlace: título, descripción,
// canonical propio, hreflang a las 4 versiones y etiquetas Open Graph / Twitter.
// Textos aprobados por José Luis (castellano); catalán, inglés y francés, traducidos a partir de ellos.

const ORIGEN = "https://www.xpertauth.com";

export type PaginaSeo = "home" | "servicios" | "sobre" | "historia" | "blog" | "privacidad" | "aviso" | "cookies";

const RUTAS: Record<PaginaSeo, string> = {
  home: "",
  servicios: "/servicios/transporte-especial",
  sobre: "/sobre-nosotros",
  historia: "/mi-historia",
  blog: "/blog",
  privacidad: "/politica-de-privacidad",
  aviso: "/aviso-legal",
  cookies: "/cookies",
};

type Texto = { title: string; description: string };

export const SEO: Record<PaginaSeo, Record<Locale, Texto>> = {
  home: {
    es: { title: "XpertAuth — Transporte especial con criterio e IA", description: "Consulta a LEX tus dudas sobre normativa de transporte especial (DGT y SCT). 30 años de experiencia en el sector, ahora con inteligencia artificial." },
    ca: { title: "XpertAuth — Transport especial amb criteri i IA", description: "Consulta a LEX els teus dubtes sobre normativa de transport especial (DGT i SCT). 30 anys d'experiència al sector, ara amb intel·ligència artificial." },
    en: { title: "XpertAuth — Special transport with judgement and AI", description: "Ask LEX your questions about special transport regulations (DGT and SCT). 30 years of experience in the sector, now with artificial intelligence." },
    fr: { title: "XpertAuth — Transport spécial avec discernement et IA", description: "Posez vos questions à LEX sur la réglementation du transport spécial (DGT et SCT). 30 ans d'expérience du secteur, désormais avec l'IA." },
  },
  servicios: {
    es: { title: "Transporte especial: normativa y permisos · XpertAuth", description: "Orientación sobre normativa DGT y SCT, permisos AE, AEG y AET e itinerarios. No tramitamos por ti: te explicamos cómo hacerlo bien." },
    ca: { title: "Transport especial: normativa i permisos · XpertAuth", description: "Orientació sobre normativa DGT i SCT, permisos AE, AEG i AET i itineraris. No tramitem per tu: t'expliquem com fer-ho bé." },
    en: { title: "Special transport: regulations and permits · XpertAuth", description: "Guidance on DGT and SCT regulations, AE, AEG and AET permits and routes. We don't handle the paperwork for you: we explain how to do it right." },
    fr: { title: "Transport spécial : réglementation et permis · XpertAuth", description: "Conseils sur la réglementation DGT et SCT, les permis AE, AEG et AET et les itinéraires. Nous ne faisons pas les démarches : nous expliquons comment bien faire." },
  },
  sobre: {
    es: { title: "Qué es XpertAuth y qué no es", description: "Asociación en proceso de estudio de constitución que une 30 años de transporte especial con IA. Sin actividad comercial y con transparencia en el uso de la IA." },
    ca: { title: "Què és XpertAuth i què no és", description: "Associació en procés d'estudi de constitució que uneix 30 anys de transport especial amb IA. Sense activitat comercial i amb transparència en l'ús de la IA." },
    en: { title: "What XpertAuth is and what it is not", description: "Association exploring formal establishment that combines 30 years of special transport with AI. No commercial activity, and transparency about the use of AI." },
    fr: { title: "Ce qu'est XpertAuth et ce qu'il n'est pas", description: "Association à l'étude pour une constitution formelle, qui unit 30 ans de transport spécial et IA. Sans activité commerciale, transparente sur l'usage de l'IA." },
  },
  historia: {
    es: { title: "Mi historia: José Luis Echezarreta · XpertAuth", description: "Más de 30 años en el transporte especial, sobre todo en Catalunya, y el paso a la inteligencia artificial. La historia detrás de XpertAuth." },
    ca: { title: "La meva història: José Luis Echezarreta · XpertAuth", description: "Més de 30 anys al transport especial, sobretot a Catalunya, i el pas a la intel·ligència artificial. La història darrere d'XpertAuth." },
    en: { title: "My story: José Luis Echezarreta · XpertAuth", description: "Over 30 years in special transport, mostly in Catalonia, and the move into artificial intelligence. The story behind XpertAuth." },
    fr: { title: "Mon histoire : José Luis Echezarreta · XpertAuth", description: "Plus de 30 ans dans le transport spécial, surtout en Catalogne, puis le passage à l'intelligence artificielle. L'histoire derrière XpertAuth." },
  },
  blog: {
    es: { title: "Blog de transporte especial y normativa · XpertAuth", description: "Normativa, permisos y actualidad del transporte especial, explicados con claridad y criterio para quien va con el tiempo justo." },
    ca: { title: "Blog de transport especial i normativa · XpertAuth", description: "Normativa, permisos i actualitat del transport especial, explicats amb claredat i criteri per a qui va amb el temps just." },
    en: { title: "Special transport and regulations blog · XpertAuth", description: "Regulations, permits and news on special transport, explained clearly and with judgement for those short on time." },
    fr: { title: "Blog transport spécial et réglementation · XpertAuth", description: "Réglementation, permis et actualité du transport spécial, expliqués avec clarté et discernement pour ceux qui manquent de temps." },
  },
  privacidad: {
    es: { title: "Política de privacidad · XpertAuth", description: "Qué datos trata XpertAuth, para qué y cómo ejercer tus derechos. Tus datos son tuyos." },
    ca: { title: "Política de privacitat · XpertAuth", description: "Quines dades tracta XpertAuth, per a què i com exercir els teus drets. Les teves dades són teves." },
    en: { title: "Privacy policy · XpertAuth", description: "What data XpertAuth processes, why, and how to exercise your rights. Your data is yours." },
    fr: { title: "Politique de confidentialité · XpertAuth", description: "Quelles données XpertAuth traite, pourquoi, et comment exercer vos droits. Vos données vous appartiennent." },
  },
  aviso: {
    es: { title: "Aviso legal · XpertAuth", description: "Quién es el responsable de xpertauth.com y en qué condiciones se puede usar la web y LEX." },
    ca: { title: "Avís legal · XpertAuth", description: "Qui és el responsable de xpertauth.com i en quines condicions es pot fer servir el web i LEX." },
    en: { title: "Legal notice · XpertAuth", description: "Who is responsible for xpertauth.com and under what conditions the website and LEX may be used." },
    fr: { title: "Mentions légales · XpertAuth", description: "Qui est responsable de xpertauth.com et dans quelles conditions le site et LEX peuvent être utilisés." },
  },
  cookies: {
    es: { title: "Política de cookies · XpertAuth", description: "Esta web no usa cookies de publicidad ni de seguimiento. Solo guarda tu idioma, tu sesión y una medición anónima de visitas." },
    ca: { title: "Política de galetes · XpertAuth", description: "Aquest web no fa servir galetes de publicitat ni de seguiment. Només desa el teu idioma, la teva sessió i un mesurament anònim de visites." },
    en: { title: "Cookie policy · XpertAuth", description: "This website does not use advertising or tracking cookies. It only stores your language, your session and anonymous visit measurement." },
    fr: { title: "Politique de cookies · XpertAuth", description: "Ce site n'utilise pas de cookies publicitaires ni de suivi. Il enregistre seulement votre langue, votre session et une mesure anonyme des visites." },
  },
};

const OG_LOCALE: Record<Locale, string> = { es: "es_ES", ca: "ca_ES", en: "en_GB", fr: "fr_FR" };

function ponerMeta(atributo: "name" | "property", clave: string, contenido: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${atributo}="${clave}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(atributo, clave);
    document.head.appendChild(el);
  }
  el.setAttribute("content", contenido);
}

function ponerEnlace(rel: string, href: string, hreflang?: string) {
  const el = document.createElement("link");
  el.setAttribute("rel", rel);
  if (hreflang) el.setAttribute("hreflang", hreflang);
  el.setAttribute("href", href);
  el.setAttribute("data-seo", "1");
  document.head.appendChild(el);
}

export interface DatosSeo {
  title: string;
  description: string;
  locale: Locale;
  /** Ruta sin idioma, p. ej. "/blog". */
  ruta: string;
  /** Versiones en otros idiomas (hreflang). false = solo existe una versión y el canonical apunta a ella. */
  alternativas?: boolean;
  /** Idioma de la versión canónica cuando alternativas es false. */
  canonicoEn?: Locale;
  tipo?: "website" | "article";
}

export function aplicarSeo(d: DatosSeo) {
  const { title, description, locale, ruta } = d;
  const alternativas = d.alternativas !== false;
  const idiomaCanonico = alternativas ? locale : d.canonicoEn ?? locale;
  const canonical = `${ORIGEN}/${idiomaCanonico}${ruta}`;

  document.title = title;
  ponerMeta("name", "description", description);
  ponerMeta("property", "og:title", title);
  ponerMeta("property", "og:description", description);
  ponerMeta("property", "og:url", canonical);
  ponerMeta("property", "og:type", d.tipo ?? "website");
  ponerMeta("property", "og:locale", OG_LOCALE[locale]);
  ponerMeta("name", "twitter:title", title);
  ponerMeta("name", "twitter:description", description);

  document.head.querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang], meta[property="og:locale:alternate"]').forEach((e) => e.remove());
  ponerEnlace("canonical", canonical);
  if (alternativas) {
    LOCALES.forEach((l) => ponerEnlace("alternate", `${ORIGEN}/${l}${ruta}`, l));
    ponerEnlace("alternate", `${ORIGEN}/es${ruta}`, "x-default");
    LOCALES.filter((l) => l !== locale).forEach((l) => {
      const m = document.createElement("meta");
      m.setAttribute("property", "og:locale:alternate");
      m.setAttribute("content", OG_LOCALE[l]);
      document.head.appendChild(m);
    });
  }
}

/** Identidad de una de las 8 páginas fijas, en el idioma activo. */
export function useSeo(pagina: PaginaSeo) {
  const { locale } = useI18n();
  useEffect(() => {
    const t = SEO[pagina][locale];
    aplicarSeo({ title: t.title, description: t.description, locale, ruta: RUTAS[pagina] });
  }, [pagina, locale]);
}

/** Identidad propia (artículos del blog). */
export function useSeoPropio(d: DatosSeo | null) {
  useEffect(() => {
    if (d) aplicarSeo(d);
  }, [d && d.title, d && d.description, d && d.locale, d && d.ruta, d && d.alternativas]);
}
