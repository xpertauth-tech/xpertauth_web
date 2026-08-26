import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { useTranslations } from "@/i18n/context";

const SOCIAL_URL = "https://social.xpertauth.com";

const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

export default function SeniorTraining() {
  const { messages } = useTranslations("seniorTraining");
  const m = messages as any;

  return (
    <section id="formacion-senior" className="py-20 sm:py-28 bg-obsidian" data-testid="section-senior-training">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ember/15 mb-6">
            <Heart className="w-4 h-4 text-ember" />
            <span className="text-ember text-xs font-bold tracking-wide uppercase">{m.badge}</span>
          </div>

          <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight" style={gradientStyle}>
            {m.title}
          </h2>

          <p className="mt-6 text-white/60 text-lg leading-relaxed">{m.body}</p>

          <a
            href={SOCIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 inline-flex items-center gap-2 px-8 py-3.5 bg-ember text-pure font-semibold rounded-md text-sm sm:text-base transition-all duration-300"
            data-testid="button-senior-training-social"
          >
            {m.button}
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
