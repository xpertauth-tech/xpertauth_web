import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/i18n/context";
import WaitlistModal from "./waitlist-modal";

const planTypes = ["free", "individual", "corporate"] as const;

export default function Pricing() {
  const { messages } = useTranslations("pricing");
  const m = messages as any;
  const plans = m.plans || [];
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTipo, setModalTipo] = useState<"gratuito" | "individual">("gratuito");

  const handlePlanClick = (type: string) => {
    if (type === "free") {
      setModalTipo("gratuito");
      setModalOpen(true);
    } else if (type === "individual") {
      setModalTipo("individual");
      setModalOpen(true);
    } else if (type === "corporate") {
      const contactSection = document.getElementById("contacto");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section id="hazte-socio" className="py-20 sm:py-28 bg-obsidian relative" data-testid="section-pricing">
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian-light/50 to-obsidian pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="text-arctic text-xs font-semibold tracking-widest uppercase">{m.label}</span>
          <h2 className="font-heading font-bold text-pure text-3xl sm:text-4xl mt-4">{m.title}</h2>
          <p className="mt-4 text-white/50 text-base max-w-xl mx-auto">{m.subtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
          {plans.map((plan: any, i: number) => {
            const isPopular = i === 1;
            const type = planTypes[i];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }}
                className={`relative rounded-xl border-2 ${isPopular ? "border-xpertblue bg-xpertblue/[0.05]" : "border-white/10 bg-white/[0.02]"} p-6 sm:p-8 flex flex-col ${isPopular ? "md:-mt-4 md:mb-0 md:pb-12" : ""}`}
                data-testid={`card-plan-${type}`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-xpertblue text-pure text-xs font-bold rounded-full uppercase tracking-wider">
                      <Star className="w-3 h-3" />{m.popular}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-heading font-semibold text-pure text-lg">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-heading font-bold text-pure text-4xl">{plan.price}</span>
                    <span className="text-white/40 text-sm">{plan.period}</span>
                  </div>
                  <p className="mt-3 text-white/40 text-sm">{plan.description}</p>
                </div>
                <div className="flex-grow space-y-3 mb-8">
                  {(plan.features || []).map((feature: string, j: number) => (
                    <div key={j} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-arctic mt-0.5 flex-shrink-0" />
                      <span className="text-white/60 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => handlePlanClick(type)}
                  className={`w-full py-3 rounded-md font-semibold text-sm transition-all duration-200 ${isPopular ? "bg-xpertblue hover:bg-xpertblue/90 text-pure" : "border border-white/20 text-pure/80 hover:border-white/40 hover:text-pure"}`}
                  data-testid={`button-plan-${type}`}
                >{plan.cta}</button>
              </motion.div>
            );
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
            <span className="text-white/40 text-xs">{m.distribution?.label}</span>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="text-ember text-xs font-mono font-medium">{m.distribution?.seniors}</span>
              <span className="text-white/20">|</span>
              <span className="text-arctic text-xs font-mono font-medium">{m.distribution?.tech}</span>
              <span className="text-white/20">|</span>
              <span className="text-white/50 text-xs font-mono font-medium">{m.distribution?.admin}</span>
              <span className="text-white/20">|</span>
              <span className="text-white/50 text-xs font-mono font-medium">{m.distribution?.reserve}</span>
            </div>
          </div>
        </motion.div>
      </div>
      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} tipo={modalTipo} />
    </section>
  );
}
