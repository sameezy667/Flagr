import React, { useEffect, useRef } from 'react';
import { MessageRole, ChatSession } from '../types';
import ChatMessage from './ChatMessage';

interface ChatViewProps {
    session: ChatSession;
    isProcessing: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ session, isProcessing }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { messages: history } = session;

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isProcessing]);

    if (!history) {
        return null;
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {history.map((msg, idx) => (
                <ChatMessage key={msg.id} message={msg} 
                    className={idx === history.length - 1 ? 'mb-12' : ''} />
            ))}
            {isProcessing && history.length > 0 && history[history.length - 1]?.role === MessageRole.USER && (
                <ChatMessage 
                    message={{ id: 'loading', role: MessageRole.ASSISTANT, content: '', timestamp: '' }}
                    isLoading={true} 
                />
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatView;
