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
- Secreto de Google rotado el 1/11 (ahora …51mc; borrados …J_p4 y …733K en Google).
- Secret scanning y push protection activados en los repos públicos de GitHub.
- Secreto de Google CERRADO: en Google Cloud solo queda el …51mc; …733K y …J_p4 borrados (confirmado por José Luis). Archivo temporal del Escritorio borrado.

Pendiente:
- Miércoles 4/11: arreglo urgente de LEX. (1) Documento PARALELO nuevo con los límites de la autorización genérica de la DGT, que son los mismos que los del SCT (valores a confirmar por José Luis antes de ingestar). (2) Regla en el prompt: antes de concluir, comparar cada medida con los límites y que la conclusión cuadre con las cifras (fallo real: con 22 m dijo «itinerario concreto» por superar 18,75 m, mezclando el límite general con el de la genérica). (3) Corregir que en la Comunidad Valenciana autoriza la DGT, no la comunidad. Prueba: 22 m · 2,70 m · 4,05 m · 45 t por Catalunya y C. Valenciana.
- Martes 3/11 desde las 9:00: rotar la service_role de Helsinki (y con ella la anon), según el inventario del 1/11. ATENCIÓN: la comparten otras apps (Altitud, LinkedIn de Carla y otras); no se cambia nada sin el visto bueno de José Luis. Decidir entonces qué hacer con las 4 copias del .env del servidor que tienen el secreto viejo de Google y con .env.bak-google-20261101.
- Comprobar el enlace en LinkedIn (Post Inspector) y en WhatsApp.
- Borrar ~/Desktop/limpieza_datos_prueba_2026-11-01.csv cuando José Luis lo diga.

Modo de trabajo desde ahora: main es producción. Cada cambio se prueba en rebuild/web-nueva y luego se pasa a main en avance rápido (git merge --ff-only).

Después: web social (social.xpertauth.com) para ALMA, y proyecto de fiabilidad de LEX y NOVA.
