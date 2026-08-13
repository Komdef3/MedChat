import { Message, MessageRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
export declare class MessageService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getMessagesBySession(sessionId: string): Promise<Message[]>;
    saveMessage(sessionId: string, role: MessageRole, content: string, groqLatencyMs?: number): Promise<Message>;
}
export { MessageRole };
