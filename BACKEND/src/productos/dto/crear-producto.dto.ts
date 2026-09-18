import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para el alta de un producto de la carta.
 *
 * Sirve para el Punto 2 (plato) y el Punto 3 (bebida). El campo `tipo` (y su
 * `sector`) NO vienen en el body: los fija el controller según el endpoint
 * que se llame (`/productos/platos` o `/productos/bebidas`), así el cocinero
 * nunca puede cargar una bebida ni el cantinero un plato.
 *
 * Las 3 fotos llegan como 3 campos sueltos (mejor UX en el form: 3 botones,
 * 3 previews) y el service las junta en el array `fotos` que pide la base.
 */
export class CrearProductoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre es muy corto' })
  @MaxLength(80, { message: 'El nombre es muy largo (máx. 80 caracteres)' })
  nombre!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, {
    message: 'La descripción es muy larga (máx. 300 caracteres)',
  })
  descripcion?: string;

  // Precio en pesos. Acepta decimales (ej: 8500.50). Se transforma a número
  // por si el front lo manda como string.
  @Type(() => Number)
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'El precio debe ser un número con hasta 2 decimales' },
  )
  @Min(1, { message: 'El precio tiene que ser mayor a 0' })
  @Max(9999999, { message: 'El precio es demasiado alto' })
  precio!: number;

  // Tiempo de elaboración en MINUTOS enteros.
  @Type(() => Number)
  @IsInt({
    message: 'El tiempo de elaboración debe ser un número entero de minutos',
  })
  @Min(1, {
    message: 'El tiempo de elaboración tiene que ser al menos 1 minuto',
  })
  @Max(240, {
    message: 'El tiempo de elaboración no puede superar los 240 minutos',
  })
  tiempoElaboracion!: number;

  // "Verificación en carta" (Punto 2): si es false, el producto queda cargado
  // pero NO se muestra en la carta del cliente. Por defecto true.
  @IsOptional()
  @IsBoolean()
  enCarta?: boolean;

  // Las 3 fotos son obligatorias por consigna. Llegan como Data URL base64.
  @IsString()
  @IsNotEmpty({ message: 'La foto 1 es obligatoria' })
  foto1Base64!: string;

  @IsString()
  @IsNotEmpty({ message: 'La foto 2 es obligatoria' })
  foto2Base64!: string;

  @IsString()
  @IsNotEmpty({ message: 'La foto 3 es obligatoria' })
  foto3Base64!: string;
}
