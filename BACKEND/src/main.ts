import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // elimina campos no declarados en el DTO
      forbidNonWhitelisted: true, // rechaza el request si vienen campos extra
      transform: true,            // convierte el body plano a instancia de la clase DTO
    }),
  );

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();