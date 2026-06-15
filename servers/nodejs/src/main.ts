import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(appConfig.port);
  console.log(`CIDI Node.js demo server listening on http://localhost:${appConfig.port}`);
}

void bootstrap();
