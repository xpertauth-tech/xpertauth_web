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
import AgentModal from "@/components/AgentModal";
import AgentChat from "@/components/AgentChat";
import { useEffect, useState, createContext, useContext } from "react";
import { createClient } from "@supabase/supabase-js";
import SobreNosotros from "@/pages/SobreNosotros";
import TransporteEspecial from "@/pages/TransporteEspecial";
import IaPymes from "@/pages/IaPymes";
import FormacionSenior from "@/pages/FormacionSenior";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Newsletter from "@/pages/Newsletter";
import NewsletterPost from "@/pages/NewsletterPost";
import PoliticaPrivacidad from "@/pages/PoliticaPrivacidad";
import AvisoLegal from "@/pages/AvisoLegal";
import PoliticaCookies from "@/pages/PoliticaCookies";

// ─── Supabase ─────────────────────────────────────────────────────────────────

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Contexto del agente (accesible desde cualquier componente) ───────────────

type Agente = "LEX" | "NOVA";

interface AgentContextType {
  abrirAgente: (agente: Agente) => void;
}

export const AgentContext = createContext<AgentContextType>({
  abrirAgente: () => {},
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
      <Route path="/:locale/servicios/formacion-senior" component={FormacionSenior} />
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
  const [agenteModal, setAgenteModal] = useState<Agente | null>(null);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [agenteChat, setAgenteChat] = useState<Agente>("LEX");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [emailUsuario, setEmailUsuario] = useState("");
  const [esAutenticado, setEsAutenticado] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setEsAutenticado(true);
        setNombreUsuario(data.session.user.user_metadata?.full_name || "");
        setEmailUsuario(data.session.user.email || "");
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setEsAutenticado(true);
        setNombreUsuario(session.user.user_metadata?.full_name || "");
        setEmailUsuario(session.user.email || "");
      } else {
        setEsAutenticado(false);
        setNombreUsuario("");
        setEmailUsuario("");
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

  function handleModalConfirm(nombre: string, email: string) {
    setNombreUsuario(nombre);
    setEmailUsuario(email);
    setAgenteModal(null);
    setChatAbierto(true);
  }

  function handleLimiteAlcanzado() {
    setChatAbierto(false);
    setAgenteModal(agenteChat);
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <I18nProvider>
          <AgentContext.Provider value={{ abrirAgente }}>
            <AuthCallback />
            <CustomCursor />
            <CookieBanner />
            <Toaster />
            <Router />

            <AgentModal
              agente={agenteModal}
              onConfirm={handleModalConfirm}
              onClose={() => setAgenteModal(null)}
            />

            <AgentChat
              abierto={chatAbierto}
              agente={agenteChat}
              nombre={nombreUsuario}
              email={emailUsuario}
              esAutenticado={esAutenticado}
              onClose={() => setChatAbierto(false)}
              onLimiteAlcanzado={handleLimiteAlcanzado}
            />
          </AgentContext.Provider>
        </I18nProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
