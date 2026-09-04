import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegistrarTokenDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsOptional()
  @IsIn(['android', 'ios', 'web'])
  platform?: string;
}