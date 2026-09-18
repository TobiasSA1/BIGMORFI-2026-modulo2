-- ============================================================================
--  MÓDULO 2 - Puntos 16 y 17 (Cocina y Bar)
--  CONTRATO DE DATOS CON EL MÓDULO 3 (Sala / Pedidos / Mozo - Nahue)
--
--  Cocina y Bar NO crean pedidos: solo los leen y marcan ítems como "listo".
--  Quien crea los pedidos es el Módulo 3. Si Nahue todavía no las creó, este
--  script deja la forma mínima que necesito. Todo con "IF NOT EXISTS" para no
--  pisar nada si él ya las armó con otro script.
--
--  Si el Módulo 3 ya creó estas tablas con otros nombres, hay que unificar.
--  Lo único que Cocina/Bar necesitan sí o sí:
--    - pedidos.mesa_id           -> para agrupar por mesa
--    - pedidos.estado            -> para saber qué pedidos están "en juego"
--    - pedido_items.pedido_id    -> a qué pedido pertenece la línea
--    - pedido_items.producto_id  -> qué se pidió (de ahí sale el sector: cocina/bar)
--    - pedido_items.cantidad
--    - pedido_items.estado       -> 'pendiente' | 'en_preparacion' | 'listo' | 'entregado'
-- ============================================================================

create table if not exists public.pedidos (
  id          uuid primary key default gen_random_uuid(),
  mesa_id     uuid not null references public.mesas(id),

  -- Ciclo de vida del pedido. Cocina/Bar solo miran 'confirmado' y 'en_preparacion'.
  estado      text not null default 'confirmado'
              check (estado in ('pendiente','confirmado','en_preparacion',
                                'listo','entregado','pagado','cancelado')),

  created_at  timestamptz not null default now()
);

create table if not exists public.pedido_items (
  id           uuid primary key default gen_random_uuid(),
  pedido_id    uuid not null references public.pedidos(id) on delete cascade,
  producto_id  uuid not null references public.productos(id),
  cantidad     integer not null default 1 check (cantidad > 0),

  -- Estado por ítem: así Cocina puede cerrar un plato aunque otra cosa del
  -- mismo pedido siga en preparación. Cuando TODOS los ítems quedan en
  -- 'listo', el backend del Módulo 2 marca el pedido entero como 'listo'.
  estado       text not null default 'pendiente'
               check (estado in ('pendiente','en_preparacion','listo','entregado')),

  created_at   timestamptz not null default now()
);

create index if not exists pedidos_estado_idx      on public.pedidos (estado);
create index if not exists pedido_items_pedido_idx  on public.pedido_items (pedido_id);
create index if not exists pedido_items_estado_idx  on public.pedido_items (estado);

alter table public.pedidos      enable row level security;
alter table public.pedido_items enable row level security;
