import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "@/i18n/context";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  const { t, locale } = useTranslations("contact");

  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const reset = () => {
    setForm({ nombre: "", email: "", mensaje: "" });
    setPrivacy(false);
    setStatus("idle");
    setErrorMsg("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) {
      setErrorMsg(t("errorRequired"));
      return;
    }
    if (!privacy) {
      setErrorMsg(t("errorPrivacy"));
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          email: form.email.trim(),
          mensaje: form.mensaje.trim(),
          acepta_privacidad: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("errorGeneric"));
      }

      setStatus("ok");
    } catch (err: any) {
      setErrorMsg(err.message || t("errorGeneric"));
      setStatus("error");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="relative w-full max-w-md bg-[#0F1628] border border-white/10 rounded-2xl p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Cerrar */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Estado OK */}
              {status === "ok" ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-arctic mx-auto mb-4" />
                  <h3 className="font-heading font-bold text-pure text-xl mb-2">{t("successTitle")}</h3>
                  <p className="text-white/60 text-sm">{t("successMessage")}</p>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2.5 bg-xpertblue hover:bg-xpertblue/90 text-pure text-sm font-semibold rounded-md transition-colors"
                  >
                    {t("close")}
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-heading font-bold text-pure text-xl mb-1">{t("title")}</h3>
                  <p className="text-white/50 text-sm mb-6">{t("subtitle")}</p>

                  <div className="space-y-4">
                    {/* Nombre */}
                    <div>
                      <label className="block text-white/70 text-xs font-medium mb-1.5">{t("nameLabel")}</label>
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder={t("namePlaceholder")}
                        className="w-full px-3 py-2.5 rounded-md bg-white/[0.05] border border-white/10 text-pure text-sm placeholder:text-white/30 focus:outline-none focus:border-arctic/50 transition-colors"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-white/70 text-xs font-medium mb-1.5">{t("emailLabel")}</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder={t("emailPlaceholder")}
                        className="w-full px-3 py-2.5 rounded-md bg-white/[0.05] border border-white/10 text-pure text-sm placeholder:text-white/30 focus:outline-none focus:border-arctic/50 transition-colors"
                      />
                    </div>

                    {/* Mensaje */}
                    <div>
                      <label className="block text-white/70 text-xs font-medium mb-1.5">{t("messageLabel")}</label>
                      <textarea
                        value={form.mensaje}
                        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                        placeholder={t("messagePlaceholder")}
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-md bg-white/[0.05] border border-white/10 text-pure text-sm placeholder:text-white/30 focus:outline-none focus:border-arctic/50 transition-colors resize-none"
                      />
                    </div>

                    {/* Privacidad */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div className="relative mt-0.5 flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={privacy}
                          onChange={(e) => setPrivacy(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border transition-colors ${
                          privacy
                            ? "bg-xpertblue border-xpertblue"
                            : "bg-white/5 border-white/20 group-hover:border-white/40"
                        }`}>
                          {privacy && (
                            <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="none" viewBox="0 0 12 12">
                              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-white/50 text-xs leading-relaxed">
                        {t("privacyText")}{" "}
                        <a href={`/${locale}/politica-de-privacidad`} className="text-arctic hover:underline">{t("privacyLink")}</a>
                      </span>
                    </label>

                    {/* Error */}
                    {errorMsg && (
                      <div className="flex items-center gap-2 text-red-400 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleSubmit}
                      disabled={status === "sending"}
                      className="w-full py-3 bg-xpertblue hover:bg-xpertblue/90 text-pure text-sm font-semibold rounded-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === "sending" ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {t("sending")}</>
                      ) : (
                        t("submit")
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
