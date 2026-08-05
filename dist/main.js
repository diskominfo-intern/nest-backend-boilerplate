"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const http_exception_filter_1 = require("./core/filters/http-exception.filter");
const prisma_client_exception_filter_1 = require("./core/filters/prisma-client-exception.filter");
const transform_interceptor_1 = require("./core/interceptors/transform.interceptor");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new prisma_client_exception_filter_1.PrismaClientExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const enableSwagger = process.env.ENABLE_SWAGGER === 'true' || process.env.NODE_ENV !== 'production';
    if (enableSwagger) {
        const swaggerTitle = process.env.SWAGGER_TITLE || 'Backend API';
        const swaggerDesc = process.env.SWAGGER_DESC || 'API Documentation';
        const swaggerVersion = process.env.SWAGGER_VERSION || '1.0';
        const swaggerPath = process.env.SWAGGER_PATH || 'api-docs';
        const config = new swagger_1.DocumentBuilder()
            .setTitle(swaggerTitle)
            .setDescription(swaggerDesc)
            .setVersion(swaggerVersion)
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        try {
            const { apiReference } = await import('@scalar/nestjs-api-reference');
            app.use(`/${swaggerPath}`, apiReference({
                spec: {
                    content: document,
                },
            }));
        }
        catch (e) {
            swagger_1.SwaggerModule.setup(swaggerPath, app, document);
        }
    }
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map