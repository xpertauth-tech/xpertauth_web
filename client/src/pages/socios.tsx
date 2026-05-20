import { useState } from "react";
import { useTranslations } from "@/i18n/context";
import { useLocation } from "wouter";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

type FormState = "idle" | "loading" | "success" | "error";

const gradientStyle: React.CSSProperties = {
  background: "linear-gradient(135deg,#ffffff 0%,#4D9FEC 40%,#1B4FD8 70%,#ffffff 100%)",
  backgroundSize: "300% 300%",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  animation: "snGrad 6s ease infinite",
};

export default function Socios() {
  const { t, locale, messages } = useTranslations("socios");
  const [, navigate] = useLocation();
  const m = messages as any;

  const PLANES = m?.planes ?? [];

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipo_socio: "individual",
    empresa: "",
    mensaje: "",
    acepta_privacidad: false,
  });
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [planSeleccionado, setPlanSeleccionado] = useState("individual");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePlan = (id: string) => {
    setPlanSeleccionado(id);
    setForm(prev => ({ ...prev, tipo_socio: id }));
    document.getElementById("formulario-socio")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.acepta_privacidad) {
      setErrorMsg(t("formPrivacyError"));
      return;
    }
    setFormState("loading");
    setErrorMsg("");

    const { error } = await supabase.from("socios").insert([
      {
        nombre: form.nombre,
        email: form.email,
        telefono: form.telefono || null,
        tipo_socio: form.tipo_socio,
        empresa: form.empresa || null,
        mensaje: form.mensaje || null,
        acepta_privacidad: form.acepta_privacidad,
        estado: "pendiente",
      },
    ]);

    if (error) {
      setFormState("error");
      setErrorMsg(t("formError"));
    } else {
      fetch("/api/notify-socio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nombre: form.nombre, email: form.email, telefono: form.telefono, empresa: form.empresa, tipo_socio: form.tipo_socio, mensaje: form.mensaje }) }).catch(console.error);
      setFormState("success");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => navigate(`/${locale}`)}
              className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("backHome")}
            </button>

            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 text-white/50 text-xs font-medium tracking-widest uppercase mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-arctic inline-block" />
              {t("badge")}
            </span>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="text-pure">{t("title")}</span>
              <br />
              <span style={gradientStyle}>{t("titleHighlight")}</span>
            </h1>

            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Banner — Asociación en proceso de constitución */}
      <section className="pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-[#4D9FEC]/30 bg-[#4D9FEC]/5 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="text-3xl flex-shrink-0">🚧</div>
            <div>
              <p className="text-white font-bold text-base mb-1">
                {t("bannerTitle")}
              </p>
              <p className="text-white/60 text-sm leading-relaxed">
                {t("bannerDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planes */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {PLANES.map((plan: any, i: number) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={
                plan.id === "individual"
                  ? { y: -6, scale: 1.07, transition: { duration: 0.25, ease: "easeOut" } }
                  : { y: -8, scale: 1.03, transition: { duration: 0.25, ease: "easeOut" } }
              }
              className={`relative rounded-2xl p-8 flex flex-col cursor-pointer ${
                plan.id === "individual"
                  ? "bg-xpertblue border border-xpertblue shadow-2xl shadow-xpertblue/20 scale-105"
                  : "bg-white/5 border border-white/10"
              }`}
              style={{ willChange: "transform" }}
            >
              {plan.id === "individual" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-arctic text-obsidian text-xs font-bold px-3 py-1 rounded-full">
                    {t("mostPopular")}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-lg font-bold text-white mb-2 ${plan.id === "individual" ? "text-white/70" : "text-white/40"}`}>
                  {plan.nombre}
                </p>
              <p className={`text-sm mt-3 ${plan.id === "individual" ? "text-white/80" : "text-white/50"}`}>
                {plan.desc}
              </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.items.map((item: string) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className={`mt-0.5 text-lg leading-none ${plan.id === "individual" ? "text-white" : "text-arctic"}`}>
                      ✓
                    </span>
                    <span className={`text-sm ${plan.id === "individual" ? "text-white/90" : "text-white/60"}`}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlan(plan.id)}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  plan.id === "individual"
                    ? "bg-pure text-obsidian hover:bg-white/90"
                    : "bg-white/10 text-pure hover:bg-white/20 border border-white/10"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nota precios orientativos */}
        <div className="max-w-3xl mx-auto mt-8 text-center">
          <p className="text-white/50 text-xs leading-relaxed">{m?.pricingNote}</p>
        </div>

        {/* Distribución de la cuota */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-8">{t("quotaTitle")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {(m?.quota ?? []).map((item: any) => (
              <div key={item.pct} className="text-center">
                <p className="font-heading text-3xl font-bold text-arctic">{item.pct}</p>
                <p className="text-white/50 text-xs mt-2 leading-snug">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulario */}
      <section id="formulario-socio" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading text-3xl font-bold text-pure text-center mb-2">
              {t("formTitle")}
            </h2>
            <p className="text-white/50 text-center text-sm mb-10">
              {t("formSubtitle")}
            </p>

            {formState === "success" ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="font-heading text-xl font-bold text-pure mb-2">{t("successTitle")}</h3>
                <p className="text-white/60 text-sm mb-6">{t("successMessage")}</p>
                <button
                  onClick={() => navigate(`/${locale}`)}
                  className="inline-flex items-center gap-2 text-arctic hover:text-white transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("backHome")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Plan */}
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                    {t("formPlanLabel")}
                  </label>
                  <select
                    name="tipo_socio"
                    value={form.tipo_socio}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-pure text-sm focus:outline-none focus:border-arctic transition-colors"
                  >
                    {PLANES.map((plan: any) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                    {t("formNameLabel")} *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    placeholder={t("formNamePlaceholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-pure text-sm placeholder-white/20 focus:outline-none focus:border-arctic transition-colors"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder={t("formEmailPlaceholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-pure text-sm placeholder-white/20 focus:outline-none focus:border-arctic transition-colors"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                    {t("formPhoneLabel")} <span className="normal-case text-white/30">{t("formPhoneOptional")}</span>
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder={t("formPhonePlaceholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-pure text-sm placeholder-white/20 focus:outline-none focus:border-arctic transition-colors"
                  />
                </div>

                {/* Empresa (solo corporativo) */}
                {form.tipo_socio === "corporativo" && (
                  <div>
                    <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                      {t("formCompanyLabel")}
                    </label>
                    <input
                      type="text"
                      name="empresa"
                      value={form.empresa}
                      onChange={handleChange}
                      placeholder={t("formCompanyPlaceholder")}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-pure text-sm placeholder-white/20 focus:outline-none focus:border-arctic transition-colors"
                    />
                  </div>
                )}

                {/* Mensaje */}
                <div>
                  <label className="block text-xs text-white/50 uppercase tracking-widest mb-2">
                    {t("formMessageLabel")} <span className="normal-case text-white/30">{t("formPhoneOptional")}</span>
                  </label>
                  <textarea
                    name="mensaje"
                    value={form.mensaje}
                    onChange={handleChange}
                    rows={3}
                    placeholder={t("formMessagePlaceholder")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-pure text-sm placeholder-white/20 focus:outline-none focus:border-arctic transition-colors resize-none"
                  />
                </div>

                {/* Privacidad */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="acepta_privacidad"
                    id="acepta_privacidad"
                    checked={form.acepta_privacidad}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 accent-arctic"
                  />
                  <label htmlFor="acepta_privacidad" className="text-xs text-white/50 leading-relaxed">
                    {t("formPrivacy")}{" "}
                    <a href={`/${locale}/politica-de-privacidad`} className="text-arctic underline underline-offset-2">
                      {t("formPrivacyLink")}
                    </a>{" "}
                    {t("formPrivacyAnd")}{" "}
                    <a href={`/${locale}/aviso-legal`} className="text-arctic underline underline-offset-2">
                      {t("formTermsLink")}
                    </a>{" "}
                    {t("formPrivacyRequired")}
                  </label>
                </div>

                {errorMsg && (
                  <p className="text-red-400 text-xs">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="w-full py-4 bg-xpertblue text-pure font-semibold rounded-lg text-sm transition-all duration-200 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {formState === "loading" ? t("formSending") : t("formSubmit")}
                </button>

                <p className="text-white/30 text-xs text-center">
                  {t("formNote")}
                </p>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/${locale}`)}
                    className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs transition-colors"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    {t("backHome")}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
