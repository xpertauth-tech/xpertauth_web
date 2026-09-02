import { useEffect } from "react";
import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import TeamSection from "@/components/TeamSection";
import Services from "@/components/services";
import HowItWorks from "@/components/how-it-works";
import SocialProof from "@/components/social-proof";
import BlogSection from "@/components/blog";
import CtaFinal from "@/components/cta-final";
import Footer from "@/components/footer";

export default function Home() {
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
      <Hero />
      <TeamSection />
      <Services />
      <HowItWorks />
      <SocialProof />
      <BlogSection />
      <CtaFinal />
      <Footer />
    </div>
  );
}
