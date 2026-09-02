import { motion } from "framer-motion";
import { useTranslations } from "@/i18n/context";

const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

export default function HowItWorks() {
  const { messages } = useTranslations("howItWorks");
  const m = messages as any;
  const steps: any[] = m.steps || [];

  return (
    <section id="como-funciona" className="bg-obsidian py-20 sm:py-28" data-testid="section-como-funciona">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-arctic text-xs font-semibold tracking-widest uppercase">
            {m.label}
          </span>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl mt-4" style={gradientStyle}>
            {m.title}
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="flex flex-col"
              data-testid={`step-${i}`}
            >
              <span className="font-heading font-bold text-arctic/90 text-3xl">{step.num}</span>
              <span className="mt-1 block h-px w-10 bg-arctic/30" />
              <h3 className="font-heading font-semibold text-pure text-lg mt-5 mb-2">
                {step.title}
              </h3>
              <p className="text-white/55 text-sm leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        {m.closingNote && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-14 text-center text-white/40 text-xs sm:text-sm max-w-xl mx-auto"
          >
            {m.closingNote}
          </motion.p>
        )}
      </div>
    </section>
  );
}
