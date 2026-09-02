import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import { useLocation } from "wouter";
import ContactModal from "./ContactModal";

const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

export default function CtaFinal() {
  const { t, locale } = useTranslations("ctaFinal");
  // "Conoce el proyecto" reutiliza la clave ya definida en el Footer (footer.aboutProject).
  const { t: footerT } = useTranslations("footer");
  const [, navigate] = useLocation();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section id="cta-final" className="py-24 sm:py-32 bg-obsidian relative overflow-hidden" data-testid="section-cta-final">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-xpertblue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-arctic/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="font-heading font-bold text-3xl sm:text-4xl md:text-5xl leading-tight"
            style={gradientStyle}
          >
            {t("title1")}<br />
            {t("title2")}<br />
            {t("title3")}
          </h2>

          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(`/${locale}/sobre-nosotros`)}
              className="group px-8 py-4 bg-xpertblue text-pure font-semibold rounded-md text-sm sm:text-base transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center hover:bg-xpertblue/90"
              data-testid="button-cta-final-proyecto"
            >
              {footerT("aboutProject")}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => setContactOpen(true)}
              className="px-8 py-4 border border-white/20 text-pure/90 font-medium rounded-md text-sm sm:text-base transition-all duration-300 w-full sm:w-auto text-center hover:bg-white/5 hover:border-white/30"
              data-testid="button-cta-contacto"
            >
              {t("cta2")}
            </button>

            <a
              href="https://calendar.app.google/q54rranYyoyCfcu77"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-arctic/40 text-arctic font-medium rounded-md text-sm sm:text-base transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 hover:bg-arctic/10 hover:border-arctic/60"
            >
              <Calendar className="w-4 h-4" />
              Reserva tu cita
            </a>
          </div>
        </motion.div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}
