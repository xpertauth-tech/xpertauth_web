import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/i18n/context";
import LocaleSwitcher from "./locale-switcher";

const LOGO_URL = "https://dcuvptwwtdhlepvcttvx.supabase.co/storage/v1/object/public/web-images/logo/logo_xpertauth_icon_v1.png";

export default function Navbar() {
  const { t } = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

  const navLinks = [
    { label: t("servicios"), href: "#servicios" },
    { label: t("comoFunciona"), href: "#como-funciona" },
    { label: t("formacionSenior"), href: "#formacion-senior" },
    { label: t("blog"), href: "#blog" },
    { label: t("hazteSocio"), href: "#hazte-socio" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-obsidian/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-obsidian"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <button
            onClick={() => scrollTo("#hero")}
            className="flex items-center gap-2 group"
            data-testid="link-logo"
            aria-label="XpertAuth - Inicio"
          >
            <img
              src={LOGO_URL}
              alt="XpertAuth"
              className="h-9 w-auto object-contain"
              style={{ maxHeight: "36px" }}
              onLoad={() => setLogoLoaded(true)}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; setLogoLoaded(false); }}
            />
            {!logoLoaded && (
              <div className="w-8 h-8 rounded-md bg-xpertblue flex items-center justify-center">
                <span className="font-heading font-bold text-pure text-sm">X</span>
              </div>
            )}
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.slice(0, -1).map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm text-white/70 font-medium transition-colors duration-200 rounded-md"
                data-testid={`link-${link.href.replace("#", "")}`}
              >
                {link.label}
              </button>
            ))}
            <LocaleSwitcher />
            <button
              onClick={() => scrollTo("#hazte-socio")}
              className="ml-3 px-5 py-2.5 bg-xpertblue text-pure text-sm font-semibold rounded-md transition-all duration-200"
              data-testid="button-hazte-socio-nav"
            >
              {t("hazteSocio")}
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LocaleSwitcher />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-white/80"
              data-testid="button-mobile-menu"
              aria-label="Abrir menú"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-obsidian border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <button
                  key={link.href}
                  onClick={() => scrollTo(link.href)}
                  className={`block w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                    i === navLinks.length - 1
                      ? "bg-xpertblue text-pure text-center mt-3"
                      : "text-white/70"
                  }`}
                  data-testid={`link-mobile-${link.href.replace("#", "")}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
