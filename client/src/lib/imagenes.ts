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

// Portadas del blog (image_url viene de la base de datos): si son de nuestro Storage se piden en
// versiones reducidas (nunca se amplía el original); si no, se usa la URL tal cual.
// Los sizes que se pasan piden ~1,5 veces el tamaño mostrado: así, en pantalla normal (1×), la foto
// no pierde nitidez al reducirse dos veces (en el servidor y en el navegador).
const ANCHOS_PORTADA = [400, 720, 1080, 1440];
export function portadaImg(url: string, sizes: string): { src: string; srcSet?: string; sizes?: string } {
  if (!/^https:\/\/supabase\.xpertauth\.com\/storage\/v1\/object\/public\//.test(url)) return { src: url };
  return { src: imagenReducida(url, 720), srcSet: srcSetReducido(url, ANCHOS_PORTADA), sizes };
}
