"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const http_exception_filter_1 = require("./core/filters/http-exception.filter");
const prisma_client_exception_filter_1 = require("./core/filters/prisma-client-exception.filter");
const transform_interceptor_1 = require("./core/interceptors/transform.interceptor");
const swagger_1 = require("@nestjs/swagger");
const nestjs_api_reference_1 = require("@scalar/nestjs-api-reference");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter(), new prisma_client_exception_filter_1.PrismaClientExceptionFilter());
    app.useGlobalInterceptors(new transform_interceptor_1.TransformInterceptor());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Backend API')
        .setDescription('API Documentation for Boilerplate')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    app.use('/api-docs', (0, nestjs_api_reference_1.apiReference)({
        spec: {
            content: document,
        },
    }));
    await app.listen(3000);
    console.log(`Application is running on: http://localhost:3000`);
}
bootstrap();
//# sourceMappingURL=main.js.map