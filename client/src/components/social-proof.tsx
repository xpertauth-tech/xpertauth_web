import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/context";

const SUPABASE_BASE = "https://supabase.xpertauth.com/storage/v1/object/public/web-images";

// Foto de fondo por caso (B/N → color al hover). null = sin foto disponible
// en Storage; la tarjeta usa un fondo degradado de marca.
const caseBgs: (string | null)[] = [
  `${SUPABASE_BASE}/testimonials/carlos_bg_v1.webp`, // carretera
  `${SUPABASE_BASE}/testimonials/maria_bg_v1.webp`,  // oficina
  null,                                              // convoy / grandes dimensiones — pendiente
];

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
  const cases = m.cases || [];

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

        {/* Casos: etiqueta + texto corto, sobre foto (B/N → color al hover) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {cases.map((c: any, i: number) => {
            const bg = caseBgs[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                className="relative rounded-xl overflow-hidden min-h-[340px] flex flex-col justify-end group"
                data-testid={`case-${i}`}
              >
                {bg ? (
                  <div
                    className="case-bg absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bg})` }}
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(150deg, #12213f 0%, #0d1830 45%, #0a1122 100%)",
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />

                <div className="relative z-10 p-6 sm:p-7">
                  <p className="text-arctic text-[0.7rem] font-semibold tracking-wide uppercase mb-3">
                    {c.label}
                  </p>
                  <p className="text-white/85 text-sm leading-relaxed">{c.text}</p>
                </div>
              </motion.div>
            );
          })}
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
        .case-bg {
          filter: grayscale(100%);
          transition: transform 0.7s ease, filter 0.7s ease;
        }
        .group:hover .case-bg {
          filter: grayscale(0%);
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}
