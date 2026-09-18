-- ============================================================================
--  MÓDULO 2 - Datos de ejemplo para DEMO / TESTING
--
--  Sirve para probar Cocina (Punto 16) y Bar (Punto 17) SIN tener el Módulo 3.
--  Carga: 2 platos, 2 bebidas, 2 mesas y 1 pedido confirmado con 4 ítems
--  (2 platos -> Cocina, 2 bebidas -> Bar).
--
--  Es idempotente: se puede correr varias veces sin duplicar (usa IDs fijos).
--  Para borrar la demo: ver el bloque del final (comentado).
-- ============================================================================

-- ---- Productos -------------------------------------------------------------
insert into public.productos
  (id, tipo, sector, nombre, descripcion, precio, tiempo_elaboracion_minutos,
   en_carta, fotos)
values
  ('11111111-1111-1111-1111-111111111101', 'plato', 'cocina', 'Milanesa napolitana',
   'Con papas fritas', 8500.00, 20, true,
   array['https://placehold.co/600x400?text=Mila+1',
         'https://placehold.co/600x400?text=Mila+2',
         'https://placehold.co/600x400?text=Mila+3']),

  ('11111111-1111-1111-1111-111111111102', 'plato', 'cocina', 'Ñoquis caseros',
   'Salsa a elección', 7200.00, 15, true,
   array['https://placehold.co/600x400?text=Noquis+1',
         'https://placehold.co/600x400?text=Noquis+2',
         'https://placehold.co/600x400?text=Noquis+3']),

  ('11111111-1111-1111-1111-111111111201', 'bebida', 'bar', 'Coca-Cola 500ml',
   'Bien fría', 2500.00, 2, true,
   array['https://placehold.co/600x400?text=Coca+1',
         'https://placehold.co/600x400?text=Coca+2',
         'https://placehold.co/600x400?text=Coca+3']),

  ('11111111-1111-1111-1111-111111111202', 'bebida', 'bar', 'Agua sin gas 500ml',
   '', 1800.00, 1, true,
   array['https://placehold.co/600x400?text=Agua+1',
         'https://placehold.co/600x400?text=Agua+2',
         'https://placehold.co/600x400?text=Agua+3'])
on conflict (id) do nothing;

-- ---- Mesas ---------------------------------------------------------------
--  (qr_payload / qr_url acá son de mentira; las mesas reales las genera el
--   backend en el Punto 4. Esto es solo para que el pedido demo tenga mesa.)
insert into public.mesas
  (id, numero, cantidad_comensales, tipo, disponibilidad, foto_url,
   qr_token, qr_payload, qr_url)
values
  ('22222222-2222-2222-2222-222222222201', 901, 4, 'estandar', 'ocupada',
   'https://placehold.co/600x400?text=Mesa+901',
   '33333333-3333-3333-3333-333333333301',
   '{"tipo":"mesa","mesaId":"22222222-2222-2222-2222-222222222201","numero":901}',
   'https://placehold.co/300x300?text=QR+901'),

  ('22222222-2222-2222-2222-222222222202', 902, 2, 'vip', 'vacia',
   'https://placehold.co/600x400?text=Mesa+902',
   '33333333-3333-3333-3333-333333333302',
   '{"tipo":"mesa","mesaId":"22222222-2222-2222-2222-222222222202","numero":902}',
   'https://placehold.co/300x300?text=QR+902')
on conflict (id) do nothing;

-- ---- Pedido demo (lo haría el Módulo 3) --------------------------------
insert into public.pedidos (id, mesa_id, estado)
values ('44444444-4444-4444-4444-444444444401',
        '22222222-2222-2222-2222-222222222201', 'confirmado')
on conflict (id) do nothing;

insert into public.pedido_items (id, pedido_id, producto_id, cantidad, estado)
values
  -- estos 2 caen en COCINA (sector = 'cocina')
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401',
   '11111111-1111-1111-1111-111111111101', 2, 'pendiente'),
  ('55555555-5555-5555-5555-555555555502', '44444444-4444-4444-4444-444444444401',
   '11111111-1111-1111-1111-111111111102', 1, 'pendiente'),
  -- estos 2 caen en BAR (sector = 'bar')
  ('55555555-5555-5555-5555-555555555503', '44444444-4444-4444-4444-444444444401',
   '11111111-1111-1111-1111-111111111201', 3, 'pendiente'),
  ('55555555-5555-5555-5555-555555555504', '44444444-4444-4444-4444-444444444401',
   '11111111-1111-1111-1111-111111111202', 3, 'pendiente')
on conflict (id) do nothing;

-- ---- Para limpiar la demo (descomentar y correr) --------------------------
-- delete from public.pedido_items where pedido_id = '44444444-4444-4444-4444-444444444401';
-- delete from public.pedidos       where id      = '44444444-4444-4444-4444-444444444401';
-- delete from public.mesas         where numero in (901, 902);
-- delete from public.productos     where id like '11111111-1111-1111-1111-1111111111%';
