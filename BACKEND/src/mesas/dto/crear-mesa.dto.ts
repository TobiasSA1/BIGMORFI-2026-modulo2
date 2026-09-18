import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

const TIPOS_MESA = ['vip', 'estandar', 'movilidad_reducida'] as const;
export type TipoMesa = (typeof TIPOS_MESA)[number];

/**
 * DTO para el alta de mesa (Punto 4).
 * El QR NO se manda: lo genera el backend automáticamente.
 * La `disponibilidad` tampoco se manda: toda mesa nace 'vacia' (default de
 * la base); el Módulo 3 es quien la cambia cuando se reserva/ocupa.
 */
export class CrearMesaDto {
  // Número físico de la mesa. Tiene que ser único (se valida en el service).
  @Type(() => Number)
  @IsInt({ message: 'El número de mesa debe ser un entero' })
  @Min(1, { message: 'El número de mesa tiene que ser mayor a 0' })
  @Max(999, { message: 'El número de mesa no puede superar 999' })
  numero!: number;

  @Type(() => Number)
  @IsInt({ message: 'La cantidad de comensales debe ser un entero' })
  @Min(1, { message: 'La mesa tiene que tener al menos 1 comensal' })
  @Max(20, { message: 'Máximo 20 comensales por mesa' })
  cantidadComensales!: number;

  @IsIn(TIPOS_MESA, {
    message: `El tipo de mesa debe ser uno de: ${TIPOS_MESA.join(', ')}`,
  })
  tipo!: TipoMesa;

  // Foto de la mesa (Data URL base64). Obligatoria por consigna.
  @IsString()
  @IsNotEmpty({ message: 'La foto de la mesa es obligatoria' })
  fotoBase64!: string;
}
