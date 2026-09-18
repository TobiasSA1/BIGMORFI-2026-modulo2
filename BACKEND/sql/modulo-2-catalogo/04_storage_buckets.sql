-- ============================================================================
--  MÓDULO 2 - Buckets de Storage
--
--  Supabase NO deja crear buckets con SQL común desde el SQL Editor de forma
--  confiable (depende de permisos). Lo más simple y seguro es crearlos a mano:
--
--    Dashboard de Supabase  ->  Storage  ->  New bucket
--
--    1) Nombre: productos     | Public bucket: SÍ   (3 fotos de cada plato/bebida)
--    2) Nombre: mesas         | Public bucket: SÍ   (foto de la mesa + PNG del QR)
--
--  (El bucket 'fotos-perfil' ya lo creó el Módulo 1.)
--
--  Por qué públicos: el front muestra las fotos y los QR con <img [src]="url">
--  usando la URL pública. No hay datos sensibles en esas imágenes.
--
--  Si preferís crearlos por SQL y tu rol lo permite, este es el equivalente:
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('mesas', 'mesas', true)
on conflict (id) do nothing;
