import React, { useState, useRef, useEffect } from 'react';
import { SendIcon, PaperclipIcon, MicrophoneIcon } from '../constants';
import { startRecognition, stopRecognition } from '../services/speechService';

interface ChatInputProps {
    onSubmit: (content: string) => void;
    isLoading: boolean;
    onUploadClick: () => void;
    hasStartedChat: boolean;
    isMobile?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isLoading, onUploadClick, hasStartedChat, isMobile = false }) => {
    const [content, setContent] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            const maxHeight = isMobile ? 96 : 128; // Smaller max height on mobile
            textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
        }
    }, [content, isMobile]);
    
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

    const handleMicClick = () => {
        if (isRecording) {
            stopRecognition();
            setIsRecording(false);
        } else {
            startRecognition(
                (transcript) => {
                    setContent(prev => prev ? prev + ' ' + transcript : transcript);
                    setIsRecording(false);
                },
                () => setIsRecording(false),
                () => setIsRecording(false)
            );
            setIsRecording(true);
        }
    };

    const canSubmit = content.trim() && !isLoading;
    const showLongPlaceholder = !isLoading && !hasStartedChat;
    const placeholderText = isLoading 
        ? "Analyzing..." 
        : hasStartedChat 
            ? (isMobile ? "Ask a question..." : "Ask a follow-up question...")
            : (isMobile ? "Upload a document or ask a question..." : "Upload a document or ask a question to get started...");

    return (
        <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3 w-full">
            <div className="flex flex-1 items-center bg-neutral-900/80 border border-neutral-700 rounded-2xl shadow-md px-3 py-0.5 sm:py-1 gap-2 min-h-[40px]">
                {/* Left icons */}
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleMicClick}
                        className={`p-1.5 rounded-full border border-spotify text-spotify hover:bg-spotify/10 transition ${isRecording ? 'bg-spotify/20 animate-pulse' : ''}`}
                        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
                        disabled={isLoading}
                    >
                        <MicrophoneIcon className="w-5 h-5" />
                    </button>
                    <button
                        type="button"
                        onClick={onUploadClick}
                        className="p-1 rounded-full text-gray-400 hover:text-spotify transition-all transform hover:scale-110 active:scale-100"
                        aria-label="Attach file"
                        disabled={isLoading}
                    >
                        <PaperclipIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholderText}
                    className="flex-1 bg-transparent text-gray-200 placeholder-gray-400 border-0 outline-none resize-none text-sm sm:text-base px-2 min-h-[20px] max-h-20 h-[32px] flex items-center justify-center pt-0.5 pb-0.5"
                    rows={1}
                    disabled={isLoading}
                    style={{ minHeight: 20, height: 32, display: 'flex', alignItems: 'center' }}
                />
            </div>
            <button
                type="submit"
                disabled={!canSubmit}
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-200 transform active:scale-95 ${canSubmit ? 'bg-spotify text-white hover:shadow-lg hover:shadow-spotify/30' : 'bg-neutral-900 text-gray-600 cursor-not-allowed'}`}
                aria-label="Send message"
            >
                <SendIcon />
            </button>
        </form>
    );
};

export default ChatInput;