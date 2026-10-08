import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import DotSign from "./dot-sign";
import ContactModal from "./ContactModal";

export default function CtaFinal() {
  const { t, messages } = useTranslations("ctaFinal");
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <section id="cta-final" className="section-y-cta bg-obsidian relative overflow-hidden" data-testid="section-cta-final">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-xpertblue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-arctic/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-2xl bg-obsidian-light border border-white/10 p-8 md:p-24 text-center"
          data-testid="panel-cta-final"
        >
          <div className="relative z-10">
          <h2 className="sr-only">{t("title1")}</h2>
          <DotSign messages={messages.signs} />

          <p className="t-h3 text-pure mt-8 sm:mt-10">
            {t("title2")}<br />
            {t("title3")}
          </p>

          <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setContactOpen(true)}
              className="btn btn-primary"
              data-testid="button-cta-contacto"
            >
              {t("cta2")}
            </button>

            <a
              href="https://calendar.app.google/q54rranYyoyCfcu77"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary bg-obsidian/60"
            >
              <Calendar className="w-4 h-4" />
              {t("cta3")}
            </a>
          </div>
          </div>
        </motion.div>
      </div>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  );
}
