import { useI18n } from "@/i18n/context";
import { useAgent } from "@/App";
import { AGENTE_CONFIG, type Idioma } from "./AgentChat";

// Franja de NOVA de la portada (segunda herramienta, más pequeña). Se conserva tal cual estaba dentro de
// «LEX en acción»; la rehace la Fase 3.

const texts: Record<Idioma, { novaCta: string; novaLine: string }> = {
  es: { novaCta: "Pregunta a NOVA", novaLine: "Ideas para usar la IA en tu empresa de transporte." },
  ca: { novaCta: "Pregunta a NOVA", novaLine: "Idees per usar la IA a la teva empresa de transport." },
  en: { novaCta: "Ask NOVA", novaLine: "Ideas for using AI in your transport business." },
  fr: { novaCta: "Demandez à NOVA", novaLine: "Des idées pour utiliser l'IA dans votre entreprise de transport." },
};

export default function NovaFranja() {
  const { locale } = useI18n();
  const { abrirAgente } = useAgent();
  const idioma: Idioma = locale === "ca" || locale === "en" || locale === "fr" ? locale : "es";
  const tx = texts[idioma];

  return (
    <div className="mt-14 md:mt-[72px] pt-7 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div
          className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
          style={{ backgroundColor: AGENTE_CONFIG.NOVA.colorBg, border: `1px solid ${AGENTE_CONFIG.NOVA.colorBorder}` }}
        >
          <img src={AGENTE_CONFIG.NOVA.avatar} alt="" width={64} height={64} loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </div>
        <div>
          <h3 className="t-h3 text-pure">NOVA</h3>
          <p className="t-small text-white/70 mt-0.5">{tx.novaLine}</p>
        </div>
      </div>
      <button onClick={() => abrirAgente("NOVA")} className="btn btn-secondary btn-small" data-testid="button-nova-accion">
        {tx.novaCta}
      </button>
    </div>
  );
}
