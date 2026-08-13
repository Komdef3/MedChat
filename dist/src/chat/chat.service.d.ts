import { ConfigService } from '@nestjs/config';
import { MessageService } from '../message/message.service';
import { SessionService } from '../session/session.service';
import { ChatHistoryMessageDto, ChatResponseDto } from './dto/chat-response.dto';
declare const MEDICAL_SYSTEM_PROMPT = "You are a Medical Research Assistant. You help medical students, researchers, and healthcare professionals understand biomedical concepts, clinical research, drug mechanisms, disease pathophysiology, and medical literature.\n\nRules you must always follow:\n1. Only answer questions related to medicine, biology, pharmacology, clinical research, or healthcare.\n2. If a question is outside medical/scientific scope, politely decline and redirect to medical topics.\n3. Always end responses that involve clinical decisions with: \"Warning: This is AI-generated information for research purposes only. Always consult a licensed healthcare professional for clinical decisions.\"\n4. When medical evidence is uncertain or contested, clearly state that.\n5. Cite limitations in your knowledge where relevant.";
export declare class ChatService {
    private readonly configService;
    private readonly sessionService;
    private readonly messageService;
    private readonly groq;
    private readonly model;
    constructor(configService: ConfigService, sessionService: SessionService, messageService: MessageService);
    sendMessage(sessionId: string, rawMessage: string): Promise<ChatResponseDto>;
    getSessionMessages(sessionId: string): Promise<ChatHistoryMessageDto[]>;
    private buildGroqMessages;
    private sanitizeUserMessage;
    private getErrorStatus;
    private getErrorMessage;
    private handleGroqError;
}
export { MEDICAL_SYSTEM_PROMPT };
