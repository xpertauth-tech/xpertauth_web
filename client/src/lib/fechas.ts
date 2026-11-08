// Fechas relativas al día de la visita (sección «Del caos al orden»). Funciones puras para poder probarlas.

/** Suma días naturales (el calendario resuelve el cambio de mes y de año). */
export function sumarDias(base: Date, n: number): Date {
  return new Date(base.getFullYear(), base.getMonth(), base.getDate() + n);
}

/** Suma meses; si el día no existe en el mes de destino, queda el último día de ese mes (31/01 + 1 mes = 28 o 29/02). */
export function sumarMeses(base: Date, n: number): Date {
  const y = base.getFullYear();
  const m = base.getMonth() + n;
  const ultimo = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(base.getDate(), ultimo));
}

/** dd/mm/aaaa */
export function formatoFecha(d: Date): string {
  const p = (x: number) => String(x).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`;
}
