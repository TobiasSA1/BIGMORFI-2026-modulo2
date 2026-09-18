# Módulo 2 — Catálogo, Mesas y Sectores (SQL)

Estos scripts crean todo lo que el Módulo 2 necesita en la base de Supabase.
Se corren **en orden** desde el SQL Editor de Supabase (o `psql`), una sola vez.
Son re-corribles: si los ejecutás dos veces no rompen nada (usan
`if not exists` / `on conflict` / bloques que atrapan "ya existe").

| Archivo | Qué hace | Puntos de la consigna |
|---|---|---|
| `00_tipos_y_funcion.sql` | Enums (`tipo_mesa`, `disponibilidad_mesa`, `tipo_producto`, `sector_preparacion`) + función `set_updated_at()` | Base para todo lo demás |
| `01_productos.sql` | Tabla `productos` (platos y bebidas de la carta) | 2, 3 |
| `02_mesas.sql` | Tabla `mesas`, con su token de QR y su estado de ocupación | 4 |
| `03_pedidos_contrato.sql` | Tablas `pedidos` y `pedido_items`. **Es un contrato con el Módulo 3.** Se crean con `IF NOT EXISTS` para no pisar lo que haga Nahue. | 16, 17 |
| `04_storage_buckets.sql` | Deja anotados los buckets de Storage que hay que crear a mano | 2, 3, 4 |
| `99_seed_demo.sql` | Carga datos de ejemplo para poder probar Cocina y Bar sin depender del Módulo 3 | 16, 17 |

## Esquema consensuado con el Módulo 3 (Nahue)

`mesas` y `productos` quedaron definidas junto con Nahue para que el estado de
ocupación de la mesa (`disponibilidad`, `reservada_para`, `ocupada_por`) le
sirva directo a su lista de espera / asignación de mesa. Cosas a tener en cuenta:

- **`tipo_producto` incluye `'postre'`**, preparado para el futuro. El Módulo 2
  (Puntos 2 y 3) solo implementa alta de **plato** y **bebida** por ahora.
- **`sector`** (`cocina` / `bar`) es una columna aparte de `tipo`, porque ya no
  es 1 a 1 (un postre también puede salir de cocina). Cocina y Bar (Puntos 16
  y 17) filtran por `sector`, no por `tipo`.
- **`fotos`** es un array de texto (no 3 columnas fijas). El front igual pide
  3 fotos; el backend valida esa cantidad antes de guardar.
- Todo tiene `eliminado` (soft delete) y `updated_at` con trigger automático.

## Por qué existe `03_pedidos_contrato.sql`

Los puntos 16 y 17 (Cocina y Bar) consumen pedidos que **crea el Módulo 3**
(Sala/Pedidos/Mozo). Si Nahue todavía no la armó, este script deja la forma
mínima que necesito. Cuando él arranque:

- Si todavía no creó nada -> este script ya le deja las tablas base.
- Si ya las creó -> el `IF NOT EXISTS` no pisa nada; solo hay que chequear que
  los nombres de columnas coincidan (está documentado en el propio `.sql`).

## Buckets de Storage a crear (Dashboard de Supabase > Storage)

- `productos`  -> público. Guarda las 3 fotos de cada plato/bebida.
- `mesas`      -> público. Guarda la foto de cada mesa y el PNG de su QR.

(El bucket `fotos-perfil` ya lo creó el Módulo 1.)
