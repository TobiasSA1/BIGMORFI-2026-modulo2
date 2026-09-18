# Módulo 2 — Catálogo, Mesas y Sectores (Tobi)

Documentación de lo que hice para el Módulo 2, cómo se integra con el resto sin
pisar nada, y cómo probar cada punto.

> **Stack real del proyecto** (lo que hay en la rama `feature/auth`, NO lo del
> documento inicial de IA): **Backend NestJS** (`BACKEND/`) + **Frontend Ionic +
> Angular** (`FRONTEND/`) + **Supabase** (Postgres + Auth + Storage) + Resend
> (mails) + firebase-admin (push). Todo lo del Módulo 2 sigue ese stack.

---

## 1. Puntos entregados

| Punto | Qué es | Backend | Frontend |
|---|---|---|---|
| **2** | Alta de plato (cocinero): 3 fotos, tiempo, precio, verificación en carta | `productos/` → `POST /productos/platos` | `catalogo/alta-plato/` |
| **3** | Alta de bebida (cantinero): 3 fotos, tiempo, precio | `productos/` → `POST /productos/bebidas` | `catalogo/alta-bebida/` |
| **4** | Alta de mesa (dueño/supervisor): comensales, tipo, foto, **QR automático** | `mesas/` + `qr/` → `POST /mesas` | `catalogo/alta-mesa/` |
| **16** | Cocina: pedidos pendientes agrupados por mesa + marcar listo | `preparacion/` → `GET /cocina/pendientes`, `PATCH /cocina/items/:id/listo` | `catalogo/cocina/` |
| **17** | Bar: ídem cocina pero con bebidas | `preparacion/` → `GET /bar/pendientes`, `PATCH /bar/items/:id/listo` | `catalogo/bar/` |

---

## 2. Esquema de base de datos: consensuado con el Módulo 3 (Nahue)

`mesas` y `productos` se re-diseñaron junto con Nahue (respecto a la primera
versión) para que el estado de ocupación de la mesa le sirva directo a su
lista de espera / asignación de mesa. Cambios importantes a tener en cuenta:

- **`mesas.disponibilidad`** (`vacia`/`reservada`/`ocupada`) + `reservada_para`
  + `ocupada_por`: lo administra el Módulo 3. El Módulo 2 solo la crea (nace
  `vacia`) y la muestra, nunca la cambia.
- **`productos.tipo`** ahora incluye `'postre'` además de `plato`/`bebida`,
  preparado para el futuro. El Módulo 2 solo implementa alta de **plato** y
  **bebida** (Puntos 2 y 3).
- **`productos.sector`** (`cocina`/`bar`) es una columna aparte de `tipo`,
  porque ya no es 1 a 1. Cocina y Bar (Puntos 16 y 17) filtran por `sector`.
- **`productos.fotos`** es un array de texto (no 3 columnas fijas). El
  formulario sigue pidiendo 3 fotos; el backend las junta en el array antes
  de guardar.
- Ambas tablas tienen **`eliminado`** (soft delete) y **`updated_at`** con
  trigger automático (`set_updated_at()`, ver `00_tipos_y_funcion.sql`).
- El **QR de la mesa** (`qr_token`, `qr_payload`, `qr_url`) es 100% del
  Módulo 2 — se genera automáticamente al dar de alta (Punto 4).

Detalle completo y los `.sql` en `BACKEND/sql/modulo-2-catalogo/`.

---

## 3. Archivos nuevos (todo esto es 100% mío, no toca nada de nadie)

### Backend
```
BACKEND/sql/modulo-2-catalogo/      <- scripts SQL (ver su propio README.md)
BACKEND/src/catalogo/catalogo.module.ts   <- módulo "paraguas" del Módulo 2
BACKEND/src/productos/              <- Puntos 2 y 3
BACKEND/src/mesas/                  <- Punto 4
BACKEND/src/qr/                     <- generación de QR (usado por mesas)
BACKEND/src/preparacion/            <- Puntos 16 y 17 (Cocina + Bar)
BACKEND/src/common/storage/         <- helper para subir imágenes a Storage
```

### Frontend
```
FRONTEND/src/app/catalogo/catalogo.service.ts   <- todas las llamadas HTTP del Módulo 2
FRONTEND/src/app/catalogo/alta-plato/            <- Punto 2
FRONTEND/src/app/catalogo/alta-bebida/           <- Punto 3
FRONTEND/src/app/catalogo/alta-mesa/             <- Punto 4
FRONTEND/src/app/catalogo/cocina/                <- Punto 16
FRONTEND/src/app/catalogo/bar/                   <- Punto 17
```

## 4. Archivos compartidos que toqué (lo mínimo, todo marcado con comentarios `Módulo 2`)

| Archivo | Cambio | Por qué |
|---|---|---|
| `BACKEND/src/app.module.ts` | +1 import y +1 línea en `imports[]` (`CatalogoModule`) | NestJS necesita registrar el módulo para que existan las rutas. |
| `BACKEND/package.json` | +`qrcode` y +`@types/qrcode` | Para generar el PNG del QR de la mesa en el servidor. |
| `FRONTEND/src/app/app.routes.ts` | +5 rutas (`catalogo/...`) | Registrar las pantallas nuevas. |
| `FRONTEND/src/app/home/home.page.html` | +botones por rol (bloque marcado) | Para poder entrar a las pantallas nuevas desde el home, igual que hizo el Módulo 1. |
| `FRONTEND/src/app/core/services/auth.service.ts` | Agregué `'cantinero'` y `'mozo'` al tipo `Perfil.rol` | Ya son roles válidos del Módulo 1 (están en su DTO). Sin esto, TypeScript no deja comparar `perfil.rol === 'cantinero'`. |

> Todos los bloques agregados en archivos compartidos están rodeados por
> comentarios `Módulo 2 ... fin Módulo 2` para que en el Pull Request se vea
> exactamente qué agregué y el merge sea trivial.

---

## 5. Trabajar "a ciegas": el contrato con el Módulo 3

Los puntos 16 y 17 (Cocina/Bar) **consumen pedidos que crea el Módulo 3**
(Sala/Pedidos/Mozo), que todavía no existe. Para no quedar bloqueado:

- Definí la forma mínima de las tablas `pedidos` y `pedido_items` en
  `BACKEND/sql/modulo-2-catalogo/03_pedidos_contrato.sql` (se crean con
  `IF NOT EXISTS`, así cuando Nahue arranque su módulo no se pisa nada).
- Hay un **seed de demo** (`99_seed_demo.sql`) que carga un pedido de mentira
  para poder probar Cocina y Bar sin depender del Módulo 3.
- Cuando el pedido queda 100% listo, mi código deja `pedidos.estado = 'listo'`
  y devuelve `pedidoCompleto: true`. El push del Punto 18 lo dispara el Módulo 3
  (dejé un `// TODO Módulo 3` en `preparacion.service.ts` marcando el lugar).

El QR de la mesa (Punto 4) codifica este JSON, que el Módulo 3 va a leer cuando
el cliente escanee la mesa:
```json
{ "tipo": "mesa", "mesaId": "<uuid>", "numero": 5, "token": "<uuid>" }
```

---

## 6. Cómo levantarlo

### 6.1. Preparar la base (una sola vez, EN ORDEN)

En el **SQL Editor de Supabase**, correr en orden los archivos de
`BACKEND/sql/modulo-2-catalogo/`:

1. `00_tipos_y_funcion.sql` (enums + función `set_updated_at`)
2. `01_productos.sql`
3. `02_mesas.sql`
4. `03_pedidos_contrato.sql`
5. `04_storage_buckets.sql` (o crear los buckets `productos` y `mesas` a mano,
   públicos, desde Storage → New bucket)
6. `99_seed_demo.sql` (opcional, solo para la demo de Cocina/Bar)

### 6.2. Backend

```bash
cd BACKEND
npm install
# Necesita un archivo .env (NO está en el repo). Pedírselo a Lauti Alderete;
# tiene que tener al menos:
#   SUPABASE_URL=...
#   SUPABASE_SERVICE_ROLE_KEY=...
#   SUPABASE_ANON_KEY=...
#   (RESEND_API_KEY / FIREBASE_* los usa el Módulo 1, no el 2)
npm run start:dev
```
El backend queda en `http://localhost:3000`.

### 6.3. Frontend

> **Node**: la versión de este proyecto necesita **Node ≥ 24.15.0** (o
> ≥ 22.22.3). Con una anterior, `ng` no arranca. (`node -v` para chequear.)

```bash
cd FRONTEND
npm install
npm start        # abre http://localhost:4200 (es "ng serve", no "ionic serve")
```

---

## 7. Cómo testear cada punto

Ver ejemplos de `curl` para cada punto (alta de plato/bebida/mesa, cocina,
bar, validaciones y roles) en el historial de la entrega o pedirle a Tobi el
detalle — la lógica de endpoints no cambió respecto a la primera versión,
solo cambiaron los nombres de columnas (`tiempo_elaboracion_minutos`, `fotos`
como array, `sector`).

---

## 8. Estado de esta reconstrucción (nota para el propio Tobi)

Este código se reconstruyó en una PC nueva porque la rama
`feature/modulo-2-catalogo` original nunca se llegó a pushear a GitHub desde
la otra máquina. Mismo contenido de fondo, actualizado para matchear el
esquema de base de datos consensuado con Nahue. **Todavía no se probó
ejecutando la app en esta PC** porque no tiene Node.js instalado — hace falta
instalarlo (https://nodejs.org, versión LTS más reciente) antes de correr
`npm install` en `BACKEND/` y `FRONTEND/`.

---

## 9. Cómo lo subo sin pisar nada (flujo de Git)

```bash
# La base es feature/auth (ahí está el Módulo 1; main está vacío).
git checkout feature/auth
git pull
git checkout -b feature/modulo-2-catalogo
# ... (los cambios ya están hechos) ...
git add BACKEND/sql BACKEND/src/catalogo BACKEND/src/productos BACKEND/src/mesas \
        BACKEND/src/qr BACKEND/src/preparacion BACKEND/src/common/storage \
        BACKEND/src/app.module.ts BACKEND/package.json BACKEND/package-lock.json \
        FRONTEND/src/app/catalogo FRONTEND/src/app/app.routes.ts \
        FRONTEND/src/app/home/home.page.html \
        FRONTEND/src/app/core/services/auth.service.ts docs/MODULO-2-TOBI.md
git commit -m "Módulo 2: catálogo, mesas y sectores (puntos 2, 3, 4, 16, 17)"
git push -u origin feature/modulo-2-catalogo
# Abrir Pull Request feature/modulo-2-catalogo -> feature/auth (o -> develop si el equipo decide unificar ahí)
```
