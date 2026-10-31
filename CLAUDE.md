# Reglas fijas — xpertauth_web

## Supabase (base de datos)
- La ÚNICA base de datos válida es el servidor propio:
  https://supabase.xpertauth.com
- Las claves (URL, anon, service_role) están en .env.local (gitignored).
  Úsalas siempre de ahí.
- El proyecto antiguo de supabase.com (dcuvptwwtdhlepvcttvx) está
  ABANDONADO desde agosto de 2026. Nunca lo consultes ni lo cites,
  aunque responda. Si algo apunta a él, avísalo.
- El MCP de Supabase puede mostrar la conexión Postgres como inactiva;
  las llamadas REST con la service_role funcionan. No des por muerta
  la base por eso.

## Esquemas de la base de datos
- Las tablas de la web XpertAuth van en el esquema web; public es de la
  app de ecografías; revisar siempre todos los esquemas antes de afirmar
  que algo no existe.

## Ramas
- main = espejo de producción. No se toca sin instrucción explícita.
- Todo el trabajo va en rebuild/web-nueva.

## Vercel
- El proyecto que despliega esta rama es el del equipo xpertauth-tech.
  Existe otro proyecto homónimo en otro equipo: si aparece, avísalo,
  no lo uses.

## Método
- Un commit por bloque de encargo. npx tsc y npx vite build limpios
  antes de cada push.
- Si algo del encargo no encaja con el código real, para y pregunta.
  No improvises.
- No subas ni generes imágenes nuevas: solo las que ya hay en
  Supabase Storage.
  EXCEPCIÓN: la imagen para compartir el enlace (Open Graph, 1200x630,
  PNG, <300 KB) sí se puede crear, y es la única. Va en client/public,
  no en Supabase Storage.
- Nunca inventes texto de la web. Si falta, pídelo.

## Textos legales
- Textos legales: si un cambio altera lo que la web guarda en el
  navegador del visitante (cookies, localStorage, sessionStorage), los
  datos que recoge o los servicios externos que usa, hay que actualizar
  Privacidad y/o Cookies en el mismo encargo, en los 4 idiomas, y
  avisarlo en el informe.

## Estado actual
(Al cerrar cada sesión, sustituir esta sección entera por la versión al
día; el resto de secciones no se tocan.)

OBJETIVO: web nueva publicada en xpertauth.com el miércoles 4/11/2026.

Hecho:
- Página propia «Conoce mi historia», mejoras de la plantilla del blog y
  revisión de las traducciones de los textos legales.

Pendiente antes de publicar, por este orden:
1. Prueba comparativa de LEX, antigua contra nueva, con 10 preguntas
   (algunas con trampa, que pondrá José Luis).
2. Repaso de detalles de las subpáginas con José Luis.
3. Imagen y textos para compartir el enlace (igual que en Altitud):
   - En index.html: descripción de unos 150 caracteres, etiquetas Open
     Graph y Twitter (título, descripción, url https://www.xpertauth.com,
     imagen, site_name, locale es_ES) y enlace canónico.
   - Imagen de 1200x630 (PNG, menos de 300 KB) con la identidad visual de
     la web: logo XpertAuth y una frase corta legible en el móvil.
     Enseñársela a José Luis antes del commit.
   - EXCEPCIÓN a la regla de imágenes: esta imagen sí se puede crear, y es
     la única. Va en client/public, no en Supabase Storage.
   - Al publicar, comprobar la vista previa en LinkedIn (Post Inspector)
     y en WhatsApp.
4. Seguridad: renovar la clave service_role de Helsinki, rotar el secreto
   de Google OAuth y borrar los datos de prueba. ATENCIÓN: la service_role
   de Helsinki la comparten otras apps (Altitud, LinkedIn de Carla y
   otras). Antes de renovarla, hacer la lista de todos los sitios donde se
   usa (Vercel, n8n, .env locales) y enseñarla. No se cambia nada sin el
   visto bueno de José Luis.
5. Guardar la web antigua para poder consultarla (etiqueta o rama en
   GitHub a partir del main actual).
6. Pasar rebuild/web-nueva a main, publicar en Vercel y comprobar la web
   en producción.

Después: web social (social.xpertauth.com) para ALMA.
