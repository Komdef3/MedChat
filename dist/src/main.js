"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dd_trace_1 = __importDefault(require("dd-trace"));
dd_trace_1.default.init({
    service: process.env.DD_SERVICE ?? 'medical-chatbot-backend',
    env: process.env.DD_ENV ?? process.env.NODE_ENV ?? 'development',
    version: process.env.DD_VERSION,
});
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
function parseCorsOrigins(frontendUrl) {
    const defaults = ['http://localhost:3000', 'https://medai-virid.vercel.app'];
    if (!frontendUrl) {
        return defaults;
    }
    return Array.from(new Set([
        ...defaults,
        ...frontendUrl
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
    ]));
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.enableCors({
        origin: parseCorsOrigins(process.env.FRONTEND_URL),
        methods: ['GET', 'POST', 'OPTIONS'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
//# sourceMappingURL=main.js.map