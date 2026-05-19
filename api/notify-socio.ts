import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });

  try {
    const { nombre, email, telefono, empresa, tipo_socio, mensaje } = req.body;
    const ahora = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' });

    await resend.emails.send({
      from: 'XpertAuth <noreply@mail.xpertauth.com>',
      to: 'info@xpertauth.com',
      subject: `🤝 Nueva solicitud de socio — ${nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #0A0E1A; padding: 20px 24px; border-radius: 10px 10px 0 0;">
            <h1 style="color: #1B4FD8; margin: 0; font-size: 20px;">🤝 Nueva solicitud de socio</h1>
          </div>
          <div style="background: #f9f9f9; padding: 24px; border-radius: 0 0 10px 10px; border: 1px solid #eee;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #666; width: 140px;">Nombre</td>
                <td style="padding: 10px 0; color: #111; font-weight: 600;">${nombre}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Email</td>
                <td style="padding: 10px 0;">
                  <a href="mailto:${email}" style="color: #1B4FD8;">${email}</a>
                </td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Teléfono</td>
                <td style="padding: 10px 0; color: #111; font-weight: 600;">${telefono || '—'}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Empresa</td>
                <td style="padding: 10px 0; color: #111; font-weight: 600;">${empresa || '—'}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Tipo socio</td>
                <td style="padding: 10px 0; color: #111;">${tipo_socio || '—'}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Mensaje</td>
                <td style="padding: 10px 0; color: #111;">${mensaje || '—'}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Recibido</td>
                <td style="padding: 10px 0; color: #111;">${ahora}</td>
              </tr>
              <tr style="border-top: 1px solid #eee;">
                <td style="padding: 10px 0; color: #666;">Estado</td>
                <td style="padding: 10px 0;">
                  <span style="background: #eff6ff; color: #1B4FD8; padding: 3px 10px; border-radius: 20px; font-size: 13px; font-weight: 600;">pendiente</span>
                </td>
              </tr>
            </table>
            <div style="margin-top: 24px;">
              <a href="https://supabase.com/dashboard/project/dcuvptwwtdhlepvcttvx/editor/socios"
                style="background: #1B4FD8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                Ver en Supabase →
              </a>
            </div>
            <p style="margin-top: 20px; color: #999; font-size: 12px;">
              Esta solicitud ha llegado desde la página de Socios de xpertauth.com
            </p>
          </div>
        </div>
      `,
    });

    return res.status(201).json({ ok: true });

  } catch (error) {
    console.error('[notify-socio] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
}
