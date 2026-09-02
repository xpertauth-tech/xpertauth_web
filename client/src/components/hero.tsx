import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import { useLocation } from "wouter";
import HeroRouteMap from "@/components/hero-route-map";

export default function Hero() {
  const { t, locale } = useTranslations("hero");
  const [, navigate] = useLocation();
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // El badge llega como "Parte A · Parte B". En escritorio se muestra en una
  // línea con el separador; en móvil se parte en dos líneas (mismo texto, sin
  // el "·"). Ver Documento Base v1.1, sección 1 bis.
  const badgeParts = t("badge").split(" · ");

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-obsidian overflow-hidden" data-testid="section-hero">

      {/* Gradiente animado de fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(27, 79, 216, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 30%, rgba(77, 159, 236, 0.08) 0%, transparent 55%),
            radial-gradient(ellipse 50% 50% at 50% 80%, rgba(27, 79, 216, 0.06) 0%, transparent 50%)
          `,
          animation: "heroGlow 10s ease-in-out infinite alternate",
        }}
      />

      <HeroRouteMap />

      {/* Gradiente fade hacia abajo */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian/70 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-32">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 max-w-full rounded-xl sm:rounded-full border border-white/10 bg-white/5 mb-8">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-arctic animate-pulse shrink-0" />
            <span className="text-white/60 text-[0.46rem] sm:text-xs font-medium tracking-normal sm:tracking-wide uppercase leading-snug">
              {badgeParts.length === 2 ? (
                <>
                  <span className="block sm:inline">{badgeParts[0]}</span>
                  <span className="hidden sm:inline"> · </span>
                  <span className="block sm:inline">{badgeParts[1]}</span>
                </>
              ) : (
                t("badge")
              )}
            </span>
          </div>

          <h1 className="font-heading font-bold text-pure text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
            {t("title1")}
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#4D9FEC 0%,#ffffff 35%,#4D9FEC 55%,#1B4FD8 75%,#4D9FEC 100%)",
                backgroundSize: "400% 400%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "heroTitleGrad 10s ease-in-out infinite",
              }}
            >
              {t("title2")}
            </span>
          </h1>

          <p className="mt-6 sm:mt-8 text-white/60 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">{t("subtitle")}</p>

          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate(`/${locale}/sobre-nosotros`)} className="group px-8 py-3.5 bg-xpertblue text-pure font-semibold rounded-md text-sm sm:text-base transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center" data-testid="button-hero-proyecto">
              {t("cta1")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            {/* Ancla preparada para la sección "Cómo funciona" del Home (pendiente de construir). */}
            <button onClick={() => scrollTo("#como-funciona")} className="px-8 py-3.5 border border-white/20 text-pure/90 font-medium rounded-md text-sm sm:text-base transition-all duration-300 w-full sm:w-auto" data-testid="button-hero-como-funciona">
              {t("cta2")}
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <button onClick={() => scrollTo("#problema-solucion")} className="text-white/30 animate-bounce" aria-label="Desplazar hacia abajo" data-testid="button-scroll-down">
            <ChevronDown className="w-6 h-6" />
          </button>
        </motion.div>
      </div>

      <style>{`
        @keyframes heroGlow {
          0% {
            background:
              radial-gradient(ellipse 80% 60% at 20% 50%, rgba(27, 79, 216, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 80% 30%, rgba(77, 159, 236, 0.08) 0%, transparent 55%),
              radial-gradient(ellipse 50% 50% at 50% 80%, rgba(27, 79, 216, 0.06) 0%, transparent 50%);
          }
          33% {
            background:
              radial-gradient(ellipse 70% 70% at 70% 40%, rgba(27, 79, 216, 0.10) 0%, transparent 60%),
              radial-gradient(ellipse 80% 50% at 15% 60%, rgba(77, 159, 236, 0.10) 0%, transparent 55%),
              radial-gradient(ellipse 60% 40% at 60% 20%, rgba(27, 79, 216, 0.07) 0%, transparent 50%);
          }
          66% {
            background:
              radial-gradient(ellipse 60% 80% at 50% 20%, rgba(77, 159, 236, 0.09) 0%, transparent 60%),
              radial-gradient(ellipse 70% 60% at 30% 70%, rgba(27, 79, 216, 0.11) 0%, transparent 55%),
              radial-gradient(ellipse 80% 60% at 80% 60%, rgba(77, 159, 236, 0.07) 0%, transparent 50%);
          }
          100% {
            background:
              radial-gradient(ellipse 80% 60% at 20% 50%, rgba(27, 79, 216, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 80% 30%, rgba(77, 159, 236, 0.08) 0%, transparent 55%),
              radial-gradient(ellipse 50% 50% at 50% 80%, rgba(27, 79, 216, 0.06) 0%, transparent 50%);
          }
        }

        @keyframes heroTitleGrad {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  );
}
