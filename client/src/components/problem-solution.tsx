import { motion } from "framer-motion";
import { Truck, Brain, Smartphone } from "lucide-react";
import { useTranslations } from "@/i18n/context";

const cardMeta = [
  { icon: Truck, color: "text-arctic", bgColor: "bg-arctic/10", borderColor: "border-arctic/20" },
  { icon: Brain, color: "text-xpertblue", bgColor: "bg-xpertblue/10", borderColor: "border-xpertblue/20" },
  { icon: Smartphone, color: "text-ember", bgColor: "bg-ember/10", borderColor: "border-ember/20" },
];

export default function ProblemSolution() {
  const { messages } = useTranslations("problemSolution");
  const cards = (messages as any).cards || [];

  return (
    <section id="problema-solucion" className="py-20 sm:py-28 bg-obsidian-light" data-testid="section-problema-solucion">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="text-arctic text-xs font-semibold tracking-widest uppercase">{(messages as any).label}</span>
          <h2 className="font-heading font-bold text-pure text-3xl sm:text-4xl mt-4">{(messages as any).title}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {cards.map((card: any, i: number) => {
            const meta = cardMeta[i];
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: i * 0.15 }} className={`group relative p-6 sm:p-8 rounded-xl border ${meta.borderColor} bg-white/[0.02] backdrop-blur-sm transition-all duration-500`} data-testid={`card-problem-${i}`}>
                <div className={`w-12 h-12 rounded-lg ${meta.bgColor} flex items-center justify-center mb-6`}>
                  <meta.icon className={`w-6 h-6 ${meta.color}`} />
                </div>
                <h3 className="font-heading font-semibold text-pure text-lg sm:text-xl mb-4 leading-snug">{card.problem}</h3>
                <div className="w-12 h-px bg-gradient-to-r from-white/20 to-transparent mb-4" />
                <p className="text-white/50 text-sm leading-relaxed">{card.solution}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
