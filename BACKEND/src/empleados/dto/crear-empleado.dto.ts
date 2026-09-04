import { IsEmail, IsIn, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

const ROLES_EMPLEADO = ['dueño', 'supervisor', 'cocinero'] as const;
export type RolEmpleado = (typeof ROLES_EMPLEADO)[number];

export class CrearEmpleadoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, { message: 'El nombre solo puede contener letras y espacios' })
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, { message: 'El apellido solo puede contener letras y espacios' })
  apellido!: string;

  @IsString()
  @Matches(/^\d{7,8}$/, { message: 'El DNI debe tener 7 u 8 dígitos, sin puntos' })
  dni!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.replace(/-/g, '') : value))
  @IsString()
  @Matches(/^\d{11}$/, { message: 'El CUIL debe tener 11 dígitos (con o sin guiones)' })
  cuil!: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'La contraseña debe tener una mayúscula, una minúscula y un número',
  })
  password!: string;

  @IsIn(ROLES_EMPLEADO, { message: `El perfil debe ser uno de: ${ROLES_EMPLEADO.join(', ')}` })
  rol!: RolEmpleado;

  @IsString()
  @IsNotEmpty({ message: 'La foto es obligatoria' })
  fotoBase64!: string; // data URL (base64) que manda el front desde la cámara
}