import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/context";

const SUPABASE_BASE = "https://supabase.xpertauth.com/storage/v1/object/public/web-images";

const testimonialBgs = [
  `${SUPABASE_BASE}/testimonials/carlos_bg_v1.webp`,
  `${SUPABASE_BASE}/testimonials/maria_bg_v1.webp`,
  `${SUPABASE_BASE}/testimonials/ana_bg_v1.webp`,
];

const testimonialAvatars = [
  `${SUPABASE_BASE}/testimonials/carlos_avatar_v1.webp`,
  `${SUPABASE_BASE}/testimonials/maria_avatar_v1.webp`,
  `${SUPABASE_BASE}/testimonials/ana_avatar_v1.webp`,
];

const carlosOverride = {
  stat: "340 km",
  statLabel: "en un solo permiso",
};

const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

export default function SocialProof() {
  const { messages } = useTranslations("socialProof");
  const m = messages as any;
  const stats = m.stats || [];
  const testimonials = m.testimonials || [];

  return (
    <section id="autoridad" className="py-20 sm:py-28 bg-obsidian" data-testid="section-social-proof">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-arctic text-xs font-semibold tracking-widest uppercase">{m.label}</span>
          <h2
            className="font-heading font-bold text-3xl sm:text-4xl mt-4"
            style={gradientStyle}
          >
            {m.title}
          </h2>
          <p className="mt-4 text-white/50 text-base max-w-xl mx-auto">{m.subtitle}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {stats.map((stat: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center p-6 rounded-xl bg-white/[0.03] border border-white/[0.08]"
              data-testid={`stat-${i}`}
            >
              <div className="font-heading font-bold text-pure text-5xl sm:text-6xl">{stat.value}</div>
              <div className="mt-2 text-white/50 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonios con imagen de fondo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t: any, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
              className="relative rounded-xl overflow-hidden min-h-[320px] flex flex-col justify-end group cursor-pointer"
              data-testid={`testimonial-${i}`}
            >
              <div
                className="testimonial-bg absolute inset-0 bg-cover bg-top"
                style={{ backgroundImage: `url(${testimonialBgs[i]})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-transparent" />

              {i === 0 && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2 text-center">
                    <p className="font-heading font-bold text-arctic text-xl leading-none">{carlosOverride.stat}</p>
                    <p className="text-white/60 text-xs mt-0.5">{carlosOverride.statLabel}</p>
                  </div>
                </div>
              )}

              <div className="relative z-10 p-6 sm:p-8">
                <p className="text-white/90 text-sm leading-relaxed italic mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonialAvatars[i]}
                    alt={t.author}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center"
                    style={{ display: "none" }}
                  >
                    <span className="text-arctic font-heading font-bold text-sm">{t.author?.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-pure text-sm">{t.author}</div>
                    <div className="text-white/50 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partners */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-white/30 text-xs uppercase tracking-widest mb-6">{m.partnersLabel}</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {["Partner 1", "Partner 2", "Partner 3", "Partner 4"].map((p, i) => (
              <div key={i} className="w-24 h-10 rounded-md bg-white/[0.04] flex items-center justify-center">
                <span className="text-white/20 text-xs font-medium">{p}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .testimonial-bg {
          filter: grayscale(100%);
          transition: transform 0.7s ease, filter 0.7s ease;
        }
        .group:hover .testimonial-bg {
          filter: grayscale(0%);
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}
