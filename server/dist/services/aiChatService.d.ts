export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface ChatResponse {
    reply: string;
    actionRequired?: {
        type: 'CANCEL_INVOICE' | 'NAVIGATE' | 'VIEW_INVOICE' | 'VIEW_PARTY';
        title: string;
        description: string;
        targetId: string;
        payload?: any;
    };
    suggestedActions?: string[];
    dataPayload?: any;
}
export declare class AIChatService {
    /**
     * Process natural language query from user and route to real backend tools
     */
    static processMessage(query: string, history?: ChatMessage[]): Promise<ChatResponse>;
}
