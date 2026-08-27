import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Users, MapPin, Clock, Smartphone } from "lucide-react";
import { useTranslations } from "@/i18n/context";

const SUPABASE_BASE = "https://supabase.xpertauth.com/storage/v1/object/public/web-images";

const featureIcons = [Users, MapPin, Clock, Smartphone];

const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, target, duration]);
  return count;
}

function AnimatedStats({ stats }: { stats: { value: number; suffix: string; label: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setActive(true); },
      { threshold: 0.4 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {stats.map((s, i) => {
        const count = useCountUp(s.value, 1200, active);
        return (
          <div
            key={i}
            className={`flex items-center gap-6 px-8 py-6 ${i < stats.length - 1 ? "border-b border-white/10" : ""}`}
          >
            <div className="font-heading font-bold text-5xl sm:text-6xl text-ember w-36 text-right flex-shrink-0 tabular-nums">
              {count}{s.suffix}
            </div>
            <div className="w-px h-12 bg-white/10 flex-shrink-0" />
            <p className="text-white/60 text-sm sm:text-base leading-snug">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}

function SeniorContactForm({ m }: { m: any }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  const handleSubmit = async () => {
    if (!nombre.trim() || !telefono.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/leads-senior", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setNombre("");
      setTelefono("");
    } catch {
      setStatus("error");
    }
  };

  if (status === "ok") {
    return (
      <div className="flex items-center gap-2 text-ember text-sm font-medium py-2">
        <Heart className="w-4 h-4" />
        {m.successMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        placeholder={m.namePlaceholder}
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-ember/60 transition-colors"
      />
      <input
        type="tel"
        placeholder={m.phonePlaceholder}
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-ember/60 transition-colors"
      />
      <button
        onClick={handleSubmit}
        disabled={status === "sending" || !nombre.trim() || !telefono.trim()}
        className="px-5 py-2.5 bg-xpertblue text-pure font-semibold rounded-md text-sm transition-all duration-300 whitespace-nowrap disabled:cursor-not-allowed"
      >
        {status === "sending" ? m.sending : m.submitButton}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-xs mt-1 w-full">{m.errorMessage}</p>
      )}
    </div>
  );
}

function MarqueeCard({ item }: { item: { name: string; image: string; quote: string } }) {
  return (
    <div
      className="flex-shrink-0 w-[300px] sm:w-[340px] bg-white/5 rounded-2xl border border-white/10 p-5 flex gap-4 items-start"
      data-testid={`marquee-card-${item.name.toLowerCase()}`}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-16 h-16 rounded-full object-cover border-2 border-ember/40 flex-shrink-0"
      />
      <div className="min-w-0">
        <span className="font-heading font-bold text-white text-sm">{item.name}</span>
        <p className="mt-1 text-white/50 text-[13px] leading-relaxed">{item.quote}</p>
      </div>
    </div>
  );
}

function Marquee({ marqueeData }: { marqueeData: { name: string; quote: string }[] }) {
  const itemsWithImages = marqueeData.map((item) => ({
    ...item,
    image: `${SUPABASE_BASE}/senior-training/senior_${item.name.toLowerCase()}_v1.webp`,
  }));
  const doubled = [...itemsWithImages, ...itemsWithImages];
  return (
    <div className="relative overflow-hidden py-2" data-testid="senior-marquee">
      <div className="flex gap-5 animate-marquee" style={{ width: "max-content" }}>
        {doubled.map((item, i) => (
          <MarqueeCard key={`${item.name}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}

export default function SeniorTraining() {
  const { t, messages } = useTranslations("seniorTraining");
  const m = messages as any;
  const features = m.features || [];

  return (
    <section id="formacion-senior" className="py-20 sm:py-28 bg-obsidian relative" data-testid="section-senior-training">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">

          {/* Columna izquierda — texto */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ember/15 mb-6">
              <Heart className="w-4 h-4 text-ember" />
              <span className="text-ember text-xs font-bold tracking-wide uppercase">{m.badge}</span>
            </div>

            <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
              <span style={gradientStyle}>{m.title1}</span>
              <br />
              <span className="text-ember">{m.title2}</span>
            </h2>

            <p className="mt-6 text-white/60 text-lg leading-relaxed">{m.description}</p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              {features.map((f: string, i: number) => {
                const Icon = featureIcons[i];
                return (
                  <div key={i} className="flex items-center gap-3" data-testid={`feature-senior-${i}`}>
                    <div className="w-10 h-10 rounded-lg bg-ember/15 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-ember" />
                    </div>
                    <span className="text-white/70 text-sm font-medium">{f}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 space-y-4">
              <span className="inline-flex px-5 py-2.5 bg-ember text-white font-bold rounded-md text-sm uppercase tracking-wider">
                {m.free}
              </span>

              <div className="pt-4">
                <p className="text-white/90 text-sm mb-3">{m.contactTitle}</p>
                <SeniorContactForm m={m} />
              </div>
            </div>
          </motion.div>

          {/* Columna derecha — contador animado */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <AnimatedStats stats={m.stats ?? []} />
          </motion.div>

        </div>
      </div>

      {/* Marquee de alumnos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
      >
        <Marquee marqueeData={m.marquee ?? []} />
      </motion.div>
    </section>
  );
}
