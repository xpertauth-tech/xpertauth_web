import { useState, useEffect } from "react";
import { useParams } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactModal from "@/components/ContactModal";

const PAGE_SIZE = 10;

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  author: string;
  published_at: string;
}

const texts: Record<string, {
  heroTitle: string;
  heroSubtitle: string;
  readMore: string;
  by: string;
  prev: string;
  next: string;
  page: string;
  of: string;
  loading: string;
  noPosts: string;
  subscribeTitle: string;
  subscribeSubtitle: string;
  placeholder: string;
  subscribeBtn: string;
  successMsg: string;
  errorMsg: string;
  tag: string;
}> = {
  es: {
    heroTitle: "Blog",
    heroSubtitle: "Transporte, inteligencia artificial y formación digital. Sin tecnicismos, con criterio.",
    readMore: "Leer artículo →",
    by: "por",
    prev: "← Anterior",
    next: "Siguiente →",
    page: "Página",
    of: "de",
    loading: "Cargando artículos...",
    noPosts: "No hay artículos publicados todavía.",
    subscribeTitle: "Recibe cada artículo en tu correo",
    subscribeSubtitle: "Transporte especial e IA para PYMEs. Sin spam.",
    placeholder: "tu@email.com",
    subscribeBtn: "Suscribirme",
    successMsg: "¡Suscrito! Te avisaremos con cada nuevo artículo.",
    errorMsg: "Algo ha ido mal. Inténtalo de nuevo.",
    tag: "Transporte & IA",
  },
  ca: {
    heroTitle: "Blog",
    heroSubtitle: "Transport, intel·ligència artificial i formació digital. Sense tecnicismes, amb criteri.",
    readMore: "Llegir article →",
    by: "per",
    prev: "← Anterior",
    next: "Següent →",
    page: "Pàgina",
    of: "de",
    loading: "Carregant articles...",
    noPosts: "No hi ha articles publicats encara.",
    subscribeTitle: "Rep cada article al teu correu",
    subscribeSubtitle: "Transport especial i IA per a PIMEs. Sense spam.",
    placeholder: "tu@email.com",
    subscribeBtn: "Subscriure'm",
    successMsg: "Subscrit! T'avisarem amb cada nou article.",
    errorMsg: "Alguna cosa ha anat malament. Torna-ho a intentar.",
    tag: "Transport & IA",
  },
  en: {
    heroTitle: "Blog",
    heroSubtitle: "Transport, artificial intelligence and digital training. No jargon, just insight.",
    readMore: "Read article →",
    by: "by",
    prev: "← Previous",
    next: "Next →",
    page: "Page",
    of: "of",
    loading: "Loading articles...",
    noPosts: "No articles published yet.",
    subscribeTitle: "Get every article in your inbox",
    subscribeSubtitle: "Special transport and AI for SMEs. No spam.",
    placeholder: "you@email.com",
    subscribeBtn: "Subscribe",
    successMsg: "Subscribed! We'll notify you with every new article.",
    errorMsg: "Something went wrong. Please try again.",
    tag: "Transport & AI",
  },
  fr: {
    heroTitle: "Blog",
    heroSubtitle: "Transport, intelligence artificielle et formation numérique. Sans jargon, avec pertinence.",
    readMore: "Lire l'article →",
    by: "par",
    prev: "← Précédent",
    next: "Suivant →",
    page: "Page",
    of: "sur",
    loading: "Chargement des articles...",
    noPosts: "Aucun article publié pour l'instant.",
    subscribeTitle: "Recevez chaque article par email",
    subscribeSubtitle: "Transport spécial et IA pour PME. Sans spam.",
    placeholder: "vous@email.com",
    subscribeBtn: "S'abonner",
    successMsg: "Abonné ! Nous vous informerons à chaque nouvel article.",
    errorMsg: "Quelque chose s'est mal passé. Veuillez réessayer.",
    tag: "Transport & IA",
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

export default function Blog() {
  const params = useParams<{ locale: string }>();
  const locale = params.locale && texts[params.locale] ? params.locale : "es";
  const t = texts[locale];

  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "ok" | "error">("idle");
  const [subLoading, setSubLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const totalPages = Math.ceil(allPosts.length / PAGE_SIZE);
  const paginatedPosts = allPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const gradientStyle: React.CSSProperties = {
    background: "linear-gradient(90deg, #ffffff 0%, #4D9FEC 50%, #1B4FD8 100%)",
    backgroundSize: "200% auto",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "snGrad 4s linear infinite",
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const now = new Date().toISOString();

      const url =
        SUPABASE_URL +
        "/rest/v1/posts" +
        "?select=id,title,slug,excerpt,image_url,author,published_at" +
        "&is_published=eq.true" +
        "&published_at=lte." + now +
        "&order=published_at.desc" +
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
        setAllPosts(Array.isArray(data) ? data : []);
      } catch {
        setAllPosts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
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
        body: JSON.stringify({ email, canal: "blog" }),
      });
      setSubStatus(res.ok || res.status === 201 ? "ok" : "error");
      if (res.ok || res.status === 201) setEmail("");
    } catch {
      setSubStatus("error");
    } finally {
      setSubLoading(false);
    }
  };

  const goToPost = (slug: string) => {
    window.location.href = "/" + locale + "/blog/" + slug;
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <style>{`
        @keyframes snGrad {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .post-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .post-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 32px rgba(77,159,236,0.12);
          border-color: rgba(77,159,236,0.4) !important;
        }
      `}</style>

      <Navbar />

      {/* HERO */}
      <section className="pt-32 pb-16 px-6 text-center bg-[#0A0E1A]">
        <div className="max-w-3xl mx-auto fade-up">
          <span className="inline-block text-xs font-semibold tracking-widest text-[#4D9FEC] uppercase mb-4 border border-[#4D9FEC]/30 px-3 py-1 rounded-full">
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
          ) : paginatedPosts.length === 0 ? (
            <p className="text-center text-white/40 py-20">{t.noPosts}</p>
          ) : (
            <div className="space-y-5">
              {paginatedPosts.map((post, i) => (
                <article
                  key={post.id}
                  className="post-card bg-[#0F1628] border border-white/10 rounded-xl overflow-hidden cursor-pointer"
                  style={{ animationDelay: (i * 0.06) + "s" }}
                  onClick={() => goToPost(post.slug)}
                >
                  <div className="flex flex-col md:flex-row">
                    {post.image_url && (
                      <div className="md:w-52 md:flex-shrink-0">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full h-44 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-3 leading-snug">
                          {post.title}
                        </h2>
                        <p className="text-white/50 text-sm leading-relaxed line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-5">
                        <div className="flex items-center gap-2 text-xs text-white/30">
                          <span>📅 {formatDate(post.published_at, locale)}</span>
                          {post.author && (
                            <span>· {t.by} {post.author}</span>
                          )}
                        </div>
                        <span className="text-[#4D9FEC] text-sm font-medium">
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
                className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/60 hover:border-[#4D9FEC]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {t.prev}
              </button>
              <span className="text-white/40 text-sm">
                {t.page} {currentPage} {t.of} {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/60 hover:border-[#4D9FEC]/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
            <p className="text-[#4D9FEC] font-medium">{t.successMsg}</p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                placeholder={t.placeholder}
                className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#4D9FEC]/60 transition-colors"
              />
              <button
                onClick={handleSubscribe}
                disabled={subLoading}
                className="bg-[#1B4FD8] hover:bg-[#1B4FD8]/80 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
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
