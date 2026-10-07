import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { useTranslations } from "@/i18n/context";
import ContactModal from "./ContactModal";

// Foto de fondo del panel (URL de Supabase Storage). null = sin foto todavía.
// Cuando se ponga una, se dibuja bajo una capa oscura para que el texto se lea.
// Imagen del bucket blog-images servida redimensionada por Storage (no se sube nada).
const CTA_PANEL_BG: string | null =
  "https://supabase.xpertauth.com/storage/v1/render/image/public/blog-images/Gemini_Generated_Image_j326soj326soj326.png?width=1600&quality=70";

export default function CtaFinal() {
  const { t } = useTranslations("ctaFinal");
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
          {CTA_PANEL_BG && (
            <>
              {/* Encuadre (.cta-photo en index.css): ampliado y llevado abajo a la derecha para dejar fuera los rótulos y la marca de agua de la imagen */}
              <img
                src={CTA_PANEL_BG}
                alt=""
                aria-hidden="true"
                className="cta-photo"
              />
              <div className="cta-overlay" />
            </>
          )}

          <div className="relative z-10">
          <h2
            className="t-h2 text-pure"
          >
            {t("title1")}<br />
            {t("title2")}<br />
            {t("title3")}
          </h2>

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
