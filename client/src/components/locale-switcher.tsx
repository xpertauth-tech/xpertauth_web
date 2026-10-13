import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useI18n, LOCALES, type Locale } from "@/i18n/context";
import { FlagES, FlagCA, FlagEN, FlagFR } from "./flag-icons";

const flagComponents: Record<Locale, React.ComponentType<{ className?: string }>> = {
  es: FlagES,
  ca: FlagCA,
  en: FlagEN,
  fr: FlagFR,
};

const localeLabels: Record<Locale, string> = {
  es: "ES",
  ca: "CA",
  en: "EN",
  fr: "FR",
};

export default function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const CurrentFlag = flagComponents[locale];

  return (
    <div ref={ref} className="relative" data-testid="locale-switcher">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/70 rounded-md transition-colors"
        data-testid="button-locale-toggle"
        aria-label="Cambiar idioma"
      >
        <CurrentFlag className="w-5 h-3.5 rounded-[2px] overflow-hidden" />
        <span className="font-medium text-xs">{localeLabels[locale]}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 w-32 rounded-md border border-white/10 bg-obsidian shadow-xl shadow-black/30 py-1 z-50"
          >
            {LOCALES.map((loc) => {
              const Flag = flagComponents[loc];
              const isActive = loc === locale;
              return (
                <button
                  key={loc}
                  onClick={() => {
                    setLocale(loc);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                    isActive ? "text-arctic bg-white/[0.05]" : "text-white/70"
                  }`}
                  data-testid={`button-locale-${loc}`}
                >
                  <Flag className="w-5 h-3.5 rounded-[2px] overflow-hidden" />
                  <span className="font-medium text-xs">{localeLabels[loc]}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
