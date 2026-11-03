import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/context";
import Home from "@/pages/home";
import CustomCursor from "@/components/CustomCursor";
import CookieBanner from "@/components/CookieBanner";
import AgentModal, { type ModalObjetivo } from "@/components/AgentModal";
import AgentChat from "@/components/AgentChat";
import { useEffect, useRef, useState, createContext, useContext, lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { supabase, tomarAgentePendiente, type Agente } from "@/lib/supabase";

// ─── Páginas (carga diferida: solo la portada va en el paquete inicial) ───────

const cargas = {
  SobreNosotros: () => import("@/pages/SobreNosotros"),
  MiHistoria: () => import("@/pages/MiHistoria"),
  TransporteEspecial: () => import("@/pages/TransporteEspecial"),
  Blog: () => import("@/pages/Blog"),
  BlogPost: () => import("@/pages/BlogPost"),
  Newsletter: () => import("@/pages/Newsletter"),
  NewsletterPost: () => import("@/pages/NewsletterPost"),
  PoliticaPrivacidad: () => import("@/pages/PoliticaPrivacidad"),
  AvisoLegal: () => import("@/pages/AvisoLegal"),
  PoliticaCookies: () => import("@/pages/PoliticaCookies"),
  NotFound: () => import("@/pages/not-found"),
};

const SobreNosotros = lazy(cargas.SobreNosotros);
const MiHistoria = lazy(cargas.MiHistoria);
const TransporteEspecial = lazy(cargas.TransporteEspecial);
const Blog = lazy(cargas.Blog);
const BlogPost = lazy(cargas.BlogPost);
const Newsletter = lazy(cargas.Newsletter);
const NewsletterPost = lazy(cargas.NewsletterPost);
const PoliticaPrivacidad = lazy(cargas.PoliticaPrivacidad);
const AvisoLegal = lazy(cargas.AvisoLegal);
const PoliticaCookies = lazy(cargas.PoliticaCookies);
const NotFound = lazy(cargas.NotFound);

// Con la portada ya pintada y el navegador libre, se descargan el resto de páginas
// para que navegar sea instantáneo, sin pantalla en blanco entre página y página.
function precargarPaginas() {
  Object.values(cargas).forEach((cargar) => { cargar().catch(() => {}); });
}
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    const ric = (window as unknown as { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => void }).requestIdleCallback;
    if (ric) ric(precargarPaginas, { timeout: 4000 });
    else window.setTimeout(precargarPaginas, 2500);
  }, { once: true });
}

// ─── Contexto del agente (accesible desde cualquier componente) ───────────────

interface AgentContextType {
  abrirAgente: (agente: Agente) => void;
  abrirRegistro: () => void;
}

export const AgentContext = createContext<AgentContextType>({
  abrirAgente: () => {},
  abrirRegistro: () => {},
});

export function useAgent() {
  return useContext(AgentContext);
}

// ─── Auth callback ────────────────────────────────────────────────────────────

function AuthCallback() {
  useEffect(() => {
    if (window.location.hash.includes("access_token")) {
      supabase.auth.getSession().then(() => {
        window.history.replaceState(null, "", window.location.pathname);
      });
    }
  }, []);
  return null;
}

// ─── Posición de la página al navegar ─────────────────────────────────────────
// Al cambiar de página se abre arriba del todo (no al cambiar solo de idioma ni al recargar).
// Si el enlace trae ancla (p. ej. #blog), se coloca en esa sección; la ancla debe ser un id simple.

function ScrollManager() {
  const [location] = useLocation();
  const anterior = useRef<string | null>(null);
  useEffect(() => {
    const pagina = location.replace(/^\/(es|ca|en|fr)(?=\/|$)/, "");
    if (anterior.current !== null && anterior.current !== pagina) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    }
    anterior.current = pagina;

    const hash = window.location.hash;
    if (!/^#[\w-]+$/.test(hash)) return;
    let intentos = 0;
    const ir = () => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      else if (intentos++ < 20) window.setTimeout(ir, 50);
    };
    ir();
  }, [location]);
  return null;
}

// ─── Router ───────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Suspense fallback={null}>
    <Switch>
      <Route path="/:locale/servicios/transporte-especial" component={TransporteEspecial} />
      <Route path="/:locale/sobre-nosotros" component={SobreNosotros} />
      <Route path="/:locale/mi-historia" component={MiHistoria} />
      <Route path="/:locale/blog/:slug" component={BlogPost} />
      <Route path="/:locale/blog" component={Blog} />
      <Route path="/:locale/newsletter/:concept_id" component={NewsletterPost} />
      <Route path="/:locale/newsletter" component={Newsletter} />
      <Route path="/:locale/politica-de-privacidad" component={PoliticaPrivacidad} />
      <Route path="/:locale/aviso-legal" component={AvisoLegal} />
      <Route path="/:locale/cookies" component={PoliticaCookies} />
      <Route path="/:locale" component={Home} />
      <Route path="/">
        <Redirect to="/es" />
      </Route>
      <Route component={NotFound} />
    </Switch>
    </Suspense>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  const [agenteModal, setAgenteModal] = useState<ModalObjetivo | null>(null);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [agenteChat, setAgenteChat] = useState<Agente>("LEX");
  const [esAutenticado, setEsAutenticado] = useState(false);

  useEffect(() => {
    // Al volver de Google se abre el chat del agente que el visitante había pedido.
    function alHaySesion() {
      setEsAutenticado(true);
      setAgenteModal(null);
      const pendiente = tomarAgentePendiente();
      if (pendiente) {
        setAgenteChat(pendiente);
        setChatAbierto(true);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) alHaySesion();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        alHaySesion();
      } else {
        setEsAutenticado(false);
        setChatAbierto(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  function abrirAgente(agente: Agente) {
    setAgenteChat(agente);
    if (esAutenticado) {
      setChatAbierto(true);
    } else {
      setAgenteModal(agente);
    }
  }

  function abrirRegistro() {
    setAgenteModal("registro");
  }

  function handleSesionRequerida() {
    setChatAbierto(false);
    setAgenteModal(agenteChat);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <AgentContext.Provider value={{ abrirAgente, abrirRegistro }}>
            <AuthCallback />
            <ScrollManager />
            <CustomCursor />
            <CookieBanner />
            <Toaster />
            <Router />

            <AgentModal
              agente={agenteModal}
              onClose={() => setAgenteModal(null)}
            />

            <AgentChat
              abierto={chatAbierto}
              agente={agenteChat}
              onClose={() => setChatAbierto(false)}
              onSesionRequerida={handleSesionRequerida}
            />
          </AgentContext.Provider>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
