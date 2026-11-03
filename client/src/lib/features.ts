// Interruptores de funcionalidades. El código de lo desactivado se conserva.

// Formularios de suscripción por correo (Blog y artículo).
// Desactivados: la tabla web.suscriptores existe en Supabase, pero ningún rol tiene permisos sobre ella
// (anon y service_role reciben 42501), y no hay envío de newsletter. Se conserva para la futura web social.
export const SHOW_SUBSCRIPTION = false;
