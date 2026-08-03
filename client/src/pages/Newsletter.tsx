import { useState, useEffect } from "react";
import { useParams } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactModal from "@/components/ContactModal";

const PAGE_SIZE = 10;

interface Entrega {
  id: string;
  title: string;
  concept_id: string;
  volume: number;
  image_url: string | null;
  scheduled_at: string;
}

const texts: Record<string, {
  heroTitle: string;
  heroSubtitle: string;
  readMore: string;
  vol: string;
  prev: string;
  next: string;
  page: string;
  of: string;
  loading: string;
  noItems: string;
  subscribeTitle: string;
  subscribeSubtitle: string;
  placeholder: string;
  subscribeBtn: string;
  successMsg: string;
  errorMsg: string;
  tag: string;
}> = {
  es: {
    heroTitle: "Newsletter",
    heroSubtitle: "La IA no muerde. Formación digital para mayores, una entrega cada dos semanas.",
    readMore: "Leer entrega →",
    vol: "Vol.",
    prev: "← Anterior",
    next: "Siguiente →",
    page: "Página",
    of: "de",
    loading: "Cargando entregas...",
    noItems: "No hay entregas publicadas todavía.",
    subscribeTitle: "Recibe cada edición en tu correo",
    subscribeSubtitle: "Formación digital para mayores. Una entrega cada dos semanas. Sin spam.",
    placeholder: "tu@email.com",
    subscribeBtn: "Suscribirme",
    successMsg: "¡Suscrito! Recibirás la próxima entrega en tu correo.",
    errorMsg: "Algo ha ido mal. Inténtalo de nuevo.",
    tag: "Formación Senior",
  },
  ca: {
    heroTitle: "Newsletter",
    heroSubtitle: "La IA no mossega. Formació digital per a gent gran, una entrega cada dues setmanes.",
    readMore: "Llegir entrega →",
    vol: "Vol.",
    prev: "← Anterior",
    next: "Següent →",
    page: "Pàgina",
    of: "de",
    loading: "Carregant entregues...",
    noItems: "No hi ha entregues publicades encara.",
    subscribeTitle: "Rep cada edició al teu correu",
    subscribeSubtitle: "Formació digital per a gent gran. Una entrega cada dues setmanes. Sense spam.",
    placeholder: "tu@email.com",
    subscribeBtn: "Subscriure'm",
    successMsg: "Subscrit! Rebràs la propera entrega al teu correu.",
    errorMsg: "Alguna cosa ha anat malament. Torna-ho a intentar.",
    tag: "Formació Sènior",
  },
  en: {
    heroTitle: "Newsletter",
    heroSubtitle: "AI doesn't bite. Digital training for seniors, one issue every two weeks.",
    readMore: "Read issue →",
    vol: "Vol.",
    prev: "← Previous",
    next: "Next →",
    page: "Page",
    of: "of",
    loading: "Loading issues...",
    noItems: "No issues published yet.",
    subscribeTitle: "Get every issue in your inbox",
    subscribeSubtitle: "Digital training for seniors. One issue every two weeks. No spam.",
    placeholder: "you@email.com",
    subscribeBtn: "Subscribe",
    successMsg: "Subscribed! You'll receive the next issue by email.",
    errorMsg: "Something went wrong. Please try again.",
    tag: "Senior Training",
  },
  fr: {
    heroTitle: "Newsletter",
    heroSubtitle: "L'IA ne mord pas. Formation numérique pour seniors, une livraison toutes les deux semaines.",
    readMore: "Lire la livraison →",
    vol: "Vol.",
    prev: "← Précédent",
    next: "Suivant →",
    page: "Page",
    of: "sur",
    loading: "Chargement des livraisons...",
    noItems: "Aucune livraison publiée pour l'instant.",
    subscribeTitle: "Recevez chaque édition par email",
    subscribeSubtitle: "Formation numérique pour seniors. Une livraison toutes les deux semaines. Sans spam.",
    placeholder: "vous@email.com",
    subscribeBtn: "S'abonner",
    successMsg: "Abonné ! Vous recevrez la prochaine livraison par email.",
    errorMsg: "Quelque chose s'est mal passé. Veuillez réessayer.",
    tag: "Formation Senior",
  },
};

function formatDate(dateStr: string, locale: string): string {
  try {
    const localeMap: Record<string, string> = {
      es: "es-ES", ca: "ca-ES", en: "en-GB", fr: "fr-FR",
    };
    return new Date(dateStr).toLocaleDateString(localeMap[locale] || "es-ES", {
      year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function Newsletter() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale && texts[params.locale] ? params.locale : "es";
  const t = texts[locale];

  const [allItems, setAllItems] = useState<Entrega[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "ok" | "error">("idle");
  const [subLoading, setSubLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const totalPages = Math.ceil(allItems.length / PAGE_SIZE);
  const paginatedItems = allItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const gradientStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, #ffffff 0%, #E8620A 60%, #c44d00 100%)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "nlGrad 4s linear infinite",
  };

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const now = new Date().toISOString();

      const url =
        SUPABASE_URL +
        "/rest/v1/post_newsletter" +
        "?select=id,title,concept_id,volume,image_url,scheduled_at" +
        "&scheduled_at=lte." + encodeURIComponent(now) +
        "&order=scheduled_at.desc" +
        "&limit=1000";

      try {
        const res = await fetch(url, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: "Bearer " + SUPABASE_ANON_KEY,
            "Accept-Profile": "web",
          },
        });
        const data = await res.json();
        setAllItems(Array.isArray(data) ? data : []);
      } catch {
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) return;
    setSubLoading(true);
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    try {
      const res = await fetch(SUPABASE_URL + "/rest/v1/suscriptores", {
        method: "POST",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: "Bearer " + SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          "Content-Profile": "web",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ email, canal: "newsletter" }),
      });
      setSubStatus(res.ok || res.status === 201 ? "ok" : "error");
      if (res.ok || res.status === 201) setEmail("");
    } catch {
      setSubStatus("error");
    } finally {
      setSubLoading(false);
    }
  };

  const goToItem = (concept_id: string) => {
    window.location.href = "/" + locale + "/newsletter/" + concept_id;
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <style>{`
        @keyframes nlGrad {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .nl-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .nl-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(232,98,10,0.12);
          border-color: rgba(232,98,10,0.4) !important;
        }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-16 px-6 text-center bg-[#0A0E1A]">
        <div className="max-w-3xl mx-auto fade-up">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#E8620A] uppercase mb-4 border border-[#E8620A]/30 px-3 py-1 rounded-full">
            {t.tag}
          </span>
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={gradientStyle}>
            {t.heroTitle}
          </h1>
          <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
            {t.heroSubtitle}
          </p>
        </div>
      </section>

      {/* LISTADO */}
      <section className="py-12 px-6 bg-[#0A0E1A]">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <p className="text-center text-white/40 py-20">{t.loading}</p>
          ) : paginatedItems.length === 0 ? (
            <p className="text-center text-white/40 py-20">{t.noItems}</p>
          ) : (
            <div className="space-y-5">
              {paginatedItems.map((item, i) => (
                <article
                  key={item.id}
                  className="nl-card bg-[#0F1628] border border-white/10 rounded-xl overflow-hidden cursor-pointer"
                  style={{ animationDelay: (i * 0.06) + "s" }}
                  onClick={() => goToItem(item.concept_id)}
                >
                  <div className="flex flex-col md:flex-row">
                    {item.image_url && (
                      <div className="md:w-52 md:flex-shrink-0">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-44 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        {item.volume && (
                          <span className="inline-block text-xs font-bold text-[#E8620A] bg-[#E8620A]/10 border border-[#E8620A]/20 px-2 py-0.5 rounded-full mb-3">
                            {t.vol} {item.volume}
                          </span>
                        )}
                        <h2 className="text-xl font-semibold text-white leading-snug">
                          {item.title}
                        </h2>
                      </div>
                      <div className="flex items-center justify-between mt-5">
                        <span className="text-xs text-white/30">
                          📅 {formatDate(item.scheduled_at, locale)}
                        </span>
                        <span className="text-[#E8620A] text-sm font-medium">
                          {t.readMore}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/60 hover:border-[#E8620A]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {t.prev}
              </button>
              <span className="text-white/40 text-sm">
                {t.page} {currentPage} {t.of} {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/60 hover:border-[#E8620A]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {t.next}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* SUSCRIPCIÓN */}
      <section className="py-16 px-6 bg-[#070A12]">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-3">{t.subscribeTitle}</h2>
          <p className="text-white/50 text-sm mb-8">{t.subscribeSubtitle}</p>
          {subStatus === "ok" ? (
            <p className="text-[#E8620A] font-medium">{t.successMsg}</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder={t.placeholder}
                className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#E8620A]/60 transition-colors"
              />
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className="bg-[#E8620A] hover:bg-[#E8620A]/80 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {subLoading ? "..." : t.subscribeBtn}
              </button>
            </div>
          )}
          {subStatus === "error" && (
            <p className="text-red-400 text-sm mt-3">{t.errorMsg}</p>
          )}
        </div>
      </section>

      <Footer />
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
