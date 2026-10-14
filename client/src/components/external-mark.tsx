import { ArrowUpRight } from "lucide-react";
import { useTranslations } from "@/i18n/context";

// Marca de enlace externo: icono ↗ opcional (hereda el color del texto) y aviso para lectores de pantalla.
export default function ExternalMark({ className = "w-4 h-4", icon = true }: { className?: string; icon?: boolean }) {
  const { t } = useTranslations("a11y");
  return (
    <>
      {icon && <ArrowUpRight className={`inline-block shrink-0 ${className}`} aria-hidden="true" />}
      <span className="sr-only"> ({t("newTab")})</span>
    </>
  );
}
