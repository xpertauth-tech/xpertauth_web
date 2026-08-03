import { useState, useEffect } from "react";
import { useParams } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactModal from "@/components/ContactModal";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  author: string;
  published_at: string;
}

const texts: Record<string, {
  backLabel: string;
  by: string;
  loading: string;
  notFound: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaBtn: string;
  subscribeTitle: string;
  subscribeSubtitle: string;
  placeholder: string;
  subscribeBtn: string;
  successMsg: string;
  errorMsg: string;
  tag: string;
}> = {
  es: {
    backLabel: "← Volver al blog",
    by: "por",
    loading: "Cargando artículo...",
    notFound: "Artículo no encontrado.",
    ctaTitle: "¿Tienes alguna pregunta?",
    ctaSubtitle: "LEX, NOVA y ALMA están disponibles para ayudarte.",
    ctaBtn: "Hablar con el equipo",
    subscribeTitle: "Recibe cada artículo en tu correo",
    subscribeSubtitle: "Transporte especial e IA para PYMEs. Sin spam.",
    placeholder: "tu@email.com",
    subscribeBtn: "Suscribirme",
    successMsg: "¡Suscrito! Te avisaremos con cada nuevo artículo.",
    errorMsg: "Algo ha ido mal. Inténtalo de nuevo.",
    tag: "Transporte & IA",
  },
  ca: {
    backLabel: "← Tornar al blog",
    by: "per",
    loading: "Carregant article...",
    notFound: "Article no trobat.",
    ctaTitle: "Tens alguna pregunta?",
    ctaSubtitle: "LEX, NOVA i ALMA estan disponibles per ajudar-te.",
    ctaBtn: "Parlar amb l'equip",
    subscribeTitle: "Rep cada article al teu correu",
    subscribeSubtitle: "Transport especial i IA per a PIMEs. Sense spam.",
    placeholder: "tu@email.com",
    subscribeBtn: "Subscriure'm",
    successMsg: "Subscrit! T'avisarem amb cada nou article.",
    errorMsg: "Alguna cosa ha anat malament. Torna-ho a intentar.",
    tag: "Transport & IA",
  },
  en: {
    backLabel: "← Back to blog",
    by: "by",
    loading: "Loading article...",
    notFound: "Article not found.",
    ctaTitle: "Any questions?",
    ctaSubtitle: "LEX, NOVA and ALMA are available to help you.",
    ctaBtn: "Talk to the team",
    subscribeTitle: "Get every article in your inbox",
    subscribeSubtitle: "Special transport and AI for SMEs. No spam.",
    placeholder: "you@email.com",
    subscribeBtn: "Subscribe",
    successMsg: "Subscribed! We'll notify you with every new article.",
    errorMsg: "Something went wrong. Please try again.",
    tag: "Transport & AI",
  },
  fr: {
    backLabel: "← Retour au blog",
    by: "par",
    loading: "Chargement de l'article...",
    notFound: "Article non trouvé.",
    ctaTitle: "Vous avez des questions ?",
    ctaSubtitle: "LEX, NOVA et ALMA sont disponibles pour vous aider.",
    ctaBtn: "Parler à l'équipe",
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

function renderContent(content: string) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return (
      <div className="prose-content" dangerouslySetInnerHTML={{ __html: content }} />
    );
  }
  return (
    <div className="prose-content">
      {content.split("\n").map((paragraph, i) =>
        paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
      )}
    </div>
  );
}

export default function BlogPost() {
  const params = useParams<{ locale: string; slug: string }>();
  const locale = params.locale && texts[params.locale] ? params.locale : "es";
  const slug = params.slug || "";
  const t = texts[locale];

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "ok" | "error">("idle");
  const [subLoading, setSubLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const url =
        SUPABASE_URL +
        "/rest/v1/posts" +
        "?select=id,title,slug,excerpt,content,image_url,author,published_at" +
        "&slug=eq." + encodeURIComponent(slug) +
        "&is_published=eq.true" +
        "&limit=1";

      try {
        const res = await fetch(url, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: "Bearer " + SUPABASE_ANON_KEY,
            "Accept-Profile": "web",
          },
        });
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPost(data[0]);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchPost();
  }, [slug]);

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

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .prose-content { color: rgba(255,255,255,0.80); font-size: 1.0625rem; line-height: 1.85; }
        .prose-content p { margin-bottom: 1.4rem; }
        .prose-content h2 { color: #fff; font-weight: 700; font-size: 1.5rem; margin-top: 2.5rem; margin-bottom: 1rem; }
        .prose-content h3 { color: #fff; font-weight: 700; font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.75rem; }
        .prose-content a { color: #4D9FEC; text-decoration: underline; text-underline-offset: 3px; }
        .prose-content a:hover { color: #fff; }
        .prose-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.4rem; }
        .prose-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.4rem; }
        .prose-content li { margin-bottom: 0.5rem; }
        .prose-content blockquote { border-left: 3px solid #4D9FEC; padding-left: 1.25rem; margin: 1.5rem 0; color: rgba(255,255,255,0.55); font-style: italic; }
        .prose-content strong { color: #fff; }
        .prose-content code { background: rgba(77,159,236,0.12); color: #4D9FEC; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
        .prose-content img { border-radius: 10px; max-width: 100%; margin: 1.5rem 0; }
      `}</style>

      <Navbar />

      <div className="pt-28 pb-6 px-6 bg-[#0A0E1A]">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { window.location.href = "/" + locale + "/blog"; }}
            className="text-sm text-white/40 hover:text-[#4D9FEC] transition-colors"
          >
            {t.backLabel}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white/40 py-32">{t.loading}</div>
      ) : notFound || !post ? (
        <div className="text-center text-white/40 py-32">{t.notFound}</div>
      ) : (
        <>
          {/* CABECERA */}
          <header className="px-6 pb-12 bg-[#0A0E1A]">
            <div className="max-w-3xl mx-auto fade-up">
              <span className="inline-block text-xs font-semibold tracking-widest text-[#4D9FEC] uppercase mb-5 border border-[#4D9FEC]/30 px-3 py-1 rounded-full">
                {t.tag}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-5 leading-tight">
                {post.title}
              </h1>
              <p className="text-white/55 text-lg mb-6 leading-relaxed">{post.excerpt}</p>
              <div className="flex items-center gap-3 text-sm text-white/30">
                <span>📅 {formatDate(post.published_at, locale)}</span>
                {post.author && <span>· {t.by} {post.author}</span>}
              </div>
            </div>
          </header>

          {/* IMAGEN */}
          {post.image_url && (
            <div className="px-6 pb-12 bg-[#0A0E1A]">
              <div className="max-w-3xl mx-auto">
                <img src={post.image_url} alt={post.title} className="w-full rounded-xl object-cover max-h-96" />
              </div>
            </div>
          )}

          {/* CONTENIDO */}
          <section className="px-6 pb-16 bg-[#0A0E1A]">
            <div className="max-w-3xl mx-auto">
              {renderContent(post.content)}
            </div>
          </section>

          {/* CTA */}
          <section className="py-14 px-6 bg-[#0A0E1A]">
            <div className="max-w-3xl mx-auto bg-[#0F1628] border border-[#1B4FD8]/30 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">{t.ctaTitle}</h3>
              <p className="text-white/50 text-sm mb-6">{t.ctaSubtitle}</p>
              <button
                onClick={() => setContactOpen(true)}
                className="bg-[#1B4FD8] hover:bg-[#1B4FD8]/80 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                {t.ctaBtn}
              </button>
            </div>
          </section>
        </>
      )}

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
