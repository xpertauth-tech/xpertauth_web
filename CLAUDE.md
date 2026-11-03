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
(Al cerrar cada sesión, sustituir esta sección entera por la versión al día; el resto de secciones no se tocan.)

Web nueva publicada en producción (xpertauth.com) el 1/11/2026: main = rebuild/web-nueva. Despliegue de vuelta atrás: dpl_SczWD5fLb42TE98W5JGqKkmQiNz7 (web antigua). La web antigua también está en la etiqueta web-antigua-2026-10 (a68a083).

Hecho (1/11):
- Web nueva publicada. Redirecciones de rutas antiguas en vercel.json (ia-pymes, socios, formacion-senior).
- LEX ajustada y probada: umbral 0,45, 10 fragmentos; clasificador FUERA_DE_TEMA / SIN_COBERTURA; no se hacen más ajustes a LEX: lo pendiente va al proyecto de fiabilidad.
- Datos de prueba borrados (46 filas de web.contacto y web.consultas_agente); copia en ~/Desktop/limpieza_datos_prueba_2026-11-01.csv.
- Secreto de Google rotado y CERRADO: en Google Cloud solo queda el …51mc.
- Secret scanning y push protection activados en los repos públicos de GitHub.

Hecho (3/11): rotación de JWT_SECRET, anon y service_role de Helsinki, corte a las 10:25 (hora peninsular). Claves nuevas: anon …AA8g, service_role …nqAM (las viejas, …MQBg y …vAi8, dan 401). Las nuevas están en ~/rotacion_supabase_20261103.env y en /root/rotacion-20261103/ del servidor. Copia previa: /opt/supabase/docker/.env.antes-rotacion-20261103 y dumps pre-rotacion-20261103 en /root/backups; script de vuelta atrás en /root/rotacion-20261103/rollback.sh.
- Actualizado: .env del servidor, ajuste app.settings.jwt_secret de la base y contenedores recreados; n8n (credencial «Supabase Service Role», Vigía Ingestar y Paralelos LEX; n8n reiniciado); Vercel altitud, deca-app-xpertauth y SUPABASE_SERVICE_KEY de xpertauth-web; ecografías (commit 27ca589 en xpertauth-tech/ultrasound_results; la veterinaria usa ultrasound-results-six.vercel.app); .env.local, scripts de MASTER skills, .mcp.json, register_post.sh y ~/.zshrc.
- Anon de xpertauth-web resuelta (3/11, redespliegue de producción a las 11:05): José Luis la borró y la creó de nuevo con la anon nueva; www.xpertauth.com sirve …AA8g y el blog funciona. En este proyecto VITE_SUPABASE_ANON_KEY es de tipo Config (Production y Preview): Vercel no deja guardar como secreta una variable VITE_.

Pendiente (rotación):
- URL antigua de ecografías (ultrasound-results.vercel.app, cuenta antigua de Vercel): el proyecto quedó desconectado del repo tras moverlo a xpertauth-tech y sigue con la anon vieja; reconectarlo o dejarlo.
- Kuma: la monitorización «Supabase API (Helsinki)» lleva la anon vieja; actualizarla.
- Pasar a credenciales de n8n la service_role del Vigía Ingestar (hoy escrita en sus 2 nodos Code) y las claves de OpenAI y Anthropic escritas en el nodo «Ingestar 2».
- Flujo «Conocimiento a RAG (RGPD)»: no se activa por «Cannot find module 'pdf-parse'» (anterior a la rotación).
- Credenciales de n8n «Supabase RGPD» y «Supabase account»: apuntan a otros proyectos de supabase.com, uno de ellos el abandonado; decidir qué hacer.
- Decidir qué borrar: los .env.* viejos, .bash_history, env.bak y dumps antiguos con el secreto viejo del servidor; /root/rotacion-20261103/n8n-work/n8n_database_antes.sqlite; ~/rotacion_supabase_20261103.env y su copia del servidor; ~/Downloads/migrar_storage*.py (llevan la clave vieja); historiales y transcripciones (zsh, ~/.claude, Antigravity, Claude) con claves viejas.
- Decidir si se borran ~/Downloads/migrar_storage.py y ~/Downloads/migrar_storage_resto.py (llevan la clave vieja).

Pendiente (resto):
- Miércoles 4/11: revisar el L1 (commit 5507cb0, solo en rebuild/web-nueva, no está en main): probar la regla «comparar antes de concluir» en el preview con la consulta de 22 m · 2,70 m · 4,05 m · 45 t por Catalunya y C. Valenciana, decidir si basta ampliar el PARALELO_07 en vez de crear uno nuevo (borrador en ~/Desktop/PARALELO_DGT_borrador.md) y etiquetar el resumen VERTE (fragmento id 1) para que no se confunda con la genérica.
- Miércoles 4/11: arreglo urgente de LEX. (1) Documento PARALELO nuevo con los límites de la autorización genérica de la DGT, que son los mismos que los del SCT (valores a confirmar por José Luis antes de ingestar). (2) Regla en el prompt: antes de concluir, comparar cada medida con los límites y que la conclusión cuadre con las cifras (fallo real: con 22 m dijo «itinerario concreto» por superar 18,75 m, mezclando el límite general con el de la genérica). (3) Corregir que en la Comunidad Valenciana autoriza la DGT, no la comunidad. Prueba: 22 m · 2,70 m · 4,05 m · 45 t por Catalunya y C. Valenciana.
- Comprobar el enlace en LinkedIn (Post Inspector) y en WhatsApp.
- Borrar ~/Desktop/limpieza_datos_prueba_2026-11-01.csv cuando José Luis lo diga.

Modo de trabajo desde ahora: main es producción. Cada cambio se prueba en rebuild/web-nueva y luego se pasa a main en avance rápido (git merge --ff-only).

Después: web social (social.xpertauth.com) para ALMA, y proyecto de fiabilidad de LEX y NOVA.
