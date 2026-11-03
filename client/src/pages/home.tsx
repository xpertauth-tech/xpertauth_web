import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import LexEnAccion from "@/components/lex-en-accion";
import TeamSection from "@/components/TeamSection";
import HowItWorks from "@/components/how-it-works";
import SocialProof from "@/components/social-proof";
import BlogSection from "@/components/blog";
import CtaFinal from "@/components/cta-final";
import Footer from "@/components/footer";
import { useSeo } from "@/lib/seo";

export default function Home() {
  useSeo("home");
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    // Esperamos a que los componentes estén montados antes de hacer scroll
    const timer = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <TeamSection />
        <LexEnAccion />
        <HowItWorks />
        <SocialProof />
        <BlogSection />
        <CtaFinal />
      </main>
      <Footer />
    </div>
  );
}
