import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { DNI_REGEX, PASSWORD_REGEX, SOLO_LETRAS_REGEX } from '../../common/constants/validation.constants';

export class RegistrarClienteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Matches(SOLO_LETRAS_REGEX, { message: 'El nombre solo puede contener letras y espacios' })
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  @Matches(SOLO_LETRAS_REGEX, { message: 'El apellido solo puede contener letras y espacios' })
  apellido!: string;

  @IsString()
  @Matches(DNI_REGEX, { message: 'El DNI debe tener 7 u 8 dígitos, sin puntos' })
  dni!: string;

  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(PASSWORD_REGEX, { message: 'La contraseña debe tener una mayúscula, una minúscula y un número' })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: 'La foto es obligatoria' })
  fotoBase64!: string;
}