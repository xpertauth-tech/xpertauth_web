-- Artículo "acc-burocracia-transporte-especial-2026": la imagen apuntaba a una ruta local
-- (/Users/xpertauth/.gemini/antigravity-ide/...) y no cargaba en la web.
-- Se sustituye por una imagen del bucket blog-images que no usa ningún otro artículo
-- (dos personas en una cabina de camión, una con una tableta; sin rótulos ni marcas).
-- Ya aplicada en el Supabase propio (supabase.xpertauth.com) el 2026-10-08: 1 fila.
-- Solo cambia el dato web.posts.image_url; no toca estructura.

update web.posts
   set image_url = 'https://supabase.xpertauth.com/storage/v1/object/public/blog-images/Gemini_Generated_Image_qmxrb1qmxrb1qmxr.png'
 where slug = 'acc-burocracia-transporte-especial-2026';

-- Deshacer (valor anterior, copia hecha antes del cambio):
--   update web.posts
--      set image_url = '/Users/xpertauth/.gemini/antigravity-ide/brain/6612c5f9-6252-4a45-a279-1236037830dc/acc_bureaucracy_1781445321790.png'
--    where slug = 'acc-burocracia-transporte-especial-2026';
