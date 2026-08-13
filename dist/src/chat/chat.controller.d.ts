import { ChatService } from './chat.service';
import { ChatRequestDto } from './dto/chat-request.dto';
import { ChatHistoryMessageDto, ChatResponseDto } from './dto/chat-response.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    sendMessage(chatRequestDto: ChatRequestDto): Promise<ChatResponseDto>;
    getSessionMessages(sessionId: string): Promise<ChatHistoryMessageDto[]>;
}
