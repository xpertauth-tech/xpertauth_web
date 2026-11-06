import { createClient } from "@supabase/supabase-js";

// Cliente único de Supabase para toda la web (evita varias instancias de auth).
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type Agente = "LEX" | "NOVA";

// Entrar con Google. Con agente, se vuelve a la página de ese agente (/<idioma>/lex o /nova);
// sin agente (botón «Regístrate»), a la portada del idioma.
export async function entrarConGoogle(locale: string, agente: Agente | null) {
  const ruta = agente ? `/${locale}/${agente.toLowerCase()}` : `/${locale}`;
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}${ruta}` },
  });
}
