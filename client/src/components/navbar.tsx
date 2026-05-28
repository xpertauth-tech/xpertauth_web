import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/i18n/context";
import { useLocation } from "wouter";
import LocaleSwitcher from "./locale-switcher";
import { createClient } from "@supabase/supabase-js";

const LOGO_URL = "https://dcuvptwwtdhlepvcttvx.supabase.co/storage/v1/object/public/web-images/logo/logo_xpertauth_icon_v1.png";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type UserProfile = {
  email: string;
  nombre: string;
  avatar_url?: string;
  plan?: string;
  creditos?: number;
};

export default function Navbar() {
  const { t, locale } = useTranslations("nav");
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [creditosNavbar, setCreditosNavbar] = useState<number | null>(null);

  const isHome = window.location.pathname === `/${locale}` || window.location.pathname === `/${locale}/`;

  const navLinks = [
    { label: t("servicios"), href: "#servicios" },
    { label: t("comoFunciona"), href: "#como-funciona" },
    { label: t("formacionSenior"), href: "#formacion-senior" },
    { label: t("blog"), href: "#blog" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email ?? "";
        setUser({
          email,
          nombre: session.user.user_metadata?.full_name ?? email,
          avatar_url: session.user.user_metadata?.avatar_url,
        });
        // Consultar créditos y plan
        supabase
          .from("perfiles")
          .select("plan, creditos")
          .eq("email", email)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(prev => prev ? { ...prev, plan: data.plan, creditos: data.creditos } : prev);
              if (data.plan !== "corporativo") setCreditosNavbar(data.creditos);
            }
          });
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const email = session.user.email ?? "";
        setUser({
          email,
          nombre: session.user.user_metadata?.full_name ?? email,
          avatar_url: session.user.user_metadata?.avatar_url,
        });
        // Consultar créditos y plan
        supabase
          .from("perfiles")
          .select("plan, creditos")
          .eq("email", email)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser(prev => prev ? { ...prev, plan: data.plan, creditos: data.creditos } : prev);
              if (data.plan !== "corporativo") setCreditosNavbar(data.creditos);
            }
          });
        if (window.location.hash.includes("access_token")) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setCreditosNavbar(null);
      }
    });

    // Escuchar actualizaciones de créditos desde el chat
    const handleCreditUpdate = (e: Event) => {
      const creditos = (e as CustomEvent).detail?.creditos;
      if (typeof creditos === "number" && creditos >= 0) {
        setCreditosNavbar(creditos);
      }
    };
    window.addEventListener("xpertauth:creditos", handleCreditUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("xpertauth:creditos", handleCreditUpdate);
    };
  }, []);

  const handleNavLink = (href: string) => {
    setMobileOpen(false);
    if (isHome) {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/${locale}` + href);
    }
  };

  const handleLogoClick = () => {
    if (isHome) {
      const el = document.querySelector("#hero");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/${locale}`);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://xpertauth.com/es",
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserMenuOpen(false);
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-8 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-obsidian/95 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-obsidian"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">

          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 group"
            data-testid="link-logo"
            aria-label="XpertAuth - Inicio"
          >
            {logoLoaded ? (
              <img
                src={LOGO_URL}
                alt="XpertAuth"
                className="h-9 w-auto object-contain"
                style={{ maxHeight: "36px" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; setLogoLoaded(false); }}
              />
            ) : (
              <img
                src={LOGO_URL}
                alt="XpertAuth"
                className="h-9 w-auto object-contain"
                style={{ maxHeight: "36px" }}
                onLoad={() => setLogoLoaded(true)}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <span className="font-heading font-semibold text-pure text-lg">
              Xpert<span className="text-arctic">Auth</span>
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavLink(link.href)}
                className="px-4 py-2 text-sm text-white/70 font-medium transition-colors duration-200 rounded-md hover:text-white"
                data-testid={`link-${link.href.replace("#", "")}`}
              >
                {link.label}
              </button>
            ))}

            <LocaleSwitcher />

            {!authLoading && (
              user ? (
                <div className="relative ml-3">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
                    data-testid="button-user-menu"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.nombre}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-xpertblue flex items-center justify-center text-xs font-bold text-white">
                        {getInitials(user.nombre)}
                      </div>
                    )}
                    <span className="text-sm text-white/80 font-medium max-w[120px] truncate">
                      {user.nombre.split(" ")[0]}
                    </span>
                    {/* Contador de créditos */}
                    {creditosNavbar !== null && (
                      <span
                        className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: creditosNavbar <= (user.plan === "gratuito" ? 10 : 100)
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(255,255,255,0.08)",
                          color: creditosNavbar <= (user.plan === "gratuito" ? 10 : 100)
                            ? "#f87171"
                            : "rgba(255,255,255,0.40)",
                          border: `1px solid ${creditosNavbar <= (user.plan === "gratuito" ? 10 : 100)
                            ? "rgba(239,68,68,0.30)"
                            : "rgba(255,255,255,0.10)"}`,
                        }}
                      >
                        {creditosNavbar} cr.
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-2 w-48 bg-[#0F1628] border border-white/10 rounded-lg shadow-xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-xs text-white/50 truncate">{user.email}</p>
                          {creditosNavbar !== null && (
                            <p className="text-xs mt-1"
                              style={{ color: creditosNavbar <= (user.plan === "gratuito" ? 10 : 100) ? "#f87171" : "rgba(255,255,255,0.30)" }}
                            >
                              {creditosNavbar} créditos disponibles
                            </p>
                          )}
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                          data-testid="button-logout"
                        >
                          Cerrar sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2 ml-3">
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white/70 font-medium border border-white/20 rounded-md hover:border-white/40 hover:text-white transition-all duration-200"
                    data-testid="button-google-login"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {t("entrar")}
                  </button>
                </div>
              )
            )}
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
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavLink(link.href)}
                  className="block w-full text-left px-4 py-3 rounded-md text-sm font-medium text-white/70 transition-colors"
                  data-testid={`link-mobile-${link.href.replace("#", "")}`}
                >
                  {link.label}
                </button>
              ))}

              {!authLoading && (
                <div className="pt-2 border-t border-white/10 mt-2">
                  {user ? (
                    <div className="space-y-1">
                      <div className="px-4 py-2 text-xs text-white/40">{user.email}</div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 rounded-md text-sm text-white/70"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleGoogleLogin}
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-md text-sm font-medium text-white/70 border border-white/20"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      {t("entrar")}
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
