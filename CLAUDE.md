# Reglas fijas — xpertauth_web

## Supabase (base de datos)
- La ÚNICA base de datos válida es el servidor propio:
  https://supabase.xpertauth.com
- Las claves (URL, anon, service_role) están en .env.local (gitignored).
  Úsalas siempre de ahí.
- (Histórica) El proyecto antiguo de supabase.com (dcuvptwwtdhlepvcttvx)
  estuvo abandonado desde agosto de 2026 y fue BORRADO el 3/11/2026:
  ya no existe. Si algo apunta a él, avísalo.
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

## Artículos del blog
- Cómo se publican: Claude Code crea el texto y la imagen (tras el visto bueno de José Luis), sube la imagen a Supabase Storage y registra el artículo en web.posts. La web lo muestra en el blog cuando llega su published_at (las listas filtran published_at <= ahora). LinkedIn lo hace José Luis a mano: no se toca.
- Metadatos obligatorios de cada artículo (la base de datos rechaza lo que no cumpla, con el error 23514):
  - meta_title: máximo 60 caracteres.
  - meta_description: máximo 160 caracteres.
  - Sin MAYÚSCULAS completas en ninguno de los dos.
  - Sin «| XpertAuth» ni ningún sufijo de marca (la web ya lo gestiona).
  - Sin instrucciones de IA dentro del texto (por ejemplo, «sin símbolos markdown»): ni en meta_title, ni en meta_description, ni en el cuerpo.
- Restricciones en web.posts: posts_meta_title_max60 y posts_meta_description_max160 (añadidas el 3/11/2026). Para quitarlas: ALTER TABLE web.posts DROP CONSTRAINT posts_meta_title_max60, DROP CONSTRAINT posts_meta_description_max160.

## Estado actual
(Al cerrar cada sesión, sustituir esta sección entera por la versión al día; el resto de secciones no se tocan.)

Web nueva publicada en producción (xpertauth.com) el 1/11/2026: main = rebuild/web-nueva. Despliegue de vuelta atrás: dpl_SczWD5fLb42TE98W5JGqKkmQiNz7 (web antigua). La web antigua también está en la etiqueta web-antigua-2026-10 (a68a083).

Hecho (1/11):
- Web nueva publicada. Redirecciones de rutas antiguas en vercel.json (ia-pymes, socios, formacion-senior).
- LEX ajustada y probada: umbral 0,45, 10 fragmentos; clasificador FUERA_DE_TEMA / SIN_COBERTURA; no se hacen más ajustes a LEX: lo pendiente va al proyecto de fiabilidad.
- Datos de prueba borrados (46 filas de web.contacto y web.consultas_agente); la copia en CSV se borró el 3/11 por decisión de José Luis.
- Secreto de Google rotado y CERRADO: en Google Cloud solo queda el …51mc.
- Secret scanning y push protection activados en los repos públicos de GitHub.

Hecho (3/11): rotación de JWT_SECRET, anon y service_role de Helsinki, corte a las 10:25 (hora peninsular). Claves nuevas: anon …AA8g, service_role …nqAM (las viejas, …MQBg y …vAi8, dan 401). Las nuevas están en ~/rotacion_supabase_20261103.env y en /root/rotacion-20261103/ del servidor. Copia previa: /opt/supabase/docker/.env.antes-rotacion-20261103 y dumps pre-rotacion-20261103 en /root/backups; script de vuelta atrás en /root/rotacion-20261103/rollback.sh.
- Actualizado: .env del servidor, ajuste app.settings.jwt_secret de la base y contenedores recreados; n8n (credencial «Supabase Service Role», Vigía Ingestar y Paralelos LEX; n8n reiniciado); Vercel altitud, deca-app-xpertauth y SUPABASE_SERVICE_KEY de xpertauth-web; ecografías (commit 27ca589 en xpertauth-tech/ultrasound_results; la veterinaria usa ultrasound-results-six.vercel.app); .env.local, scripts de MASTER skills, .mcp.json, register_post.sh y ~/.zshrc.
- Anon de xpertauth-web resuelta (3/11, redespliegue de producción a las 11:05): José Luis la borró y la creó de nuevo con la anon nueva; www.xpertauth.com sirve …AA8g y el blog funciona. En este proyecto VITE_SUPABASE_ANON_KEY es de tipo Config (Production y Preview): Vercel no deja guardar como secreta una variable VITE_.
- Limpieza tras la rotación hecha (3/11): borradas en el servidor las 6 copias .env.* antiguas, .env.antes-rotacion-20261103, /root/copias-seguridad-20261029/env.bak, /root/rotacion-20261103/ (incluido el rollback y la copia de n8n) y vaciado /root/.bash_history; en el Mac, ~/rotacion_supabase_20261103.env y los dos migrar_storage de Descargas. Ya no hay vuelta atrás con un comando a las claves viejas. Supabase sano (12 contenedores, REST 200 con las claves nuevas).
- Limpieza de n8n hecha (3/11): borrados el flujo «Conocimiento a RAG (RGPD)» (roto desde el 21/8 por quitar pdf-parse de la imagen; su proyecto de supabase.com ya no existe) y los 2 flujos TEST; archivados 15 flujos inactivos que dependían del proyecto abandonado o del del Mundial (11 del Mundial 2026, los de la beta y los experimentos de LEX; los que ya estaban archivados siguen así, 36 archivados en total); borradas 6 credenciales («Supabase RGPD», «Supabase account», «OpenAI API», «OpenAI Header Auth», «WhatsApp output», «Google Sheets account»). Quedan 23 flujos activos y 15 credenciales; «Helsinki Postgres» y todo lo activo sin tocar. Copias: base de n8n en /root/backups/n8n_database_pre-F5C_20261103.sqlite (con secretos), y en ~/mundial2026/archivo-n8n-20261103/ los flujos en JSON sin secretos y los metadatos de las credenciales borradas. El proyecto del Mundial 2026 (jrijyqrrabcylpqbtsan) no se ha tocado: se conserva como recuerdo y referencia para la app de la Champions; copia de sus 8 tablas en ~/mundial2026/datos-20261103/ (con ids de usuario de la quiniela; no subir a ningún repo).
- Limpieza de tokens de GitHub hecha (3/11): quitado el token incrustado en el remoto de ~/mundial2026 (remoto ya sin credenciales, sin push) y tachados los tokens ghp_ de 4 notas de ~/Downloads (sesion_11agosto, sesion_29julio, sesion_29julio_tarde y sesion_31julio: quedan como «<TOKEN REDACTADO …últimos4>»). Los historiales y transcripciones con tokens (zsh, ~/.claude, Antigravity, Claude) no se tocan, por decisión de José Luis.
- Tokens de GitHub revocados por José Luis (3/11, cuenta echejose): el de mundial2026 (…oYJB, ya caducado), «n8n-xpertauth-blog» y «n8n-xpertauth-automation». El …Q25G (cuenta xpertauth-tech) se queda: es el del conector de GitHub de Claude Code (~/.claude/settings.json).
- Puertos del servidor revisados (3/11): los pendientes 5433, 6543, 9000 y 3001 estaban cerrados desde el 29/10 (ronda 2: publicados solo en 127.0.0.1; el 5433 también en 172.17.0.1, para n8n). Escaneo TCP completo desde el Mac: desde fuera solo responden 22, 80 y 443 (IPv6 sin comprobar; el cortafuegos de Hetzner no se ha podido leer). ufw inactivo y sin fail2ban: la defensa real son los puertos en 127.0.0.1.
- Conector supabase-helsinki de Claude Code corregido (3/11): su túnel iba al 127.0.0.1:5432 del servidor, que es la base de Listmonk; ahora va al pooler 127.0.0.1:5433 con el usuario postgres.your-tenant-id (solo lectura: server-postgres ejecuta en transacciones de solo lectura). Probado: conecta a la base de Supabase de Helsinki. Se activa al reiniciar Claude Code.
- Conector supabase-postgres de Claude Desktop quitado (3/11): apuntaba al proyecto abandonado de supabase.com y llevaba su contraseña escrita; solo se quitó esa entrada de claude_desktop_config.json (quedan filesystem y github), JSON válido y sin la contraseña. Hay que reiniciar Claude Desktop para que se aplique; después la herramienta mcp__supabase-postgres__query desaparece de las sesiones.
- Script de Drive Antigravity/Conocimiento LEX/lex_update_tool/index.js: el proyecto de Supabase Cloud al que apuntaba ya no existe (DNS NXDOMAIN) y su contraseña escrita se sustituyó por «<REDACTADO>» (no estaba en ningún otro archivo).
- Detalles visuales publicados (3/11, commits 1b6eca8, ea5cd08 y 9fabce7 en main): croquis del Hero en móvil con trazos y letras más gruesos y pie «Vista lateral» más claro (solo menos de 640 px); suelo del croquis en XpertBlue #1B4FD8 y vehículo en Mist #F4F6FA al 65 % (constante VEHICLE_OPACITY en hero-sketch.tsx); og-image.png nueva (1200×630, 84.903 bytes). La sección «Casos» se queda oscura, por decisión de José Luis.
- Supabase antiguo borrado entero (3/11, por José Luis en supabase.com): los 5 proyectos de la org xpertauthtools-blip (xpertauth-db, LEX-Normativa_2, ultrasound_results, deca-app-xpertauth y Twitter_XpertAuth). Antes se comprobó (F8-B) que las copias estaban íntegras y que el Storage y los datos principales estaban en Helsinki. Copias archivadas en ~/Archivo/supabase-antiguo-20261103/ (con LEEME.txt; contienen datos personales y secretos: no subir a ningún repo). La regla del proyecto abandonado dcuvptwwtdhlepvcttvx queda como histórica.
- Los 4 usuarios antiguos de auth, sus perfiles y el registro de beta_emails_enviados quedan solo en la copia archivada y no requieren ninguna acción (llevaban sin poder entrar desde agosto).

Hecho (3/11, web nueva: SEO, velocidad y newsletter), ya en producción salvo lo marcado:
- D2–D7 y G2–G3 en main (sin el L1): robots.txt, accesibilidad, carga diferida de rutas e imágenes, versiones reducidas de imágenes desde Storage (helper client/src/lib/imagenes.ts: logo, avatares, pasos, fondos de Casos y portadas del blog), cabeceras (pantalla completa solo en Servicios y Sobre nosotros; corta y centrada en Blog y textos legales). PageSpeed móvil en la vista previa: de 68 a ~88; ordenador 99-100.
- Newsletter quitada de la web (rutas, páginas y sitemap; redirección 308 de /<idioma>/newsletter y /newsletter/<id> a /blog). NO se tocaron en Supabase web.post_newsletter (13 ediciones), el bucket newsletter-images ni web.suscriptores (existe, pero ni anon ni service_role tienen permisos: error 42501): se conservan para la futura web social (ALMA). server/ y shared/ siguen: el build (script/build.ts), el dev y drizzle dependen de ellos; quitarlos exige reescribir el build.
- HTTP/2 en supabase.xpertauth.com: decidido NO tocar el servidor de Helsinki. No es un pendiente.
- G2 (publicado con G3): título, descripción, canonical, hreflang y Open Graph propios en cada página y idioma (client/src/lib/seo.ts), h1 oculto en Mi historia, metadatos propios de cada artículo (meta_title/meta_description de la base de datos) y sitemap dinámico (api/sitemap.ts, reescritura en vercel.json): 32 páginas fijas + los artículos en español con su fecha; los nuevos entran solos (caché de 1 h).
- G3: <main> en todas las páginas; acortados 22 meta_title (>60) y 17 meta_description (>160) de 28 artículos en web.posts. Copia previa y copia posterior en ~/Archivo/blog-meta-20261103/ (posts_meta_antes.json, posts_meta_despues.json, nuevos.py). De los 23 flujos activos de n8n se revisaron los 6 que tocan web.posts o publican contenido (Newsletter a Listmonk, Obsidian Carta de Porte, Carla LinkedIn: MCP Supabase y Escribir Mi Propio Post, y otros dos): ninguno escribe esos campos; los que tocan web.posts solo lo leen. Los artículos se insertan fuera de n8n (sin confirmar cómo).

- G4–G5: candado en web.posts (CHECK meta_title ≤ 60 y meta_description ≤ 160, 3/11) y reglas del blog en la sección «Artículos del blog» de este archivo (decidido: NO se añaden a la skill de Carta de Porte; no es un pendiente). En n8n, flujo «Newsletter — Publicación a Borrador Listmonk» (activo): desactivados solo los nodos «Borrador Tecnología No Muerde» y «Aviso Email Newsletter» (la rama de Carta de Porte, lista 3, sigue igual; reactivarlos desde el editor si hiciera falta). El sitemap solo incluye artículos con published_at <= ahora.

Pendiente (rotación):
- URL antigua de ecografías (ultrasound-results.vercel.app, cuenta antigua de Vercel): el proyecto quedó desconectado del repo tras moverlo a xpertauth-tech y sigue con la anon vieja; reconectarlo o dejarlo.
- Kuma: la monitorización «Supabase API (Helsinki)» lleva la anon vieja; actualizarla.
- Vigía Ingestar: pasar a credenciales de n8n sus claves (service_role, OpenAI y Anthropic, hoy escritas en sus nodos Code) y el token del webhook: se hace dentro del proyecto de fiabilidad de LEX (plan del F4-A: copia v2 con nodos HTTP Request; ojo: Kong exige la cabecera apikey en REST, pero no en Storage).
- 10/11: borrar el dump de la rotación del 3/11 si todo sigue bien (/root/backups/pre-rotacion-20261103_085236.dump y los de _supabase y _globals, en el servidor).
- Decidir cuándo borrar la copia de la base de n8n del 3/11 (/root/backups/n8n_database_pre-F5C_20261103.sqlite, 668 MB, con secretos): al menos hasta que el Vigía esté rehecho. Quedan además 2 filas huérfanas en webhook_entity del flujo RGPD borrado (inofensivas).
- Registros de Claude Desktop (~/Library/Logs/Claude: mcp.log, mcp-server-supabase-postgres.log y main3.log) aún contienen la contraseña del proyecto ya borrado: se pueden eliminar (no sirve de nada); falta hacerlo.
- Organización «App - RSS» de supabase.com (1 proyecto): sin revisar.
- Vigía antiguo: revisar en el proyecto de fiabilidad de LEX los 7 documentos que estaban «pendiente» (fechas de publicación del 6/6 al 1/8; en Helsinki hay 0 pendientes). Están en la copia de xpertauth-db (tabla vigia_pendientes de ~/Archivo/supabase-antiguo-20261103/db_cluster-06-08-2026@10-30-33.backup.gz).
- Historiales y transcripciones con claves viejas (zsh, ~/.claude, Antigravity, Claude): decidido no tocarlos.

Pendiente (resto):
- SIGUIENTE PASO DEL GEO (decidido por José Luis, otra sesión): prerenderizado en la compilación (opción A) con Deploy Hook de Vercel llamado desde n8n al publicar un artículo, para que el HTML que reciben los rastreadores sin JavaScript ya lleve textos, título y descripción de cada página (72 HTML: 32 fijas + 40 artículos). Detalles del estudio: render con react-dom/server y wouter (Router ssrPath), revisar los ~26 ficheros que usan window/document/localStorage, precargar datos del blog, mantener createRoot (sin hidratar) para no arriesgar animaciones. Interruptor PRERENDER=0 para deshacerlo. Después, en este orden: llms.txt, ard.json y JSON-LD (con el estatus «Asociación en proceso de estudio de constitución», sin actividad comercial).
- Miércoles 4/11: revisar el L1 (commit 5507cb0, solo en rebuild/web-nueva, no está en main): probar la regla «comparar antes de concluir» en el preview con la consulta de 22 m · 2,70 m · 4,05 m · 45 t por Catalunya y C. Valenciana, decidir si basta ampliar el PARALELO_07 en vez de crear uno nuevo (borrador en ~/Desktop/PARALELO_DGT_borrador.md) y etiquetar el resumen VERTE (fragmento id 1) para que no se confunda con la genérica.
- Miércoles 4/11: arreglo urgente de LEX. (1) Documento PARALELO nuevo con los límites de la autorización genérica de la DGT, que son los mismos que los del SCT (valores a confirmar por José Luis antes de ingestar). (2) Regla en el prompt: antes de concluir, comparar cada medida con los límites y que la conclusión cuadre con las cifras (fallo real: con 22 m dijo «itinerario concreto» por superar 18,75 m, mezclando el límite general con el de la genérica). (3) Corregir que en la Comunidad Valenciana autoriza la DGT, no la comunidad. Prueba: 22 m · 2,70 m · 4,05 m · 45 t por Catalunya y C. Valenciana.
- Comprobar el enlace en LinkedIn (Post Inspector) y en WhatsApp. Con la og-image nueva: refrescar con Post Inspector para que LinkedIn deje de mostrar la antigua.

Modo de trabajo desde ahora: main es producción. Cada cambio se prueba en rebuild/web-nueva y luego se pasa a main en avance rápido (git merge --ff-only).

Después: web social (social.xpertauth.com) para ALMA, y proyecto de fiabilidad de LEX y NOVA.
