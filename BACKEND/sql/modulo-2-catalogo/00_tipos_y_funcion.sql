-- ============================================================================
--  MÓDULO 2 - Tipos (enums) y función genérica compartida
--
--  Va primero porque las tablas de productos.sql y mesas.sql usan estos tipos.
--
--  Los enums NO son idempotentes por defecto en Postgres (si corrés el script
--  dos veces, "ya existe" y explota). Los envuelvo en un bloque que atrapa ese
--  error puntual para poder re-correr el script sin drama.
-- ============================================================================

do $$ begin
  create type tipo_mesa as enum ('vip', 'estandar', 'movilidad_reducida');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  -- Estado de ocupación de la mesa (lo usa el Módulo 3: metre/lista de espera).
  create type disponibilidad_mesa as enum ('vacia', 'reservada', 'ocupada');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  -- 'postre' queda preparado en la base porque así lo definimos con Nahue,
  -- pero el Módulo 2 (Puntos 2 y 3) solo implementa alta de PLATO y BEBIDA.
  create type tipo_producto as enum ('plato', 'bebida', 'postre');
exception
  when duplicate_object then null;
end $$;

do $$ begin
  -- A qué área va cada producto cuando se pide (Puntos 16 y 17). Va aparte de
  -- "tipo" porque no es 1 a 1: un postre también puede salir de cocina.
  create type sector_preparacion as enum ('cocina', 'bar');
exception
  when duplicate_object then null;
end $$;

-- Trigger genérico para mantener "updated_at" al día en cualquier tabla que
-- lo tenga. `create or replace` sí es idempotente, este no da problema.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
