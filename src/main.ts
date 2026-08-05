import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { PrismaClientExceptionFilter } from './core/filters/prisma-client-exception.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable CORS & Global API Prefix (/api)
  app.enableCors();
  app.setGlobalPrefix('api');

  // 2. Global Validation Pipe (sebagai pengganti manual Joi/Zod)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Hapus payload yang tidak ada di DTO
      forbidNonWhitelisted: true, // Error jika ada payload aneh
      transform: true, // Otomatis transform string ke number jika di DTO tipenya number
    }),
  );

  // 3. Global Exception Filter (Untuk standardisasi Error Response)
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(), // Tangkap error P2002 dll
  );

  // 4. Global Interceptor (Untuk standardisasi Success Response)
  app.useGlobalInterceptors(new TransformInterceptor());

  // 5. OpenAPI Setup (Scalar UI dengan Dynamic Import untuk Node 18 Compatibility)
  const enableSwagger =
    process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production';
  if (enableSwagger) {
    const swaggerTitle = process.env.SWAGGER_TITLE || 'Backend API';
    const swaggerDesc = process.env.SWAGGER_DESC || 'API Documentation';
    const swaggerVersion = process.env.SWAGGER_VERSION || '1.0';
    const swaggerPath = process.env.SWAGGER_PATH || 'api-docs';

    const config = new DocumentBuilder()
      .setTitle(swaggerTitle)
      .setDescription(swaggerDesc)
      .setVersion(swaggerVersion)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    try {
      const { apiReference } = await import('@scalar/nestjs-api-reference');
      app.use(
        `/${swaggerPath}`,
        apiReference({
          spec: {
            content: document,
          },
        }),
      );
    } catch {
      SwaggerModule.setup(swaggerPath, app, document);
    }
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
