import { createClient } from "@supabase/supabase-js";

// Cliente único de Supabase para toda la web (evita varias instancias de auth).
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Agente que el visitante quería abrir cuando se le pidió entrar con Google.
// Sobrevive a la redirección de OAuth para abrir su chat al volver.
const PENDING_AGENT_KEY = "xpertauth_pending_agent";

export type Agente = "LEX" | "NOVA";

export function guardarAgentePendiente(agente: Agente | null) {
  try {
    if (agente) sessionStorage.setItem(PENDING_AGENT_KEY, agente);
    else sessionStorage.removeItem(PENDING_AGENT_KEY);
  } catch {}
}

export function tomarAgentePendiente(): Agente | null {
  try {
    const v = sessionStorage.getItem(PENDING_AGENT_KEY);
    sessionStorage.removeItem(PENDING_AGENT_KEY);
    return v === "LEX" || v === "NOVA" ? v : null;
  } catch {
    return null;
  }
}

export async function entrarConGoogle(locale: string, agente: Agente | null) {
  guardarAgentePendiente(agente);
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/${locale}` },
  });
}
