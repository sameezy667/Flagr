import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon } from '../constants';

interface ChatInputProps {
    onSubmit: (content: string) => void;
    isLoading: boolean;
    onUploadClick: () => void;
    hasStartedChat: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading, onUploadClick, hasStartedChat }) => {
    const [content, setContent] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${Math.min(scrollHeight, 128)}px`; // max-h-32
        }
    }, [content]);
    
    const doSubmit = () => {
        if (content.trim() && !isLoading) {
            onSubmit(content);
            setContent('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        doSubmit();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            doSubmit();
        }
    };

    const canSubmit = content.trim() && !isLoading;
    const showLongPlaceholder = !isLoading && !hasStartedChat;
    const placeholderText = isLoading 
        ? "Analyzing..." 
        : hasStartedChat 
            ? "Ask a follow-up question..." 
            : "Upload a document or ask a question to get started...";

    return (
        <form onSubmit={handleSubmit} className="flex items-end gap-3 w-full">
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholderText}
                    className="w-full bg-neutral-900 text-gray-200 placeholder-gray-400 border border-neutral-700 rounded-xl py-3 pl-11 pr-4 resize-none focus:outline-none focus:shadow-[inset_0_0_0_2px_#1DB954] transition-all duration-200"
                    rows={showLongPlaceholder ? 2 : 1}
                    disabled={isLoading}
                />
                <button
                    type="button"
                    onClick={onUploadClick}
                    className="absolute left-3 bottom-3 p-1 rounded-full text-gray-400 hover:text-spotify transition-all transform hover:scale-110 active:scale-100"
                    aria-label="Attach file"
                    disabled={isLoading}
                >
                    <PaperclipIcon className="w-5 h-5" />
                </button>
            </div>
             <button
                type="submit"
                disabled={!canSubmit}
                className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200 transform active:scale-95 ${canSubmit ? 'bg-spotify text-white hover:shadow-lg hover:shadow-spotify/30' : 'bg-neutral-900 text-gray-600 cursor-not-allowed'}`}
                aria-label="Send message"
            >
                <SendIcon />
            </button>
        </form>
    );
};

export default ChatInput;