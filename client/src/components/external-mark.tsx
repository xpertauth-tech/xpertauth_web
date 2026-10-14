import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "@/i18n/context";

const COARSE = "(pointer: coarse)";

// En pantallas táctiles el enlace externo se abre en la misma pestaña, para que "atrás" vuelva a XpertAuth.
export function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(() => typeof window !== "undefined" && window.matchMedia(COARSE).matches);
  useEffect(() => {
    const mq = window.matchMedia(COARSE);
    const onChange = () => setCoarse(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return coarse;
}

// Atributos de un enlace externo: pestaña nueva en ordenador, misma pestaña en móvil.
export function useExternalLinkProps() {
  const coarse = useCoarsePointer();
  return coarse
    ? { rel: "noopener noreferrer" }
    : { target: "_blank", rel: "noopener noreferrer" };
}

// Marca de enlace externo: icono ↗ opcional (hereda el color del texto) y aviso para lectores de pantalla.
export default function ExternalMark({ className = "w-4 h-4", icon = true }: { className?: string; icon?: boolean }) {
  const { t } = useTranslations("a11y");
  const coarse = useCoarsePointer();
  return (
    <>
      {icon && <ArrowUpRight className={`inline-block shrink-0 ${className}`} aria-hidden="true" />}
      <span className="sr-only"> ({t(coarse ? "externalSite" : "newTab")})</span>
    </>
  );
}
