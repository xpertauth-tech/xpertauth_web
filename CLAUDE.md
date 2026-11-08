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

## LEX — nuevo publicado en producción (desde el 4/11/2026)
- El LEX nuevo está publicado desde el 4/11/2026 (main = 25973df, que es 65c8403 más el arreglo de los imports .js; punto de vuelta atrás: etiqueta antes-L15 = d7c43a3, que era la producción anterior). Código: api/_lex.ts (búsqueda y respuesta), api/_lex_prompt.ts (prompt con el núcleo fijo N1–N12) y api/chat.ts (llama a responderLex; NOVA no se tocó).
- Cómo funciona: temperatura 0; núcleo fijo en el prompt; búsqueda combinada (pregunta original + pregunta reformulada con Haiku + palabras exactas con la función lex.match_lex_palabras), solo con documentos oficiales (sin paralelos ni resúmenes de IA: se filtran tipo paralelo, PARALELO_* y KT, sin borrarlos de la base), umbral 0,55 y 20 fragmentos; regla de no inventar; LEX no nombra a ninguna persona (la etiqueta de fuente es «Criterio de XpertAuth»).
- En la web se mantienen los dos avisos del chat de LEX (decisión de José Luis): «LEX está en revisión» arriba y el texto fijo bajo la caja de escribir (client/src/components/AgentChat.tsx). No se quitan sin su orden.
- **Cualquier cambio en LEX** (prompt, núcleo, búsqueda o datos de la base que lea LEX) **se prueba antes con la batería** (~/Documents/lex-pruebas: l12/run_l12.mjs, las 18 preguntas de bateria.json y la batería de control de 50 preguntas bateria_control.json) **y solo se publica si no empeora** respecto a la versión publicada. Documentos de trabajo en el Escritorio: LEX_nucleo_borrador.md, LEX_bateria.md, LEX_control.md, LEX_prompt_nuevo.txt y LEX_resultados_L14.md.
- Los fragmentos 1411–1560 de lex.lex_documentos (páginas de la DGT y del SCT y Reglamento (CE) 561/2006) y la función lex.match_lex_palabras son parte de LEX: no tocarlos sin pasar la batería.
- **api/ es ESM** (package.json lleva "type": "module"): los imports relativos entre archivos de api/ llevan extensión .js (por ejemplo, from "./_lex.js"). El 4/11/2026 la primera publicación (65c8403) dejó /api/chat caído unos minutos por no llevarla (ERR_MODULE_NOT_FOUND); lo arregló 25973df. Antes de publicar cualquier cambio en api/, probar la función en la vista previa de la rama (un POST a /api/chat sin sesión debe dar 401 «Sesión requerida», no 500).
- Fallos conocidos al publicar (L14): C33 (mezcla las restricciones de la DGT con las de Cataluña), y C6 y C12 incompletas.
- El L1 (5507cb0) quedó anulado con un commit de reversión (fb0c066, en rebuild/web-nueva y main); no se borra historial.
- PARALELO_07 es erróneo (dice que las genéricas de la DGT y del SCT tienen los mismos límites; no es así). Los resúmenes de IA confunden a LEX: no se usan.
- La rama lex-nuevo se conserva como referencia (no borrar).
- Marcha atrás en un paso: en Vercel, proyecto xpertauth-web, abrir el despliegue dpl_8xkqYZpMHFMauZjZ5juEK1tHYDah (main d7c43a3, el anterior al LEX nuevo) y pulsar «Promote to Production». Alternativa con git: git revert --no-commit b1c440c^..25973df en main, commit y push.
- Siguiente proyecto: Vigía 2 (rehacer el Vigía de n8n; punto de partida: Vigia_auditoria.md del Escritorio).

## Rotación de claves
- Tras rotar claves, hacer siempre una pregunta real a LEX y NOVA en producción. El 3/11 se pegó la anon en SUPABASE_SERVICE_KEY y el chat estuvo caído hasta el 6/11.
- En n8n nunca se escriben claves en el código: siempre credenciales de n8n. (Revisado el 6/11/2026: 0 claves escritas en los 35 flujos. La nueva v2 del Vigía Ingestar y las llamadas a Supabase, OpenAI y Anthropic usan credenciales; para REST de Supabase, que exige las cabeceras apikey y Authorization, existe la credencial Custom Auth «Supabase Service Role (REST)».)

### Qué clave se usa dónde (solo los 4 últimos caracteres; estado al 6/11/2026)
- Supabase service_role …nqAM: Vercel xpertauth-web (SUPABASE_SERVICE_KEY), ~/Documents/xpertauth_web/.env.local, servidor de Helsinki, n8n («Supabase Service Role» para Storage y «Supabase Service Role (REST)» para REST).
- Supabase anon …AA8g: Vercel xpertauth-web (VITE_SUPABASE_ANON_KEY), altitud y deca-app-xpertauth (DECA_SUPABASE_ANON_KEY).
- Anthropic …CgAA: n8n («Anthropic API Key»), /opt/supabase/docker/.env de Helsinki (ANTHROPIC_API_KEY, servicio functions) y Vercel xpertauth-web. Otra clave, …BwAA, está en ~/Documents/lex-pruebas/.env (batería de LEX).
- OpenAI …paYA: n8n («OpenAi account»), Vercel xpertauth-web y ~/Documents/xpertauth_web_supabase/.env (los 3 scripts ingestar_*.py la leen de ahí; .env está en su .gitignore). Otra clave, …wboA, está en ~/Documents/xpertauth_web/.env.local.
- Resend (cuenta principal «xpertauth», dominio verificado mail.xpertauth.com): n8n («Header Auth para Resend», re_Kf…vvwK, solo envío, creada el 6/11; la usa el nodo «Aviso Email Blog» del flujo Newsletter — Publicación a Borrador Listmonk), supabase-auth (re_a7dn…tGE3, servicio auth de Helsinki) y Vercel xpertauth-web (RESEND_API_KEY, secreta; clave «xpertauth-web-contacto»). La cuenta «xpertauth.tools» se vació el 6/11 (re_Wwy, re_Dcs2 y re_ekeL borradas). Plausible (/opt/plausible/plausible-conf.env) aún lleva una re_Ec8J…EZES inválida como contraseña SMTP: sus correos no salen hasta que se cambie.
- Tokens propios, aleatorios y solo en credenciales de n8n: «Helsinki SQL Header Auth» (X-Helsinki-Token, …OHAP; webhook del SQL Proxy y todos los flujos que lo llaman) y «Vigía Ingestar Header Auth» (X-Vigia-Token, …sUJY; webhook vigia-ingestar-v2 y flujo Aprobar).
- REVOCADAS el 6/11/2026: OpenAI …OoQA e …IzYA, Anthropic …jwAA. Tokens viejos (…2026) rechazados.
- Vigía Ingestar v2 (n8n, id VigIngV2Helsinki01, webhook vigia-ingestar-v2): desde el 8/11 ya no genera fragmentos «paralelo» (solo texto oficial). El Panel tiene acceso con usuario y contraseña desde el 8/11 y Aprobar/Rechazar piden enlace firmado o sesión (ver «Vigía 2 — vigilancia de páginas»).

## Portada: LEX y NOVA (reglas permanentes)
- LEX y NOVA tienen cada una su sección en la portada y el mismo peso. En ordenador deben medir casi lo mismo y caber cada una en una pantalla de 960 px de alto (hoy, desde el título hasta «Cuéntanos tu caso»: LEX 823 px y NOVA 819 px). Si se toca una, medir las dos.
- Nunca decir que LEX consulta en directo el BOE, la DGT o el SCT: busca en su base normativa.
- NOVA da ideas: ningún texto puede sugerir que guarda documentos o manda avisos.
- Las fechas de la lista de NOVA se calculan desde el día de la visita (client/src/lib/fechas.ts); no escribir fechas fijas.
- Los colores de semáforo (Urgente, Próximo, Al día) son una excepción de paleta solo para esa lista.

## Vigía 2 — vigilancia de páginas (activo desde el 8/11/2026)
- Qué hace: cada sábado a las 10:00 (hora de Madrid) el flujo n8n «Vigía 2 — Páginas y correo semanal» (id VigiaPag2Helsinki01) lee las fuentes activas de lex.vigia_fuentes, compara por hash solo la zona a vigilar, llama al Crawler RAG (boletines: DOGC, BOE, EUR-Lex, DGT antigua y SCT antigua) y envía UN solo correo con el estado de cada fuente. «Vigía 2 — Aviso de fallo» (VigiaAviso2Helsinki1) avisa si el coordinador se rompe; «Vigía 2 — Vigilante de las 14:00» (VigiaVigil2Helsinki1) avisa si a las 14:00 no ha terminado. Copia previa de n8n: /root/backups/n8n_vigia2_20261108/ (Helsinki).
- Todo sale de datos: activar una fuente es cambiar lex.vigia_fuentes (activa, estado_permiso='permitida', url). Un CHECK impide activar una fuente sin permiso o sin dirección. Estados de permiso: permitida / en_espera_permiso / denegada / no_accesible (transportes.gob.es: la web bloquea la lectura, incluido su robots.txt; no se intenta saltar). Tipos: pagina, boe_consolidado, boletin, eurlex_consolidado (añadido para la Directiva 96/53/CE: lee el texto consolidado de EUR-Lex por la vía SPARQL del Crawler). Configuración fina por fuente: zona_inicio, zona_fin, lineas_incluir, lineas_excluir, enlaces_regex, min_caracteres, palabra_esperada.
- Reglas de lectura: User-Agent «XpertAuth-Vigia/2.0 (+https://xpertauth.com)»; robots.txt comprobado antes de leer (si no se puede leer, no se lee); reintentos de 5, 15 y 45 s ante 429/5xx; pausa de 1,5 s entre peticiones. Navarra: no leer /documents/*. La limpieza quita menús, pie, cookies y relojes (Navarra mostraba «20:00:20 h» y cambiaba siempre).
- Gencat 6068 (tramits.gencat.cat): la ficha solo trae la cabecera; los requisitos y pasos están en ?moda=1/2/3, que su robots.txt prohíbe. Está activa y sale «Falló» cada semana (columna nota_fallo explica el motivo) hasta que haya una vía permitida; con ella el asunto del correo dirá siempre «Revisión incompleta».
- Comprobación de contenido (lex.vigia_registrar_lectura): mínimo de caracteres y palabra esperada por fuente; un texto casi vacío, una página de error o un texto menor del 30 % de la referencia cuenta como «Falló» y NO sustituye la referencia. La primera lectura es la referencia (sin aviso).
- Un cambio crea un aviso en lex.vigia_pendientes (tipo cambio_pagina, texto_antes y texto_despues) y una versión en lex.vigia_versiones. Nada entra en LEX sin aprobar. Al aprobar, entra el texto guardado (archivo «vigia2:<fuente>:<versión>») y los fragmentos oficiales anteriores de ESA página pasan a tipo 'retirado' (función lex.vigia_cerrar_pagina; no se borran). LEX no los usa: sus dos búsquedas (significado, con p_tipo='oficial', y palabras exactas, lex.match_lex_palabras) solo leen tipo='oficial' (probado el 8/11). La función antigua lex.match_lex_documentos no filtra, pero solo la usa server/routes.ts (desarrollo), no api/. Recuperar: UPDATE lex.lex_documentos SET tipo='oficial' WHERE tipo='retirado' AND archivo LIKE 'vigia2:<fuente>:%'. El aviso de aprobación cuenta (sin tocar) los fragmentos antiguos cuyo archivo es la dirección de la página. BOE consolidado: un cambio de fecha solo genera aviso (la norma modificadora llega por el Crawler).
- El Crawler RAG (6nuJZo6YyKjj9d8L) ya no tiene horario propio ni envía correos: lo llama el coordinador (nodo «Desde el coordinador Vigía 2»; «Sabados 10AM», «Sin Novedades» y «Correo a Info» están desactivados). La zona horaria de la instancia n8n es America/New_York (el Crawler corría a las 10:00 de allí, 16:00 de Madrid); los flujos nuevos llevan Europe/Madrid.
- Trampas de n8n: en un nodo Code no existe `URL`; httpRequest con returnFullResponse + arraybuffer devuelve el cuerpo roto (se pide como texto y solo se repite en binario si el charset no es UTF-8, como en Euskadi). Prueba por línea de órdenes (envía el correo real): docker exec -e N8N_RUNNERS_BROKER_PORT=5690 n8n-docker-n8n-1 n8n execute --id=VigiaPag2Helsinki01 (necesita un nodo Execute Workflow Trigger).
- Panel y acciones (bloque 6, 8/11): flujo «Vigía 2 — Acceso, Panel y confirmaciones» (VigiaFront2Hel0001) con las direcciones públicas /webhook/vigia-revision (Panel), vigia-entrar (acceso), vigia-aprobar-v2 y vigia-rechazar-v2. Sin sesión, el Panel muestra una página de acceso normal (usuario y contraseña, autocomplete username/current-password para Contraseñas de Apple). La contraseña vive solo en la credencial de n8n «Vigía Panel (acceso)» (Basic Auth): el flujo la comprueba llamando a su propio webhook vigia-verificar-acceso protegido con esa credencial, así que nunca está en el código. Sesión de 30 días en una cookie firmada (vigia_sesion; HttpOnly, Secure, SameSite=Lax). Freno: 8 intentos fallidos en 15 minutos bloquean esa IP (lex.vigia_intentos).
- Firmas: la clave aleatoria está solo en lex.vigia_secretos (sin acceso para anon/authenticated/service_role) y las funciones lex.vigia_firma, vigia_sesion_nueva/valida y vigia_enlace/vigia_enlace_valido hacen todo dentro de la base. Los enlaces del correo (vigia-aprobar-v2?id=&exp=&sig=) caducan a los 7 días; abrirlos solo muestra una página de confirmación y decide únicamente el botón (POST). Un enlace caducado dice «Entra en el Panel». Si hay que cambiar la contraseña: editar la credencial en n8n. Para invalidar todas las sesiones y enlaces: cambiar el valor de 'firma' en lex.vigia_secretos.
- Ejecutores internos: «Vigía 2 — Aprobar (interno)» (VigiaAprobInt2Hel01, path vigia-aprobar-interno) y «Vigía 2 — Rechazar (interno)» (VigiaRechInt2Hel001, vigia-rechazar-interno), protegidos con la credencial «Vigía Ingestar Header Auth». Los flujos viejos (Panel v2 pzwzEY8OOVkTY0aC, Aprobar Wzlve2d3966v8FJL, Rechazar 6wihEg0ZAnWK4ZRJ) quedan DESACTIVADOS, no borrados.
- Avisos solo informativos (tipo aviso_info, p. ej. la fecha de la ficha de Gencat 6068 o un cambio de fecha en un BOE consolidado): no se ingestan nunca; el botón es «Marcar como visto» y queda en vigia_historial con decision 'visto'. Ingestar v2 rechaza el tipo aviso_info.
- Cada enero: avisar de que hay que apuntar a la resolución de restricciones del año nuevo (fuentes con renovacion_anual; el correo lo recuerda en enero).

## SCT — paso pendiente de la respuesta (solicitud ID 83BLQTVD - 1)
- Hoy: la lectura antigua del SCT son los nodos «Fuente: SCT» y «Descargar SCT» del Crawler RAG (sale como «Lectura provisional» en el correo). NO se tocan hasta que contesten. En lex.vigia_fuentes hay 6 fuentes SCT en en_espera_permiso: 3 con dirección (autoritzacions-especials-te-ve, professionals-transport/index.html y mesures-especials) y 3 sin dirección (SCT Euromodulares, SCT Exenciones, SCT Catàleg de prescripcions). El robots.txt de transit.gencat.cat dice «Disallow: /» para todos los robots (comprobado el 8/11).
- Si dicen que SÍ: completar las direcciones que faltan; activarlas en lex.vigia_fuentes (activa=true, estado_permiso='permitida', min_caracteres y palabra_esperada); eliminar del Crawler los nodos antiguos del SCT (Fuente: SCT, Descargar SCT y sus conexiones con Merge, Switch y Merge1); y usar la lectura identificada del coordinador. OJO: el coordinador respeta robots.txt; si su robots.txt sigue con «Disallow: /» para todos, hay que pedirles que añadan un grupo «User-agent: XpertAuth-Vigia», o decidir con José Luis una excepción por escrito (hoy no existe en el código).
- Si dicen que NO o piden parar: eliminar del Crawler los nodos antiguos del SCT, marcar sus fuentes como denegadas (estado_permiso='denegada', activa=false) y mantener DOGC, BOE y la ficha de trámites de Gencat (tramits.gencat.cat, trámite 6068).

## Modelos de IA y fechas límite (anotado el 8/11/2026)
- **LEX usa claude-sonnet-4-5-20250929, que se retira el 30/11/2026** (api/_lex.ts:61, MODELO_LEX). Cambio previsto a **claude-sonnet-5-5 después del martes 10/11 y antes del 20/11**, con la **batería completa (las 18 preguntas y la de control de 50) antes de publicar**; solo se publica si no empeora (regla de la sección LEX). NO se ha cambiado ningún modelo ni pasado la batería hasta ahora; no hacerlo antes del cambio de modelo (decisión de José Luis, 8/11).
- **gpt-4.1-mini se apaga el 14/01/2027: sus flujos deben cambiarse antes.** Lo usan: «1. Crawler RAG» (nodo «Message a model», credencial «OpenAi account»), «Conexión Telegram - Temas Genericos» (GuokHCybSSrjriaf, nodo «OpenAI Chat Model») y «Conexión Whatsapp - Temas Genericos» (nwpHHqslUFH0T9Ih, nodo «OpenAI Chat Model»).
- Inventario (8/11/2026). Web: LEX respuesta claude-sonnet-4-5-20250929 (_lex.ts:61); LEX auxiliar (reformular la pregunta y clasificar sin fragmentos) claude-haiku-4-5-20251001 (_lex.ts:62, 83 y 344); embeddings text-embedding-3-small de OpenAI (_lex.ts:152); NOVA claude-haiku-4-5-20251001 sin RAG (chat.ts:264, temperatura 0,5). n8n del Vigía: Crawler RAG «Evaluar con Anthropic» claude-haiku-4-5-20251001 (cuerpo de la petición; credencial «Anthropic API Key»); Ingestar v2 «Embeddings oficiales» text-embedding-3-small. Fuera del Vigía: flujos de Carla LinkedIn con claude-sonnet-5-5, claude-haiku-4-5-20251001 y gemini-3.1-flash-image-preview; función analizar de Helsinki con claude-sonnet-5. server/routes.ts (solo desarrollo) lleva claude-sonnet-4-5-20251001, un identificador que parece incorrecto.
- LEX y datos (8/11, sin batería): ingestadas la ISP/1933/2026 (BOE-A-2026-16758) y la ISP/300/2026 consolidada del BOE (BOE-A-2026-6095, act. 01/08/2026); las tres copias antiguas de la ISP/300 (PDF en castellano, PDF en catalán y DOGC 1036479: 183 fragmentos) están en tipo 'retirado' (ids en /root/backups/isp300_retiradas_20261108.txt en Helsinki; recuperar con UPDATE ... SET tipo='oficial'). También retirados 10 fragmentos que eran solo sellos de firma de «Directriz MOV_2026-08 DGT.pdf» (ids 51942-51951; /root/backups/sellos_retirados_20261108.txt); quedan 135 fragmentos oficiales con sellos mezclados con contenido real, sin tocar. Ingestada la página 1 de MOV 2026/08 como transcripción de PDF escaneado (3 fragmentos, archivo «DGT Escrito Directriz MOV 2026-08 (transcripcion de PDF escaneado, solo pagina 1)»; sin anexos). MOV 2026/20 NO se ingesta (no afecta al transporte especial; transcripción en ~/Archivo/vigia2-transcripciones-20261108/). Descartadas: MOV 2025/21, VEH 2026/05, RD 182/2026 (el ROTT consolidado ya lo incorpora) y la Resolución SCT de 29/07/2026 (no localizada; el DOGC 1036479 de ese registro es la ISP/300). De los 24 registros «error» del historial sin fragmentos bajo su dirección, los otros 15 no se han tocado (5 de ellos ya están en LEX por otra vía: RD 613/2024, RDL 9/2026 dos veces, Ley 15/2009 y el ROTT).
- Fallo abierto de LEX (8/11): a «salgo de una empresa del vial de Els Prats hacia empresas de la C-31B» responde con la ruta inversa (C-31B > vial de Els Prats). Los fragmentos con la línea A.5 correcta (ids 1610 y 1656) no entran entre los 20 recuperados; entran otros con la C.4. No es un dato antiguo: es recuperación y lectura. Revisar con la batería completa tras el cambio de modelo. Las preguntas sobre el horario de euromodulares (T→D de la ISP/1933) sí dan el dato nuevo.
- Ingestar v2: el nodo «Descargar» extrae ahora solo el cuerpo de las páginas txt.php del BOE (div textoxslt), sin menús ni pie.

## Estado actual / Próxima sesión
(Al cerrar cada sesión, sustituir esta sección entera por la versión al día; el resto de secciones no se tocan.)

### Próxima sesión, en este orden
1. **Lunes 9/11 por la mañana (Vigía 2):** bloque 3 (BOPV y BON como fuentes de novedades, con aprobación humana; si no hay vía permitida y fiable para alguno, parar y decirlo; comprobar antes su robots.txt), muestra del bloque 8 (unos 30 avisos reales de vigia_historial con la regla propuesta para quitar el ruido; esperar el OK de José Luis antes de aplicarla) y propuesta de 10 preguntas fijas para el bloque 9 (sacadas de los bancos de pruebas de LEX; esperar el OK antes de programarla; decir el coste por ejecución).
2. **Cambio de modelo de LEX: después del martes 10/11 a las 9:00 y antes del 20/11** (claude-sonnet-4-5-20250929 → claude-sonnet-5-5), con la batería completa antes de publicar (ver «Modelos de IA y fechas límite»). En esa batería revisar también el fallo de Els Prats y los cambios de datos del 8/11, que no pasaron batería.
3. **Sábado 14/11 a las 10:00 (hora de Madrid): primera ejecución real del Vigía 2**; a las 14:00 el vigilante. Mirar el correo (con Gencat 6068 vigilando solo la fecha ya no debe decir «Revisión incompleta» por esa fuente) y probar de verdad el aviso de fallo (ver «Vigía 2 debe»).
4. Después: web social (social.xpertauth.com) para ALMA, y GEO (ver «Pendiente (resto)»).

### Rediseño LEX / NOVA (Fases 1, 2 y 3 HECHAS y en producción)
- Fase 1 (6/11): páginas /:idioma/lex y /:idioma/nova (client/src/pages/AgentePagina.tsx) con el chat en una sola pantalla (cabecera compacta, aviso «LEX está en revisión» fino, mensajes con scroll dentro del chat, caja siempre visible, ejemplos pulsables que rellenan la caja y desaparecen tras la primera pregunta, indicador de espera con frases que cambian a los 4 y 8 s). Sin sesión: botón «Entra con Google…» y, al volver, se regresa a /lex o /nova. El panel lateral ya no existe; los botones «Pregunta a LEX / NOVA» (abrirAgente en App.tsx) navegan a las páginas. AgentChat.tsx exporta ChatAgente (por defecto), Burbuja, TEXTOS, AGENTE_CONFIG y AvisoLexRevision; AgentModal solo sirve a «Regístrate» y exporta TEXTOS_ACCESO (consentimiento). /lex y /nova están en el sitemap. Retorno de Google permitido por ADDITIONAL_REDIRECT_URLS (https://xpertauth.com/**, www y xpertauth-*-xpertauth-tech.vercel.app/**). Pendiente de José Luis: revisar la bienvenida de los agentes y las traducciones CA/EN/FR de los textos nuevos y de los SEO de /lex y /nova.
- Fase 2 (8/11): «Así trabaja LEX» (client/src/components/asi-trabaja-lex.tsx, textos lexTrabaja en messages/) sustituye a «LEX en acción»: animación plana de ≈ 11 s, una sola vez al entrar en pantalla; el paso 4 es «De lo denso a lo claro» (bloque de letra diminuta que se aplasta y la frase de la página de LEX palabra a palabra).
- Fase 3 (8/11): «Del caos al orden» de NOVA (client/src/components/nova-caos-orden.tsx, client/src/lib/fechas.ts, textos novaCaos), justo después de la de LEX. La franja antigua de NOVA (nova-franja.tsx) se eliminó. La frase final de cada una sale de AgentChat.TEXTOS (fraseLex, fraseNova), sin duplicar. Móvil: versión ligera; «reducir movimiento»: estado final directo.

### Pendientes con fecha
- 10/11: borrar el volcado de la rotación del 3/11 (ver «Pendiente (rotación)»).
- Hacia el 13/11: quitar el aviso «LEX está en revisión» de la cabecera si no hay fallos graves. El texto fijo bajo la caja de escribir NO se quita nunca.
- Después del martes 10/11 a las 9:00 y antes del 20/11: cambiar el modelo de LEX a claude-sonnet-5-5 con batería completa antes de publicar (el actual se retira el 30/11/2026). Ver «Modelos de IA y fechas límite».
- Lunes 9/11 por la mañana: bloque 3, muestra del bloque 8 y propuesta del bloque 9 (ver «Próxima sesión»).
- Antes del 14/01/2027: cambiar gpt-4.1-mini en Crawler RAG, Telegram y WhatsApp.

### Vigía 2 debe (queda por hacer)
- Bloque 3: BOPV y BON como fuentes de novedades.
- Bloque 8: filtro previo de ruido (muestra de ~30 avisos de vigia_historial; esperar el OK de José Luis).
- Bloque 9: batería de 10 preguntas cada 90 días (esperar el OK de José Luis).
- Probar de verdad «Vigía 2 — Aviso de fallo» (VigiaAviso2Helsinki1): figura inactivo en la lista, lo cual es normal en un flujo de error, y está enlazado como errorWorkflow del coordinador y del vigilante; pero no se ha provocado un fallo real del coordinador para ver llegar el correo. No tocar los nodos «Fuente: SCT» y «Descargar SCT» (siguen idénticos a la copia del 8/11).
- Limpieza pendiente (decidir): exports temporales en /root/backups de Helsinki (crawler_b4.json, crawler_nuevo.json, e_*.json, ing_actual.json, wf_modelos/, wf_modelos.tgz, wf_estado/); la copia n8n_vigia2_20261108/ se conserva al menos hasta que el Vigía 2 lleve un mes estable. lex.vigia_intentos guarda el registro de accesos al Panel (los de pruebas del 8/11 caducan solos para el freno a los 15 min; se pueden vaciar).
- Cifras de LEX al cierre del 8/11: 7.913 fragmentos (7.305 oficiales, 415 paralelos, 193 retirados); incluyen los 3 de la transcripción de la página 1 de MOV 2026/08. Vigía 2: 29 fuentes (22 activas, 7 inactivas), 0 pendientes, 179 filas en vigia_historial (23 aprobados, 130 rechazados, 26 error).
Hecho el 8/11: bloques 0, 1, 2, 4, 6 (Panel con acceso, enlaces firmados y confirmación; probado el 8/11) (el nodo «Descargar BOE» del Crawler ahora es un Code con reintentos de 5/15/45 s; un fallo persistente se anota en lex.vigia_incidencias y el correo lo muestra como «Falló» en BOE; un 404 es un día sin sumario, no un fallo), 5 (Ingestar v2 ya no genera paralelos; probado con una ingesta real: 1 fragmento oficial, 0 paralelos; los 415 antiguos siguen en la base), 7, 10 (probado: cambio de página, aprobación, segundo cambio con retirada, fuente caída = «Revisión incompleta», dirección prohibida por robots = no se lee) y 11.

### Vigía 2, decidido el 8/11
- Sin batería tras cada ingesta; en su lugar, batería cada 90 días con 10 preguntas fijas.
- Las páginas fijas a vigilar las propone el chat para todas las fuentes y José Luis da el OK.

Hecho (8/11):
- Portada: «Así trabaja LEX» (asi-trabaja-lex.tsx, textos lexTrabaja) y «Del caos al orden» de NOVA (nova-caos-orden.tsx, lib/fechas.ts, textos novaCaos). Franja antigua de NOVA eliminada.
- Producción en d84c8c4 (main = rebuild/web-nueva). Las ramas asi-trabaja-lex y nova-del-caos quedan como referencia (no borrar).

Hecho (6/11):
- 2FA hecha el 6/11.
- Chat de LEX y NOVA caído del 3/11 al 6/11 («permission denied for function registrar_consulta»): la causa era SUPABASE_SERVICE_KEY de Vercel con la anon pegada en vez de la service_role (los permisos EXECUTE estaban bien). Corregida por José Luis; LEX funciona en producción desde las 12:21. Se borró la fila de prueba consulta_id 68 de web.consultas_agente. Regla nueva en «Rotación de claves».
- Parser de botones del chat (client/src/components/AgentChat.tsx): acepta [BOTON_DGT:...] además de [BOTON_SCT:...] (5dcb144). El prompt de LEX no se tocó (el modelo a veces escribe BOTON_DGT).
- F4-A completo (credenciales de n8n): copia de seguridad en /root/backups/n8n_F4A_20261106/ (solo Helsinki); borrados 31 flujos (Paralelos LEX, Beta, Mundial 2026 y de depuración); tokens propios nuevos y aleatorios como credenciales (Proxy SQL y Vigía Ingestar); Crawler RAG, Aprobar, Rechazar y Panel v2 pasados a credenciales; «Vigía Ingestar v2» (VigIngV2Helsinki01, 24 nodos HTTP Request y Code sin claves) sustituye a la v1, que se borró tras una ingesta real de prueba (Orden TMA/324/2020: 10 oficiales + 8 paralelos; se borraron los 18 fragmentos y su fila de historial; lex_documentos quedó en 7.845 fragmentos). Quedan 35 flujos y 17 credenciales, con 0 claves escritas a mano.
- Claves rotadas y las viejas revocadas: Anthropic …CgAA (n8n, Helsinki y Vercel; …jwAA eliminada), OpenAI …paYA (n8n, Mac y Vercel; …OoQA e …IzYA revocadas) y Resend (clave nueva de solo envío en n8n; las de la cuenta «xpertauth.tools» borradas). Detalle en «Qué clave se usa dónde».
- Plausible (/opt/plausible/plausible-conf.env) lleva como contraseña SMTP una clave Resend ya invalidada: sus correos no salen hasta cambiarla (usa correo.xpertauth.com como remitente; comprobar que está verificado en la cuenta principal).

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
- Plausible: cambiar su clave SMTP (ver Hecho 6/11).
- Kuma: la monitorización «Supabase API (Helsinki)» lleva la anon vieja; actualizarla.
- 10/11: borrar el dump de la rotación del 3/11 si todo sigue bien (/root/backups/pre-rotacion-20261103_085236.dump y los de _supabase y _globals, en el servidor).
- Decidir cuándo borrar la copia de la base de n8n del 3/11 (/root/backups/n8n_database_pre-F5C_20261103.sqlite, 668 MB, con secretos): y la del 6/11 (/root/backups/n8n_F4A_20261106/, 1,4 MB, credenciales cifradas): al menos hasta que el Vigía 2 esté hecho. Quedan además 2 filas huérfanas en webhook_entity del flujo RGPD borrado (inofensivas).
- Registros de Claude Desktop (~/Library/Logs/Claude: mcp.log, mcp-server-supabase-postgres.log y main3.log) aún contienen la contraseña del proyecto ya borrado: se pueden eliminar (no sirve de nada); falta hacerlo.
- Organización «App - RSS» de supabase.com (1 proyecto): sin revisar.
- Vigía antiguo: revisar en el proyecto de fiabilidad de LEX los 7 documentos que estaban «pendiente» (fechas de publicación del 6/6 al 1/8; en Helsinki hay 0 pendientes). Están en la copia de xpertauth-db (tabla vigia_pendientes de ~/Archivo/supabase-antiguo-20261103/db_cluster-06-08-2026@10-30-33.backup.gz).
- Historiales y transcripciones con claves viejas (zsh, ~/.claude, Antigravity, Claude): decidido no tocarlos.

Pendiente (resto):
- GEO (decidido por José Luis, otra sesión; no entra en la lista de la próxima sesión salvo orden suya): prerenderizado en la compilación (opción A) con Deploy Hook de Vercel llamado desde n8n al publicar un artículo, para que el HTML que reciben los rastreadores sin JavaScript ya lleve textos, título y descripción de cada página (72 HTML: 32 fijas + 40 artículos). Detalles del estudio: render con react-dom/server y wouter (Router ssrPath), revisar los ~26 ficheros que usan window/document/localStorage, precargar datos del blog, mantener createRoot (sin hidratar) para no arriesgar animaciones. Interruptor PRERENDER=0 para deshacerlo. Después, en este orden: llms.txt, ard.json y JSON-LD (con el estatus «Asociación en proceso de estudio de constitución», sin actividad comercial).
- L1 (5507cb0) descartado el 4/11/2026; ver sección LEX — nuevo publicado en producción.
- Comprobar el enlace en LinkedIn (Post Inspector) y en WhatsApp. Con la og-image nueva: refrescar con Post Inspector para que LinkedIn deje de mostrar la antigua.

Modo de trabajo desde ahora: main es producción. Cada cambio se prueba en rebuild/web-nueva y luego se pasa a main en avance rápido (git merge --ff-only).

Después: web social (social.xpertauth.com) para ALMA, y proyecto de fiabilidad de LEX y NOVA.
