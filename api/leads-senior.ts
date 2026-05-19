import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { z } from "zod";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  nombre: z.string().min(1),
  telefono: z.string().min(6),
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
      return res.status(400).json({ error: "Nombre y teléfono son obligatorios." });
    }

    const { nombre, telefono } = parsed.data;
    const ahora = new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" });

    // ── INSERT en Supabase ────────────────────────────────────────────────────
    const { error } = await supabase
      .from("leads_senior")
      .insert({ nombre, telefono, estado: "nuevo" });

    if (error) {
      console.error("[leads-senior] Supabase error:", error);
      return res.status(500).json({ error: "Error al registrar. Inténtalo de nuevo." });
    }

    // ── Email de aviso a José Luis ────────────────────────────────────────────
    await resend.emails.send({
      from: "XpertAuth <noreply@mail.xpertauth.com>",
      to: "info@xpertauth.com",
      subject: `🔔 Nuevo lead senior — ${nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #0A0E1A; padding: 20px 24px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #E8620A; margin: 0; font-size: 20px;">🔔 Nuevo lead — Formación Senior</h1>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; border: 1px solid #eee;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666; width: 120px;">Nombre</td>
                <td style="padding: 10px 0; color: #111; font-weight: 600;">${nombre}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Teléfono</td>
                <td style="padding: 10px 0; color: #111; font-weight: 600;">
                  <a href="tel:${telefono}" style="color: #E8620A;">${telefono}</a>
                </td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Recibido</td>
                <td style="padding: 10px 0; color: #111;">${ahora}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Estado</td>
                <td style="padding: 10px 0;">
                  <span style="background: #fff3e0; color: #E8620A; padding: 3px 10px; border-radius: 20px; font-size: 13px; font-weight: 600;">nuevo</span>
                </td>
              </tr>
            </table>
            <div style="margin-top: 24px;">
              <a href="https://supabase.com/dashboard/project/dcuvptwwtdhlepvcttvx/editor/36867"
                style="background: #E8620A; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Ver en Supabase →
              </a>
            </div>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
              Este lead ha llegado desde la página de Formación Senior de xpertauth.com
            </p>
          </div>
        </div>
      `,
    });

    return res.status(201).json({ ok: true });

  } catch (error) {
    console.error("[leads-senior] Error:", error);
    return res.status(500).json({ error: "Error interno del servidor." });
  }
}
