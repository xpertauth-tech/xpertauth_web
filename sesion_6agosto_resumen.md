# XpertAuth — Sesión 6 de agosto de 2026

Continuación de la migración Cloud → Helsinki. Esta sesión cerró los últimos huecos de la migración y arrancó la primera auditoría de aprovechamiento/coste de Helsinki. Para subir a Project Knowledge junto con el resumen del 5 de agosto.

---

## 1. Punto de partida

Al empezar la sesión, la migración de código, base de datos y Edge Functions a Helsinki se daba por completada (ver resumen del 5 de agosto). El objetivo de hoy era: (1) repaso exhaustivo para encontrar cualquier resquicio sin migrar, y (2) una vez confirmado, auditar cuánto se puede aprovechar Helsinki para no pagar de más en otros sitios.

---

## 2. Hallazgo crítico: el sistema de Beta Testers nunca se migró

Al revisar los 40 workflows de n8n uno por uno, aparecieron **6 workflows activos y programados** que seguían apuntando al Cloud viejo (`dcuvptwwtdhlepvcttvx.supabase.co`) con claves `service_role` incrustadas a mano:

- `Beta Testers_00 — Envío de Invitaciones`
- `Beta Testers_01 — Notificación Nuevo Usuario`
- `Beta Testers_02 — Feedback 10 Consultas`
- `Beta Testers_03 — Feedback Final`
- `Beta Testers_04 — Monitorización Semanal`
- `Renovación Mensual Créditos`

Se comprobó en Helsinki que **las tablas de este sistema no existen ahí en absoluto** (ni `beta_emails_enviados`, ni tablas de créditos ni de usuarios beta) — todo el sistema de beta testers vivía exclusivamente en el Cloud viejo y quedó fuera del alcance de la migración original.

**Acción inmediata:** se reactivó el Cloud viejo (estaba pausado desde esta misma mañana) para detener la rotura activa mientras se decidía qué hacer.

### Investigación de uso real

Antes de decidir si migrar o no, se consultaron los datos reales en el Cloud viejo:

| Métrica | Valor |
|---|---|
| Usuarios totales registrados | 4 |
| Último inicio de sesión | 11 de junio de 2026 |
| Actividad en los últimos 30 días | 0 |
| Emails registrados en `beta_emails_enviados` | 0 |
| Ejecuciones del workflow de invitación masiva (49 transportistas) | 0 |

**Conclusión y decisión:** el sistema era un piloto manual con 4 personas, nunca se lanzó la campaña completa, y lleva casi dos meses sin actividad. No es un producto vivo. Se decidió **archivar los 6 workflows en n8n** (no migrar nada a Helsinki) y **volver a pausar el Cloud viejo**. Queda todo cerrado: no hay ninguna referencia activa en producción al Cloud viejo.

---

## 3. Resto del repaso de workflows n8n

- **Beta Testers_00** (invitaciones): usa Google Sheets, no dependía de Supabase — limpio, pero ya archivado igualmente por estar ligado al sistema beta.
- **Conocimiento a RAG (RGPD)**: usa un nodo Supabase Vector Store con credencial nativa de n8n (no URL hardcodeada), así que no se pudo verificar desde aquí a qué proyecto apunta. **José Luis aclaró que este workflow es trabajo futuro** — se convertirá en una aplicación completa de registro de datos y aplicación de normativa RGPD, no es urgente revisarlo ahora.
- **Newsletter — Publicación a Borrador Listmonk**: limpio, sin dependencia de Supabase (usa Listmonk + Resend directamente).
- Resto de workflows ya confirmados en sesiones anteriores como migrados correctamente a Helsinki (Vigía LEX, Crawler RAG, Generar Paralelos LEX, etc.).

---

## 4. Dato técnico útil para el futuro: JWT secret de Helsinki

Se obtuvo directamente desde la base de datos de Helsinki (vía el proxy SQL de n8n) el `jwt_secret` real usado para firmar las claves `anon`/`service_role`:

```
H5QqTvawdTD0Aw6OXvPcN6kYxxIRjUCzVmmjGXKPDJ4=
```

**Importante:** el archivo local `.env.helsinki` (en el repo de la web) **no contiene credenciales de Helsinki pese al nombre** — contiene credenciales del Cloud viejo (mismo JWT que aparecía hardcodeado en los workflows rotos). No usar ese archivo como fuente de la clave `service_role` de Helsinki. Con el `jwt_secret` real ya identificado, en el futuro se puede generar la clave `service_role` correcta de Helsinki sin depender de acceso SSH.

---

## 5. Fase 2 — Auditoría de aprovechamiento de Helsinki

### Capacidad del servidor (comprobado por SSH, 6 de agosto ~10:36 UTC)

| Recurso | Uso | Disponible |
|---|---|---|
| Disco (`/`) | 25 GB / 75 GB (34%) | 48 GB libres |
| RAM | 3.5 GB usados, 4.1 GB disponibles (de 7.6 GB) | Margen amplio |
| CPU | Carga 0.36–0.48 sobre 4 núcleos | Prácticamente en reposo |

**Contenedores activos y sanos:** stack completo de Supabase (db, auth, rest, storage, kong, studio, meta, pooler, realtime, imgproxy, edge-functions), n8n, Listmonk (app+db), Plausible Analytics (app+events_db+db+mail), Uptime Kuma. Todos con `Up` estable (7 semanas la mayoría) salvo `supabase-edge-functions`, reiniciado hoy por el arreglo de la función `analizar` de CardioVet.

**Dato relevante:** n8n corre en el mismo servidor Helsinki (37.27.16.86), no en otra máquina — útil a futuro si se necesita ejecutar comandos de sistema desde n8n.

**Conclusión:** Helsinki tiene margen de sobra para absorber más servicios sin necesidad de ampliar el plan de Hetzner.

### Servicios de pago externos

José Luis confirmó que **no paga actualmente ningún servicio externo aparte de Hetzner** (Antigravity, Resend, Buffer están en plan gratuito). El interés es tener **visibilidad preventiva** por si algún día se supera el límite gratuito de alguno.

Diagnóstico por servicio:

- **Antigravity** (generación de contenido LinkedIn con IA): candidata clara a retirar del todo. El workflow nativo de n8n *"Publicaciones LinkedIn a partir de imágenes"* (Claude Haiku + Google Drive + Buffer) ya hace lo mismo. Aunque sea gratis, menos cuentas activas = menos riesgo de cargo futuro inesperado.
- **Resend** (envío de emails): existe un conector MCP oficial — **se conectó durante esta sesión**, ya disponible para consultar consumo del plan gratuito directamente en el chat sin entrar al dashboard.
- **Buffer** (publicación LinkedIn): no existe conector MCP. Una sola cuenta conectada, el plan gratuito debería dar de sobra. Revisión manual ocasional, sin acción necesaria.
- **Vercel** (hosting web): no se pudo leer el plan/tier por API. Es el sitio más real donde un pico de tráfico podría forzar un pago (límite de ancho de banda del plan Hobby). No es candidato a mover a Helsinki (perdería el despliegue automático) — solo vigilar.

### Gasto real de IA (Anthropic/OpenAI)

José Luis mencionó estar cerca del límite de presupuesto de IA. No existe conector de facturación de Anthropic ni OpenAI, así que no se pudo traer la cifra en euros directamente. Como proxy, se consultó el volumen de actividad en Helsinki:

- `lex.lex_documentos`: **6.868 documentos totales**, de los cuales **281 se añadieron en los últimos 7 días** — todo el crecimiento reciente concentrado en la última semana.
- `lex.vigia_historial`: 90 registros totales. `lex.vigia_pendientes`: 4 pendientes.

**Conclusión:** el mayor consumidor de IA no es el uso de producto (el chat beta lleva parado desde junio), es **el crawler Vigía de LEX** ingiriendo y procesando normativa nueva. Pendiente de que José Luis revise `console.anthropic.com → Usage` filtrando por fecha para confirmar si el pico de gasto coincide con esos 281 documentos de la última semana, y si ese ritmo de ingesta es puntual o recurrente.

---

## 6. Pendientes para próximas sesiones

1. **Revisar consumo de Resend** ahora que el conector MCP está activo (ver cuánto queda del plan gratuito).
2. **José Luis**: revisar `console.anthropic.com` para confirmar si el gasto de IA coincide con la actividad del crawler Vigía, y decidir si el ritmo de ingesta necesita ajustarse.
3. **Antigravity**: decidir y ejecutar la baja de la cuenta (ya redundante).
4. **Vigía LEX**: sigue pendiente desde sesiones anteriores el trabajo de robustecer el crawler (fallos de scraping en BOE/SCT/DGT/MITMA, ventana de búsqueda, catch-up de 30 días) — no se tocó hoy.
5. **RGPD (Conocimiento a RAG)**: aplazado a propósito — se convertirá en una aplicación completa de registro de datos y aplicación de normativa, no un simple workflow. Retomar cuando arranque ese desarrollo.
6. **CardioVet**: pendiente confirmación end-to-end de José Luis de que la generación de informes con IA funciona correctamente en la app en producción tras el despliegue de la Edge Function `analizar` en Helsinki.
7. Ítems de baja prioridad ya conocidos de sesiones anteriores (sin cambios hoy): bug cosmético del campo "fuente" en el crawler, utilidad del workflow standalone "Generar Paralelos LEX — Helsinki", destino final del workflow "DEBUG Fetch Temporal" (mantener como herramienta de depuración vs. archivar).

---

## 7. Estado al cierre de la sesión

- **Cloud viejo**: pausado. Sin referencias activas en producción.
- **Helsinki**: única infraestructura de base de datos en uso. Con margen de capacidad de sobra.
- **n8n**: 40 → 34 workflows activos tras archivar los 6 del sistema beta muerto.
- **Conector Resend**: conectado, listo para consultas de uso.
- **Seguridad**: se detectaron y quedan pendientes de decisión del usuario 3 tablas con RLS desactivado en el Cloud viejo (`vigia_historial`, `lex_validacion`, `lex_validacion_items`) — de menor prioridad al estar el proyecto pausado y sin uso activo.
