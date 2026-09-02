import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Calendar, Loader2, CheckCircle } from "lucide-react";
import { useTranslations } from "@/i18n/context";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

async function fetchPosts() {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const now = new Date().toISOString();
  // Solo posts con published_at <= ahora, ordenados por published_at desc
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/posts?select=id,title,excerpt,slug,published_at&published_at=not.is.null&published_at=lte.${now}&order=published_at.desc&limit=2`,
    {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Accept-Profile": "web",
      },
    }
  );
  if (!res.ok) throw new Error("Error cargando posts");
  return res.json();
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function BlogSignupInline() {
  const { t } = useTranslations("blog");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error" | "duplicate">("idle");

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus("sending");
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    try {
      const check = await fetch(
        `${SUPABASE_URL}/rest/v1/suscriptores?email=eq.${encodeURIComponent(email)}&canal=eq.blog&select=id`,
        { headers: { apikey: key, Authorization: `Bearer ${key}`, "Accept-Profile": "web" } }
      );
      const existing = await check.json();
      if (existing.length > 0) { setStatus("duplicate"); return; }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/suscriptores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Profile": "web",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ email, canal: "blog" }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "ok") {
    return (
      <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center">
        <CheckCircle className="w-8 h-8 text-arctic mx-auto mb-2" />
        <p className="text-white/80 text-sm font-medium">{t("subscribeSuccess")}</p>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
      <p className="text-white/80 text-sm font-medium mb-1">{t("blogSubscribeLabel")}</p>
      <p className="text-white/50 text-xs mb-3">{t("blogSubscribeSubtitle")}</p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder={t("subscribePlaceholder")}
          className="flex-grow px-3 py-2.5 rounded-md bg-white/[0.05] border border-white/10 text-pure text-sm placeholder:text-white/30 focus:outline-none focus:border-arctic/50 transition-colors"
          data-testid="input-blog-email"
        />
        <button
          onClick={handleSubmit}
          disabled={status === "sending" || !email.trim()}
          className="px-4 py-2.5 bg-arctic/20 hover:bg-arctic/30 border border-arctic/30 text-arctic text-sm font-semibold rounded-md transition-all duration-200 disabled:cursor-not-allowed flex-shrink-0"
          data-testid="button-blog-submit"
        >
          {status === "sending" ? <Loader2 className="w-4 h-4 animate-spin" /> : t("subscribeButton")}
        </button>
      </div>
      {status === "duplicate" && <p className="mt-2 text-amber-400 text-xs">{t("subscribeErrorDuplicate")}</p>}
      {status === "error" && <p className="mt-2 text-red-400 text-xs">{t("subscribeErrorGeneric")}</p>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] animate-pulse">
      <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
      <div className="h-3 bg-white/10 rounded w-full mb-2" />
      <div className="h-3 bg-white/10 rounded w-2/3" />
    </div>
  );
}

export default function BlogNewsletter() {
  const { messages } = useTranslations("blog");
  const m = messages as any;

  const [posts, setPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, []);

  return (
    <section id="blog" className="py-20 sm:py-28 bg-obsidian" data-testid="section-blog-newsletter">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-arctic text-xs font-semibold tracking-widest uppercase">{m.label}</span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mt-4" style={gradientStyle}>
            {m.title}
          </h2>
          <p className="mt-4 text-white/60 text-base max-w-xl mx-auto">{m.subtitle}</p>
        </motion.div>

        <div className="max-w-2xl mx-auto">

          {/* — Columna Blog — */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-arctic" />
                <h3 className="font-heading font-semibold text-pure text-lg">{m.articlesTitle}</h3>
                <span className="px-2 py-0.5 bg-arctic/10 text-arctic text-xs font-bold rounded-full">
                  Transporte & IA
                </span>
              </div>
              <a href="/es/blog" className="text-arctic text-xs font-medium hover:underline flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-4 flex-grow">
              {loadingPosts ? (
                <><SkeletonCard /><SkeletonCard /></>
              ) : posts.length === 0 ? (
                <p className="text-white/50 text-sm">Próximamente los primeros artículos.</p>
              ) : (
                posts.map((post, i) => (
                  <motion.a
                    key={post.id}
                    href={`/es/blog/${post.slug}`}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="group p-5 rounded-xl bg-white/[0.03] border border-white/[0.08] cursor-pointer transition-all duration-300 hover:border-arctic/30 block"
                    data-testid={`card-blog-${i}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-grow">
                        <h4 className="font-heading font-semibold text-pure text-base mb-2 group-hover:text-arctic transition-colors">
                          {post.title.charAt(0).toUpperCase() + post.title.slice(1).toLowerCase()}
                        </h4>
                        <p className="text-white/60 text-sm leading-relaxed">{post.excerpt}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-white/40" />
                          <span className="text-white/40 text-xs">{formatDate(post.published_at)}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/30 flex-shrink-0 mt-1 transition-all group-hover:text-arctic group-hover:translate-x-1" />
                    </div>
                  </motion.a>
                ))
              )}
            </div>

            <div className="mt-6">
              <BlogSignupInline />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
