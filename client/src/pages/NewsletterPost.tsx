import { useState, useEffect } from "react";
import { useParams } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ContactModal from "@/components/ContactModal";

interface Entrega {
  id: string;
  title: string;
  concept_id: string;
  volume: number;
  content: string;
  image_url: string | null;
  published_at: string;
}

const texts: Record<string, {
  backLabel: string;
  vol: string;
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
    backLabel: "← Volver al newsletter",
    vol: "Vol.",
    loading: "Cargando entrega...",
    notFound: "Entrega no encontrada.",
    ctaTitle: "¿Quieres aprender a tu ritmo?",
    ctaSubtitle: "ALMA puede acompañarte en tu camino con la tecnología.",
    ctaBtn: "Hablar con ALMA",
    subscribeTitle: "Recibe cada edición en tu correo",
    subscribeSubtitle: "Formación digital para mayores. Una entrega cada dos semanas. Sin spam.",
    placeholder: "tu@email.com",
    subscribeBtn: "Suscribirme",
    successMsg: "¡Suscrito! Recibirás la próxima entrega en tu correo.",
    errorMsg: "Algo ha ido mal. Inténtalo de nuevo.",
    tag: "Formación Senior",
  },
  ca: {
    backLabel: "← Tornar al newsletter",
    vol: "Vol.",
    loading: "Carregant entrega...",
    notFound: "Entrega no trobada.",
    ctaTitle: "Vols aprendre al teu ritme?",
    ctaSubtitle: "ALMA pot acompanyar-te en el teu camí amb la tecnologia.",
    ctaBtn: "Parlar amb ALMA",
    subscribeTitle: "Rep cada edició al teu correu",
    subscribeSubtitle: "Formació digital per a gent gran. Una entrega cada dues setmanes. Sense spam.",
    placeholder: "tu@email.com",
    subscribeBtn: "Subscriure'm",
    successMsg: "Subscrit! Rebràs la propera entrega al teu correu.",
    errorMsg: "Alguna cosa ha anat malament. Torna-ho a intentar.",
    tag: "Formació Sènior",
  },
  en: {
    backLabel: "← Back to newsletter",
    vol: "Vol.",
    loading: "Loading issue...",
    notFound: "Issue not found.",
    ctaTitle: "Want to learn at your own pace?",
    ctaSubtitle: "ALMA can guide you on your journey with technology.",
    ctaBtn: "Talk to ALMA",
    subscribeTitle: "Get every issue in your inbox",
    subscribeSubtitle: "Digital training for seniors. One issue every two weeks. No spam.",
    placeholder: "you@email.com",
    subscribeBtn: "Subscribe",
    successMsg: "Subscribed! You'll receive the next issue by email.",
    errorMsg: "Something went wrong. Please try again.",
    tag: "Senior Training",
  },
  fr: {
    backLabel: "← Retour à la newsletter",
    vol: "Vol.",
    loading: "Chargement de la livraison...",
    notFound: "Livraison non trouvée.",
    ctaTitle: "Vous voulez apprendre à votre rythme ?",
    ctaSubtitle: "ALMA peut vous accompagner dans votre parcours avec la technologie.",
    ctaBtn: "Parler à ALMA",
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

function renderContent(content: string) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);
  if (isHtml) {
    return <div className="prose-content" dangerouslySetInnerHTML={{ __html: content }} />;
  }
  return (
    <div className="prose-content">
      {content.split("\n").map((paragraph, i) =>
        paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
      )}
    </div>
  );
}

export default function NewsletterPost() {
  const params = useParams<{ locale: string; concept_id: string }>();
  const locale = params.locale && texts[params.locale] ? params.locale : "es";
  const concept_id = params.concept_id || "";
  const t = texts[locale];

  const [item, setItem] = useState<Entrega | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [email, setEmail] = useState("");
  const [subStatus, setSubStatus] = useState<"idle" | "ok" | "error">("idle");
  const [subLoading, setSubLoading] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const url =
        SUPABASE_URL +
        "/rest/v1/post_newsletter" +
        "?select=id,title,concept_id,volume,content,image_url,published_at" +
        "&concept_id=eq." + encodeURIComponent(concept_id) +
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
          setItem(data[0]);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (concept_id) fetchItem();
  }, [concept_id]);

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
        .prose-content a { color: #E8620A; text-decoration: underline; text-underline-offset: 3px; }
        .prose-content a:hover { color: #fff; }
        .prose-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.4rem; }
        .prose-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1.4rem; }
        .prose-content li { margin-bottom: 0.5rem; }
        .prose-content blockquote { border-left: 3px solid #E8620A; padding-left: 1.25rem; margin: 1.5rem 0; color: rgba(255,255,255,0.55); font-style: italic; }
        .prose-content strong { color: #fff; }
        .prose-content code { background: rgba(232,98,10,0.12); color: #E8620A; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
        .prose-content img { border-radius: 10px; max-width: 100%; margin: 1.5rem 0; }
      `}</style>

      <Navbar />

      {/* BOTÓN VOLVER */}
      <div className="pt-28 pb-6 px-6 bg-[#0A0E1A]">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { window.location.href = "/" + locale + "/newsletter"; }}
            className="text-sm text-white/40 hover:text-[#E8620A] transition-colors"
          >
            {t.backLabel}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white/40 py-32">{t.loading}</div>
      ) : notFound || !item ? (
        <div className="text-center text-white/40 py-32">{t.notFound}</div>
      ) : (
        <>
          {/* CABECERA */}
          <header className="px-6 pb-12 bg-[#0A0E1A]">
            <div className="max-w-3xl mx-auto fade-up">
              <div className="flex items-center gap-3 mb-5">
                <span className="inline-block text-xs font-semibold tracking-widest text-[#E8620A] uppercase border border-[#E8620A]/30 px-3 py-1 rounded-full">
                  {t.tag}
                </span>
                {item.volume && (
                  <span className="inline-block text-xs font-bold text-[#E8620A] bg-[#E8620A]/10 border border-[#E8620A]/20 px-2 py-0.5 rounded-full">
                    {t.vol} {item.volume}
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                {item.title}
              </h1>
              <div className="text-sm text-white/30">
                📅 {formatDate(item.published_at, locale)}
              </div>
            </div>
          </header>

          {/* IMAGEN */}
          {item.image_url && (
            <div className="px-6 pb-12 bg-[#0A0E1A]">
              <div className="max-w-3xl mx-auto">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full rounded-xl object-cover max-h-96"
                />
              </div>
            </div>
          )}

          {/* CONTENIDO */}
          <section className="px-6 pb-16 bg-[#0A0E1A]">
            <div className="max-w-3xl mx-auto">
              {renderContent(item.content)}
            </div>
          </section>

          {/* CTA ALMA */}
          <section className="py-14 px-6 bg-[#0A0E1A]">
            <div className="max-w-3xl mx-auto bg-[#0F1628] border border-[#E8620A]/30 rounded-xl p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">{t.ctaTitle}</h3>
              <p className="text-white/50 text-sm mb-6">{t.ctaSubtitle}</p>
              <button
                onClick={() => setContactOpen(true)}
                className="bg-[#E8620A] hover:bg-[#E8620A]/80 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
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
