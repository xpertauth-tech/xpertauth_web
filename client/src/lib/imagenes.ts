// Versión reducida de una imagen de Supabase Storage, sin mover ni duplicar el archivo:
// el propio Storage la redimensiona al ancho pedido (pasar el doble de lo que se muestra).
export function imagenReducida(url: string, ancho: number): string {
  return url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") + `?width=${ancho}&quality=80`;
}

// srcset con varias versiones reducidas (y, si se indica, el archivo original con su ancho real),
// para que cada pantalla descargue la más ajustada a su tamaño y densidad.
export function srcSetReducido(url: string, anchos: number[], anchoOriginal?: number): string {
  const lista = anchos.map((a) => `${imagenReducida(url, a)} ${a}w`);
  if (anchoOriginal) lista.push(`${url} ${anchoOriginal}w`);
  return lista.join(", ");
}
