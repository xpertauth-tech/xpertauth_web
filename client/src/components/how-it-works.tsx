import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/i18n/context";

const SUPABASE_BASE = "https://supabase.xpertauth.com/storage/v1/object/public/web-images";

const stepImages = [
  `${SUPABASE_BASE}/como-funciona/paso1_registro_v1.webp`,
  `${SUPABASE_BASE}/como-funciona/paso2_ia-chat_v1.webp`,
  `${SUPABASE_BASE}/como-funciona/paso3_experto_v1.webp`,
  `${SUPABASE_BASE}/como-funciona/paso4_comunidad_v1.webp`,
];

const SCROLL_PER_STEP = 600;
const HEADER_SPACE = 220;
const STICKY_TOP = 0;

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
  const steps = m.steps || [];
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [slideProgress, setSlideProgress] = useState(0);
  const [hovered, setHovered] = useState(false);

  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const scrolled = Math.max(0, -rect.top - HEADER_SPACE);

    const totalSteps = 4;
    const rawStep = scrolled / SCROLL_PER_STEP;
    const currentStep = Math.min(totalSteps - 1, Math.floor(rawStep));
    const progress = rawStep - currentStep;

    setActiveStep(Math.max(0, Math.min(totalSteps - 1, currentStep)));
    setSlideProgress(Math.max(0, Math.min(1, progress)));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const [viewportH, setViewportH] = useState(800);
  useEffect(() => {
    const update = () => setViewportH(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalScrollHeight = HEADER_SPACE + SCROLL_PER_STEP * 3 + viewportH;

  const getCurrentTranslateX = () => {
    if (activeStep >= 3) return 0;
    return slideProgress * 100;
  };

  const currentX = getCurrentTranslateX();

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="bg-obsidian relative"
      style={{ height: totalScrollHeight }}
      data-testid="section-como-funciona"
    >
      <div className="sticky" style={{ top: STICKY_TOP, height: "100vh", overflow: "hidden" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian-light via-obsidian to-obsidian pointer-events-none" />

        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="pt-10 sm:pt-16 lg:pt-20 pb-3 sm:pb-6 text-center px-4 sm:px-6 lg:px-8">
            <span className="text-arctic text-xs font-semibold tracking-widest uppercase">
              {m.label}
            </span>
            <h2
              className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl mt-2 sm:mt-3"
              style={gradientStyle}
            >
              {m.title}
            </h2>
            <p className="mt-2 sm:mt-3 text-white/50 text-xs sm:text-sm lg:text-base max-w-xl mx-auto">
              {m.subtitle}
            </p>
          </div>

          {/* Contenido principal */}
          <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 min-h-0">
            {/* Imagen */}
            <div
              className="relative w-full overflow-hidden rounded-2xl border border-white/10 flex-shrink-0"
              style={{ aspectRatio: "16/9", maxHeight: "clamp(180px, 40vh, 420px)", maxWidth: "calc(clamp(180px, 40vh, 420px) * 16 / 9)" }}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              data-testid="step-image-container"
            >
              {stepImages.map((src, i) => {
                let translateX = 0;

                if (i < activeStep) {
                  translateX = -100;
                } else if (i === activeStep) {
                  translateX = 0;
                  if (activeStep < 3) {
                    translateX = -(currentX);
                  }
                } else if (i === activeStep + 1) {
                  translateX = 100 - currentX;
                } else {
                  translateX = 100;
                }

                return (
                  <div
                    key={i}
                    className="absolute inset-0"
                    style={{
                      transform: `translateX(${translateX}%)`,
                      transition: "transform 0.15s ease-out",
                      willChange: "transform",
                      zIndex: i === activeStep || (i === activeStep + 1 && currentX > 0) ? 2 : 1,
                    }}
                    data-testid={`step-image-${i}`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover object-center"
                      style={{
                        filter: hovered ? "grayscale(0)" : "grayscale(1)",
                        transition: "filter 0.4s ease-out",
                      }}
                    />
                    <div
                      className="absolute inset-0 bg-obsidian/30"
                      style={{
                        opacity: hovered ? 0 : 1,
                        transition: "opacity 0.4s ease-out",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            <div className="flex gap-2 mt-3 sm:mt-5 mb-3 sm:mb-4">
              {steps.map((_: any, i: number) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-500 ease-in-out"
                  style={{
                    width: i === activeStep ? 32 : 8,
                    backgroundColor: i === activeStep ? "rgb(77, 159, 236)" : "rgba(255,255,255,0.15)",
                  }}
                  data-testid={`step-dot-${i}`}
                />
              ))}
            </div>

            {/* Texto del paso */}
            <div className="w-[85%] sm:w-[80%] max-w-5xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="text-center"
                  data-testid={`step-info-${activeStep}`}
                >
                  <h3 className="font-heading text-[20px] sm:text-[24px] font-bold" style={{ color: "#FFFFFF" }}>
                    {steps[activeStep]?.title}
                  </h3>
                  <span className="text-[13px] sm:text-[14px] font-medium" style={{ color: "#4D9FEC" }}>
                    {steps[activeStep]?.subtitle}
                  </span>
                  <p className="mt-2 text-[14px] sm:text-[16px] max-w-lg mx-auto" style={{ color: "#CBD5E1", lineHeight: 1.6 }}>
                    {steps[activeStep]?.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
