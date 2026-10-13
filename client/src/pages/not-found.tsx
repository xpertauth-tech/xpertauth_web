import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { useTranslations } from "@/i18n/context";

export default function NotFound() {
  const { t, locale } = useTranslations("notFound");
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="page-top pb-16 md:pb-24 px-6 flex items-center justify-center" style={{ minHeight: "70vh" }}>
        <div className="max-w-xl mx-auto text-center">
          <h1 className="t-h2 text-pure title-gap">{t("title")}</h1>
          <p className="t-lead text-white/70 mb-8">{t("message")}</p>
          <button onClick={() => navigate(`/${locale}`)} className="btn btn-primary" data-testid="button-404-home">
            {t("button")}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
