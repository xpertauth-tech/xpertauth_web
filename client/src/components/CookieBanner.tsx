import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useTranslations } from "@/i18n/context";

// Aviso informativo de una sola vez: la web no usa cookies (solo guarda idioma y sesión
// en el navegador). Al pulsar el botón se guarda "visto" y no vuelve a salir.
const COOKIE_KEY = "xpertauth_cookie_consent";

function avisoVisto(): boolean {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    return !!raw && JSON.parse(raw)?.visto === true;
  } catch {
    return false;
  }
}

function guardarAvisoVisto() {
  try {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ visto: true, fecha: new Date().toISOString() }));
  } catch {}
}

export default function CookieBanner() {
  const { t, locale } = useTranslations("cookies");
  const [, navigate] = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (avisoVisto()) return;
    // Pequeño delay para no bloquear el render inicial
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const entendido = () => {
    guardarAvisoVisto();
    setVisible(false);
  };

  const rutaCookies = `/${locale}/cookies`;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
          data-testid="cookie-banner"
        >
          <div className="max-w-4xl mx-auto bg-[#0F1628] border border-white/10 rounded-xl shadow-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="flex-1 text-white/60 text-xs sm:text-sm leading-relaxed">
              {t("description")}{" "}
              <a
                href={rutaCookies}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(rutaCookies);
                }}
                className="text-arctic underline hover:text-arctic/80 transition-colors whitespace-nowrap"
                data-testid="link-cookies-info"
              >
                {t("learnMore")}
              </a>
            </p>
            <button
              onClick={entendido}
              className="px-6 py-2.5 bg-xpertblue text-pure text-xs sm:text-sm font-semibold rounded-md hover:bg-xpertblue/90 transition-colors sm:flex-shrink-0"
              data-testid="button-cookies-accept"
            >
              {t("button")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
