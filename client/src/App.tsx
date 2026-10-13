import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n/context";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";
import CustomCursor from "@/components/CustomCursor";
import CookieBanner from "@/components/CookieBanner";
import AgentModal, { type ModalObjetivo } from "@/components/AgentModal";
import AgentChat from "@/components/AgentChat";
import { useEffect, useRef, useState, createContext, useContext } from "react";
import { useLocation } from "wouter";
import { supabase, tomarAgentePendiente, type Agente } from "@/lib/supabase";
import SobreNosotros from "@/pages/SobreNosotros";
import MiHistoria from "@/pages/MiHistoria";
import TransporteEspecial from "@/pages/TransporteEspecial";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Newsletter from "@/pages/Newsletter";
import NewsletterPost from "@/pages/NewsletterPost";
import PoliticaPrivacidad from "@/pages/PoliticaPrivacidad";
import AvisoLegal from "@/pages/AvisoLegal";
import PoliticaCookies from "@/pages/PoliticaCookies";

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
// Si el enlace trae ancla (#historia), se coloca en esa sección; la ancla debe ser un id simple.

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
