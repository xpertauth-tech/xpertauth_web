import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { db: { schema: "web" } }
);

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  nombre: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  mensaje: z.string().trim().min(1).max(5000),
});

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Formulario "Contacta con nosotros". Dos vías independientes: el correo a info@ (lo principal)
// y una copia en web.contacto (red de seguridad). Si una falla, la otra se hace igualmente.
// Siempre responde JSON; el visitante nunca ve texto técnico (lo traduce el cliente).
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).json({ ok: true });
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ ok: false });

  const { nombre, email, mensaje } = parsed.data;
  const ahora = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

  const enviarCorreo = async (): Promise<boolean> => {
    try {
      const { error } = await resend.emails.send({
        from: "XpertAuth <noreply@mail.xpertauth.com>",
        to: "info@xpertauth.com",
        replyTo: email,
        subject: `✉️ Nuevo mensaje de contacto — ${nombre}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <div style="background: #0A0E1A; padding: 20px 24px; border-radius: 10px 10px 0 0;">
              <h1 style="color: #4D9FEC; margin: 0; font-size: 20px;">✉️ Nuevo mensaje de contacto</h1>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; border: 1px solid #eee;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #666; width: 120px;">Nombre</td>
                  <td style="padding: 10px 0; color: #111; font-weight: 600;">${esc(nombre)}</td>
                </tr>
                <tr style="border-top: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Email</td>
                  <td style="padding: 10px 0;"><a href="mailto:${esc(email)}" style="color: #4D9FEC;">${esc(email)}</a></td>
                </tr>
                <tr style="border-top: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666;">Recibido</td>
                  <td style="padding: 10px 0; color: #111;">${ahora}</td>
                </tr>
                <tr style="border-top: 1px solid #eee;">
                  <td style="padding: 10px 0; color: #666; vertical-align: top;">Mensaje</td>
                  <td style="padding: 10px 0; color: #111; white-space: pre-wrap;">${esc(mensaje)}</td>
                </tr>
              </table>
              <p style="margin-top: 20px; color: #999; font-size: 12px;">
                Enviado desde el formulario de contacto de xpertauth.com. Puedes responder directamente a este correo.
              </p>
            </div>
          </div>
        `,
      });
      if (error) {
        console.error("[contacto] Resend error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[contacto] Resend excepción:", err);
      return false;
    }
  };

  const guardarCopia = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.from("contacto").insert({
        nombre,
        email,
        mensaje,
        leido: false,
        respondido: false,
        estado: "nuevo",
        tipo: "contacto_web",
      });
      if (error) {
        console.error("[contacto] Supabase error:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[contacto] Supabase excepción:", err);
      return false;
    }
  };

  const [correo, copia] = await Promise.all([enviarCorreo(), guardarCopia()]);
  console.log(`[contacto] correo=${correo ? "ok" : "FALLO"} copia=${copia ? "ok" : "FALLO"}`);

  if (!correo && !copia) return res.status(502).json({ ok: false });
  return res.status(201).json({ ok: true, correo, copia });
}
