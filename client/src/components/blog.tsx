import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Calendar } from "lucide-react";
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

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string | null;
  published_at: string;
}

// Misma query/cliente que la página /blog: posts publicados, más recientes primero.
async function fetchPosts(): Promise<Post[]> {
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const now = new Date().toISOString();
  const url =
    SUPABASE_URL +
    "/rest/v1/posts" +
    "?select=id,title,slug,excerpt,image_url,published_at" +
    "&is_published=eq.true" +
    "&published_at=lte." + now +
    "&order=published_at.desc" +
    "&limit=3";
  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: "Bearer " + key,
      "Accept-Profile": "web",
    },
  });
  if (!res.ok) throw new Error("Error cargando posts");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = () => setMatches(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function titleCase(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ─── Tarjeta ─────────────────────────────────────────────────────────────────
function CardInner({ post }: { post: Post }) {
  return (
    <>
      <div className="aspect-[16/10] w-full overflow-hidden bg-white/[0.04]">
        {post.image_url ? (
          <img
            src={post.image_url}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-white/15" />
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow p-5">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-3.5 h-3.5 text-white/40" />
          <span className="text-white/40 text-xs">{formatDate(post.published_at)}</span>
        </div>
        <h3 className="font-heading font-semibold text-pure text-base leading-snug mb-2 group-hover:text-arctic transition-colors">
          {titleCase(post.title)}
        </h3>
        <p className="text-white/55 text-sm leading-relaxed line-clamp-3">{post.excerpt}</p>
      </div>
    </>
  );
}

const CARD_CLASS =
  "group flex flex-col rounded-xl bg-obsidian-light border border-white/[0.08] overflow-hidden";

// ─── Efecto "expediente" (escritorio) ────────────────────────────────────────
function DossierRow({ posts, locale }: { posts: Post[]; locale: string }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(reduce);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (reduce) { setRevealed(true); return; }
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setRevealed(true); obs.disconnect(); }
      },
      { threshold: 0.35 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduce]);

  // Reparto pre-apertura: apiladas hacia el centro (columna 1), ligeramente
  // desplazadas y giradas; la más reciente (índice 0) delante.
  const stackRotate = [-3, 2, 5];
  const stackNudgeY = [0, 5, 10];
  const stackNudgeX = [-8, 0, 8];

  return (
    <div ref={containerRef} className="grid grid-cols-3 gap-6">
      {posts.map((post, i) => {
        const toCenter = `calc(${(1 - i) * 100}% + ${(1 - i) * 1.5}rem)`;
        let transform: string;
        let opacity = 1;
        let zIndex = 10;

        if (!revealed) {
          transform = `translateX(${toCenter}) translate(${stackNudgeX[i]}px, ${stackNudgeY[i]}px) rotate(${stackRotate[i]}deg)`;
          zIndex = 30 - i * 10; // la más reciente delante
        } else if (hovered === null || reduce) {
          transform = "translate(0, 0)";
        } else if (hovered === i) {
          transform = "translateY(-6px) scale(1.02)";
          zIndex = 30;
        } else {
          transform = "scale(0.98)";
          opacity = 0.85;
        }

        return (
          <a
            key={post.id}
            href={`/${locale}/blog/${post.slug}`}
            className={CARD_CLASS + " cursor-pointer"}
            style={{
              transform,
              opacity,
              zIndex,
              transition: reduce
                ? "none"
                : "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease",
            }}
            onMouseEnter={() => revealed && !reduce && setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            data-testid={`card-blog-${i}`}
          >
            <CardInner post={post} />
          </a>
        );
      })}
    </div>
  );
}

// ─── Columna (móvil) ─────────────────────────────────────────────────────────
function MobileColumn({ posts, locale }: { posts: Post[]; locale: string }) {
  return (
    <div className="flex flex-col gap-5">
      {posts.map((post, i) => (
        <motion.a
          key={post.id}
          href={`/${locale}/blog/${post.slug}`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: i * 0.08 }}
          className={CARD_CLASS + " cursor-pointer"}
          data-testid={`card-blog-${i}`}
        >
          <CardInner post={post} />
        </motion.a>
      ))}
    </div>
  );
}

export default function BlogSection() {
  const { messages, locale } = useTranslations("blog");
  const m = messages as any;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoaded(true));
  }, []);

  return (
    <section id="blog" className="bg-obsidian py-20 sm:py-28 overflow-hidden" data-testid="section-blog">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-arctic text-xs font-semibold tracking-widest uppercase">{m.label}</span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mt-4" style={gradientStyle}>
            {m.title}
          </h2>
          <p className="mt-4 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">{m.subtitle}</p>
        </motion.div>

        {loaded && posts.length > 0 && (
          <>
            {isDesktop ? (
              <DossierRow posts={posts} locale={locale} />
            ) : (
              <MobileColumn posts={posts} locale={locale} />
            )}

            <div className="mt-12 text-center">
              <a
                href={`/${locale}/blog`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-pure/90 text-sm font-semibold transition-colors hover:border-arctic/50 hover:text-white"
                data-testid="link-blog-see-all"
              >
                {m.seeAll}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
