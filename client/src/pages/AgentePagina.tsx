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
  const frase = agente === "LEX" ? t.fraseLex : t.fraseNova;

  return (
    <div className="min-h-screen bg-obsidian text-pure font-sans">
      <Navbar />
      <main>
        <section className="cabecera-corta px-4 sm:px-6 lg:px-8 bg-obsidian">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden mb-6"
              style={{ backgroundColor: config.colorBg, border: `1px solid ${config.colorBorder}` }}
            >
              <img
                src={config.avatarGrande}
                alt={agente}
                width={256}
                height={256}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="t-h1 grad-title mb-4">{agente}</h1>
            <p className="t-lead text-white/70 max-w-2xl mx-auto">{frase}</p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 bg-obsidian">
          <div className="max-w-4xl mx-auto space-y-4">
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
