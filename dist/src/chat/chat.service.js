"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEDICAL_SYSTEM_PROMPT = exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const dd_trace_1 = __importDefault(require("dd-trace"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const client_1 = require("@prisma/client");
const message_service_1 = require("../message/message.service");
const session_service_1 = require("../session/session.service");
const MEDICAL_SYSTEM_PROMPT = `You are a Medical Research Assistant. You help medical students, researchers, and healthcare professionals understand biomedical concepts, clinical research, drug mechanisms, disease pathophysiology, and medical literature.

Rules you must always follow:
1. Only answer questions related to medicine, biology, pharmacology, clinical research, or healthcare.
2. If a question is outside medical/scientific scope, politely decline and redirect to medical topics.
3. Always end responses that involve clinical decisions with: "Warning: This is AI-generated information for research purposes only. Always consult a licensed healthcare professional for clinical decisions."
4. When medical evidence is uncertain or contested, clearly state that.
5. Cite limitations in your knowledge where relevant.`;
exports.MEDICAL_SYSTEM_PROMPT = MEDICAL_SYSTEM_PROMPT;
let ChatService = class ChatService {
    configService;
    sessionService;
    messageService;
    groq;
    model = 'llama-3.3-70b-versatile';
    constructor(configService, sessionService, messageService) {
        this.configService = configService;
        this.sessionService = sessionService;
        this.messageService = messageService;
        this.groq = new groq_sdk_1.default({
            apiKey: this.configService.get('GROQ_API_KEY') ?? 'missing-api-key',
        });
    }
    async sendMessage(sessionId, rawMessage) {
        const sanitizedMessage = this.sanitizeUserMessage(rawMessage);
        await this.sessionService.ensureSession(sessionId);
        const history = await this.messageService.getMessagesBySession(sessionId);
        if (history.length === 0) {
            await this.sessionService.updateSessionSummary(sessionId, sanitizedMessage.substring(0, 50));
        }
        const messages = this.buildGroqMessages(history, sanitizedMessage);
        await this.messageService.saveMessage(sessionId, client_1.MessageRole.user, sanitizedMessage);
        const startedAt = Date.now();
        const span = dd_trace_1.default.startSpan('groq.chat.completions.create', {
            tags: {
                session_id: sessionId,
                model: this.model,
            },
        });
        try {
            const completion = await this.groq.chat.completions.create({
                model: this.model,
                messages,
                temperature: 0.2,
                max_completion_tokens: 1024,
            });
            const latencyMs = Date.now() - startedAt;
            span.setTag('groq_latency_ms', latencyMs);
            const reply = completion.choices[0]?.message?.content?.trim() ??
                'I could not generate a response for that medical research question.';
            await this.messageService.saveMessage(sessionId, client_1.MessageRole.assistant, reply, latencyMs);
            return {
                reply,
                sessionId,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            span.setTag('error', true);
            span.setTag('error.message', this.getErrorMessage(error));
            this.handleGroqError(error);
        }
        finally {
            span.finish();
        }
    }
    async getSessionMessages(sessionId) {
        await this.sessionService.ensureSession(sessionId);
        const messages = await this.messageService.getMessagesBySession(sessionId);
        return messages.map((message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            timestamp: message.createdAt.toISOString(),
        }));
    }
    buildGroqMessages(history, currentMessage) {
        const conversationHistory = history.map((message) => ({
            role: message.role,
            content: message.content,
        }));
        return [
            { role: 'system', content: MEDICAL_SYSTEM_PROMPT },
            ...conversationHistory,
            { role: 'user', content: currentMessage },
        ];
    }
    sanitizeUserMessage(message) {
        return (message
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
            .replace(/\s+/g, ' ')
            .trim());
    }
    getErrorStatus(error) {
        if (typeof error !== 'object' || error === null || !('status' in error)) {
            return undefined;
        }
        const status = error.status;
        return typeof status === 'number' ? status : undefined;
    }
    getErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'object' && error !== null && 'message' in error) {
            const message = error.message;
            return typeof message === 'string' ? message : 'Unknown Groq API error';
        }
        return 'Unknown Groq API error';
    }
    handleGroqError(error) {
        const status = this.getErrorStatus(error);
        if (status === 429) {
            throw new common_1.HttpException("You've sent too many messages. Please wait a moment before trying again.", common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        if (status && status >= 500) {
            throw new common_1.BadGatewayException('Groq AI service returned an upstream error.');
        }
        throw new common_1.ServiceUnavailableException('Could not connect to the AI service. Please check your connection and try again.');
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        session_service_1.SessionService,
        message_service_1.MessageService])
], ChatService);
//# sourceMappingURL=chat.service.js.map