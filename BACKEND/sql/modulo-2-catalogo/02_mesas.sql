-- ============================================================================
--  MÓDULO 2 - Punto 4 (alta de mesa + generación automática de QR)
--  Tabla: mesas
--
--  Esquema consensuado con Nahue (Módulo 3): agrega disponibilidad/ocupación
--  (lista de espera, metre) sobre la base que ya tenía yo (foto + QR).
-- ============================================================================

create table if not exists public.mesas (
  id                     uuid primary key default gen_random_uuid(),

  numero                 int not null unique,
  cantidad_comensales    int not null default 2
                          check (cantidad_comensales between 1 and 20),
  tipo                   tipo_mesa not null default 'estandar',

  -- ---- Estado de ocupación (lo consume el Módulo 3) --------------------
  -- vacia -> reservada (el metre la reserva para alguien) -> ocupada
  --   (el cliente se sentó) -> vacia de nuevo cuando se libera (Punto 22).
  disponibilidad         disponibilidad_mesa not null default 'vacia',
  reservada_para         uuid references public.profiles(id),
  ocupada_por            uuid references public.profiles(id),

  -- ---- Foto (obligatoria por consigna) ----------------------------------
  foto_url               text not null,

  -- ---- QR de la mesa: se genera SOLO en el backend al dar de alta ------
  -- qr_token: identificador único que viaja DENTRO del QR (para validar que
  --           es legítimo cuando el Módulo 3 lo escanee).
  qr_token               uuid not null unique default gen_random_uuid(),
  -- qr_payload: JSON exacto codificado en la imagen: {"tipo":"mesa","mesaId":...}
  qr_payload              text not null,
  -- qr_url: PNG ya generado y subido a Storage (bucket 'mesas').
  qr_url                 text not null,

  creado_por             uuid references public.profiles(id),

  eliminado              boolean not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create index if not exists mesas_tipo_idx on public.mesas (tipo) where not eliminado;
create index if not exists mesas_disponibilidad_idx on public.mesas (disponibilidad) where not eliminado;

create trigger trg_mesas_updated_at
before update on public.mesas
for each row execute function public.set_updated_at();

-- Mismo criterio que 'productos': todo pasa por la API NestJS.
alter table public.mesas enable row level security;
