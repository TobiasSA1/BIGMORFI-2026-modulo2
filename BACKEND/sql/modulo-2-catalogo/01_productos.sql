-- ============================================================================
--  MÓDULO 2 - Punto 2 (alta de plato) y Punto 3 (alta de bebida)
--  Tabla: productos
--
--  Esquema consensuado con Nahue (Módulo 3): usa los enums de
--  00_tipos_y_funcion.sql, tiene soft-delete y auditoría de fecha.
-- ============================================================================

create table if not exists public.productos (
  id                            uuid primary key default gen_random_uuid(),

  -- 'plato'/'bebida' los carga el Módulo 2 (cocinero / cantinero).
  -- 'postre' queda en el tipo para el futuro, todavía no tiene pantalla propia.
  tipo                          tipo_producto not null,

  -- A qué área va cuando se pide: cocina o bar (Puntos 16 y 17 filtran por acá,
  -- NO por "tipo", porque con 3 tipos ya no es una relación 1 a 1).
  sector                        sector_preparacion not null,

  nombre                        text not null,
  descripcion                   text not null default '',

  -- Minutos enteros. Nombre largo a propósito para que no se confunda con
  -- un timestamp.
  tiempo_elaboracion_minutos    int not null default 0
                                 check (tiempo_elaboracion_minutos >= 0),

  precio                        numeric(10, 2) not null default 0
                                 check (precio >= 0),

  -- Las 3 fotos (obligatorias por consigna) se guardan como array de URLs.
  -- La validación de "tienen que ser exactamente 3" la hace el backend (DTO),
  -- no la base.
  fotos                         text[] not null default '{}',

  -- "Verificación en carta" (Punto 2): si es false, no se muestra en la carta
  -- del cliente aunque ya esté cargado.
  en_carta                      boolean not null default true,

  creado_por                    uuid references public.profiles(id),

  eliminado                     boolean not null default false,
  created_at                    timestamptz not null default now(),
  updated_at                    timestamptz not null default now()
);

-- No puede haber dos productos activos del mismo tipo con el mismo nombre
-- (case-insensitive). Es la "verificación en carta": evita duplicados.
create unique index if not exists productos_tipo_nombre_uniq
  on public.productos (tipo, lower(nombre))
  where not eliminado;

create index if not exists productos_tipo_idx   on public.productos (tipo)   where not eliminado;
create index if not exists productos_sector_idx on public.productos (sector) where not eliminado;

create trigger trg_productos_updated_at
before update on public.productos
for each row execute function public.set_updated_at();

-- Solo el backend (service role) escribe/lee esta tabla; el front pasa
-- siempre por la API NestJS, igual que hizo el Módulo 1.
alter table public.productos enable row level security;
