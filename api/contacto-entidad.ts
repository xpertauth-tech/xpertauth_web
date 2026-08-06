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
  nombre: z.string().min(1),
  email: z.string().email(),
  empresa: z.string().optional(),
  tipo: z.string().optional(),
  mensaje: z.string().optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido." });

  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Nombre y email son obligatorios." });
    }

    const { nombre, email, empresa, tipo, mensaje } = parsed.data;
    const ahora = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });
    const mensajeFinal = mensaje || `Entidad: ${empresa || "no especificada"} · Tipo: ${tipo || "no especificado"}`;

    // ── INSERT en Supabase ────────────────────────────────────────────────────
    const { error } = await supabase
      .from("contacto")
      .insert({
        nombre,
        email,
        mensaje: mensajeFinal,
        leido: false,
        respondido: false,
        estado: "nuevo",
        tipo: tipo || "entidad_formacion_senior",
      });

    if (error) {
      console.error("[contacto-entidad] Supabase error:", error);
      return res.status(500).json({ error: "Error al enviar. Inténtalo de nuevo." });
    }

    // ── Email de aviso a José Luis ────────────────────────────────────────────
    await resend.emails.send({
      from: "XpertAuth <noreply@mail.xpertauth.com>",
      to: "info@xpertauth.com",
      subject: `🏛️ Nueva entidad interesada — ${empresa || nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #0A0E1A; padding: 20px 24px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #4D9FEC; margin: 0; font-size: 20px;">🏛️ Nueva entidad — Formación Senior</h1>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; border: 1px solid #eee;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666; width: 140px;">Contacto</td>
                <td style="padding: 10px 0; color: #111; font-weight: 600;">${nombre}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Email</td>
                <td style="padding: 10px 0;">
                  <a href="mailto:${email}" style="color: #4D9FEC;">${email}</a>
                </td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Entidad</td>
                <td style="padding: 10px 0; color: #111; font-weight: 600;">${empresa || "—"}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Tipo</td>
                <td style="padding: 10px 0; color: #111;">${tipo || "—"}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Recibido</td>
                <td style="padding: 10px 0; color: #111;">${ahora}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Estado</td>
                <td style="padding: 10px 0;">
                  <span style="background: #e3f0fd; color: #4D9FEC; padding: 3px 10px; border-radius: 20px; font-size: 13px; font-weight: 600;">nuevo</span>
                </td>
              </tr>
            </table>
            <div style="margin-top: 24px;">
              <a href="https://supabase.xpertauth.com/project/default/editor"
                style="background: #1B4FD8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Ver en Supabase →
              </a>
            </div>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
              Esta entidad ha contactado desde la página de Formación Senior de xpertauth.com
            </p>
          </div>
        </div>
      `,
    });

    return res.status(201).json({ ok: true });

  } catch (error) {
    console.error("[contacto-entidad] Error:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
