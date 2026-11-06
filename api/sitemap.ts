import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
  { db: { schema: "web" } }
);

const ORIGEN = "https://www.xpertauth.com";
const IDIOMAS = ["es", "ca", "en", "fr"];
// Páginas fijas: existen en los 4 idiomas y se enlazan entre sí con hreflang.
const RUTAS = [
  "",
  "/servicios/transporte-especial",
  "/sobre-nosotros",
  "/mi-historia",
  "/blog",
  "/lex",
  "/nova",
  "/politica-de-privacidad",
  "/aviso-legal",
  "/cookies",
];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// /sitemap.xml (reescrito a esta función en vercel.json). Las páginas fijas van en los 4 idiomas;
// los artículos del blog se leen de la base de datos en cada petición (con caché de una hora),
// así que un artículo nuevo entra solo al publicarse. Solo en español: el texto no está traducido.
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const urls: string[] = [];

  for (const ruta of RUTAS) {
    for (const idioma of IDIOMAS) {
      const alternativas = [
        ...IDIOMAS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${ORIGEN}/${l}${ruta}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGEN}/es${ruta}"/>`,
      ].join("\n");
      urls.push(`  <url>\n    <loc>${ORIGEN}/${idioma}${ruta}</loc>\n${alternativas}\n  </url>`);
    }
  }

  // Si la base de datos falla, el sitemap sale igualmente con las páginas fijas.
  try {
    const { data } = await supabase
      .from("posts")
      .select("slug, published_at")
      .eq("is_published", true)
      .lte("published_at", new Date().toISOString()) // los artículos programados no entran antes de su fecha
      .order("published_at", { ascending: false });
    for (const p of data ?? []) {
      if (!p.slug) continue;
      const lastmod = p.published_at ? `\n    <lastmod>${String(p.published_at).slice(0, 10)}</lastmod>` : "";
      urls.push(`  <url>\n    <loc>${ORIGEN}/es/blog/${esc(encodeURIComponent(p.slug))}</loc>${lastmod}\n  </url>`);
    }
  } catch {
    // sin artículos
  }

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    urls.join("\n") +
    "\n</urlset>\n";

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return res.status(200).send(xml);
}
