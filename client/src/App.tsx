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
import { useEffect, useState, createContext, useContext } from "react";
import { supabase, tomarAgentePendiente, type Agente } from "@/lib/supabase";
import SobreNosotros from "@/pages/SobreNosotros";
import TransporteEspecial from "@/pages/TransporteEspecial";
import IaPymes from "@/pages/IaPymes";
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

// ─── Router ───────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      <Route path="/:locale/servicios/ia-pymes" component={IaPymes} />
      <Route path="/:locale/servicios/transporte-especial" component={TransporteEspecial} />
      <Route path="/:locale/sobre-nosotros" component={SobreNosotros} />
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
