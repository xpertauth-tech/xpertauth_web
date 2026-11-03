// Versión reducida de una imagen de Supabase Storage, sin mover ni duplicar el archivo:
// el propio Storage la redimensiona al ancho pedido (pasar el doble de lo que se muestra).
export function imagenReducida(url: string, ancho: number): string {
  return url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") + `?width=${ancho}&quality=80`;
}
