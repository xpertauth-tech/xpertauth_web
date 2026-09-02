import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations, useI18n } from "@/i18n/context";

// Acento por tarjeta: 01 · LEX (arctic) — 02 · NOVA (xpertblue)
const accents = [
  {
    text: "text-arctic",
    numberBg: "bg-arctic/10",
    hoverBorder: "hover:border-arctic/40",
  },
  {
    text: "text-xpertblue",
    numberBg: "bg-xpertblue/10",
    hoverBorder: "hover:border-xpertblue/40",
  },
];

export default function Services() {
  const { messages } = useTranslations("services");
  const { locale } = useI18n();
  const m = messages as any;
  const items: any[] = m.items || [];

  return (
    <section id="servicios" className="bg-mist py-20 sm:py-28" data-testid="section-servicios">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-xpertblue text-xs font-semibold tracking-widest uppercase">
            {m.label}
          </span>
          <h2 className="font-heading font-bold text-obsidian text-3xl sm:text-4xl mt-4">
            {m.title}
          </h2>
          <p className="mt-4 text-obsidian/60 text-base max-w-2xl mx-auto leading-relaxed">
            {m.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item, i) => {
            const accent = accents[i] ?? accents[0];
            return (
              <motion.a
                key={item.num}
                href={`/${locale}${item.href}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`group flex flex-col rounded-2xl border border-obsidian/10 bg-pure p-8 sm:p-9 transition-all duration-300 ${accent.hoverBorder} hover:-translate-y-1 hover:shadow-[0_16px_44px_rgba(27,79,216,0.14)]`}
                data-testid={`card-service-${i}`}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className={`w-11 h-11 rounded-xl ${accent.numberBg} flex items-center justify-center font-heading font-bold text-sm ${accent.text}`}
                  >
                    {item.num}
                  </span>
                  <div className="leading-tight">
                    <span className={`font-heading font-bold text-lg ${accent.text}`}>{item.name}</span>
                    <span className="block text-obsidian/50 text-sm">{item.role}</span>
                  </div>
                </div>

                <p className="text-obsidian/70 text-sm sm:text-base leading-relaxed flex-grow">
                  {item.description}
                </p>

                <span className={`mt-6 inline-flex items-center gap-1.5 text-sm font-semibold ${accent.text}`}>
                  {item.name}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
