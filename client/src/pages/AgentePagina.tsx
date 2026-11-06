import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ChatAgente, { AGENTE_CONFIG, AvisoLexRevision, TEXTOS, type Idioma } from "@/components/AgentChat";
import { useI18n } from "@/i18n/context";
import { useSeo } from "@/lib/seo";
import type { Agente } from "@/lib/supabase";

// Página propia de cada agente (/<idioma>/lex y /<idioma>/nova): cabecera con avatar, nombre y frase,
// y el chat a ancho completo debajo.
function AgentePagina({ agente }: { agente: Agente }) {
  useSeo(agente === "LEX" ? "lex" : "nova");
  const { locale } = useI18n();
  const idioma: Idioma = locale === "ca" || locale === "en" || locale === "fr" ? locale : "es";
  const t = TEXTOS[idioma];
  const config = AGENTE_CONFIG[agente];
  // En móvil el teclado reduce la pantalla visible: la página se ajusta a ella para que la caja de escribir no quede tapada.
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const ajustar = () => document.documentElement.style.setProperty("--alto-pantalla", `${vv.height}px`);
    ajustar();
    vv.addEventListener("resize", ajustar);
    return () => {
      vv.removeEventListener("resize", ajustar);
      document.documentElement.style.removeProperty("--alto-pantalla");
    };
  }, []);

  const frase = agente === "LEX" ? t.fraseLex : t.fraseNova;

  return (
    <div className="min-h-screen bg-obsidian text-pure font-sans">
      <Navbar />
      <main>
        <section
          className="px-4 sm:px-6 lg:px-8 pt-[68px] sm:pt-[84px] pb-4 bg-obsidian flex flex-col"
          style={{ height: "var(--alto-pantalla, 100dvh)", minHeight: 480 }}
        >
          <div className="w-full max-w-5xl mx-auto flex flex-col flex-1 min-h-0 gap-3 pt-3">
            <div className="flex items-center gap-4 flex-shrink-0">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden flex-shrink-0"
                style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
              >
                <img
                  src={config.avatarGrande}
                  alt={agente}
                  width={128}
                  height={128}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold leading-tight grad-title">{agente}</h1>
                <p className="text-sm sm:text-base text-white/70 leading-snug">{frase}</p>
              </div>
            </div>
            {agente === "LEX" && <AvisoLexRevision />}
            <ChatAgente agente={agente} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function LexPagina() {
  return <AgentePagina agente="LEX" />;
}

export function NovaPagina() {
  return <AgentePagina agente="NOVA" />;
}

export default AgentePagina;
