import React, { useState } from 'react';
import { Message, MessageRole } from '../types';
import { FlagrIcon, UserIcon, CopyIcon, CheckIcon, SpeakerIcon } from '../constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/styles/prism';
import { speakText, stopSpeaking } from '../services/speechService';

interface ChatMessageProps {
    message: Message;
    isLoading?: boolean;
    className?: string;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1.5">
        <span className="w-2 h-2 bg-spotify rounded-full animate-bounce-scale" style={{ animationDelay: '0s' }}></span>
        <span className="w-2 h-2 bg-spotify rounded-full animate-bounce-scale" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-2 h-2 bg-spotify rounded-full animate-bounce-scale" style={{ animationDelay: '0.4s' }}></span>
    </div>
);

const CodeCopyButton: React.FC<{ text: string }> = ({ text }) => {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-all"
            aria-label="Copy code"
        >
            {isCopied ? <CheckIcon className="w-4 h-4 text-spotify" /> : <CopyIcon className="w-4 h-4" />}
        </button>
    );
};

const MessageContent: React.FC<{ content: string }> = ({ content }) => {
     return (
        <div className="prose prose-sm prose-invert max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed 
                        prose-p:m-0 prose-p:leading-relaxed 
                        prose-ul:my-2 prose-ol:my-2
                        prose-headings:my-3 prose-headings:text-white
                        prose-strong:text-white
                        prose-a:text-spotify prose-a:no-underline hover:prose-a:underline
                        prose-code:text-sm prose-pre:text-sm">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeText = String(children).replace(/\n$/, '');
                        return !inline && match ? (
                            <div className="relative my-2">
                                <CodeCopyButton text={codeText} />
                                <SyntaxHighlighter
                                    style={dark as any}
                                    language={match[1]}
                                    PreTag="div"
                                    className="!bg-neutral-900 rounded-lg !p-3 sm:!p-4 !text-xs sm:!text-sm"
                                >
                                    {codeText}
                                </SyntaxHighlighter>
                             </div>
                        ) : (
                            <code className="bg-neutral-900 text-spotify rounded px-1.5 py-0.5 text-xs sm:text-sm font-mono" {...props}>
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false, className = '' }) => {
    const isAssistant = message.role === MessageRole.ASSISTANT;
    const [isSpeaking, setIsSpeaking] = useState(false);

    const handleListen = () => {
        if (isSpeaking) {
            stopSpeaking();
            setIsSpeaking(false);
        } else {
            speakText(message.content, () => setIsSpeaking(false));
            setIsSpeaking(true);
        }
    };

    return (
        <div className={`group flex items-start ${isAssistant ? '' : 'flex-row-reverse'} animate-fadeInSlideUp ${typeof window !== 'undefined' && window.innerWidth <= 768 ? 'mb-3' : 'mb-2 sm:mb-4'} gap-2.5 sm:gap-3.5 ${className}`}>
            <div className="flex-shrink-0">
                {isAssistant ? <FlagrIcon /> : <UserIcon />}
            </div>
            <div className={`flex flex-col flex-1 w-0 ${isAssistant ? 'items-start' : 'items-end'}`}>
                 <div className="flex items-end gap-2">
                    <div className={`relative px-5 sm:px-7 py-2.5 sm:py-3 min-h-[40px] sm:min-h-[48px] rounded-3xl shadow-lg flex items-center
    ${isAssistant 
        ? 'bg-neutral-800/90 text-gray-300 rounded-bl-2xl' 
        : 'bg-neutral-700/90 text-gray-100 rounded-br-2xl'}
    ${typeof window !== 'undefined' && window.innerWidth <= 768 ? 'max-w-[85vw]' : 'max-w-full'}`}
                    >
                        <div className="flex-1 flex items-center">
                            {isLoading ? <LoadingIndicator /> : <MessageContent content={message.content} />}
                        </div>
                        {isAssistant && !isLoading && (
                            <button
                                onClick={handleListen}
                                className={`ml-3 p-1.5 rounded-full border border-spotify text-spotify hover:bg-spotify/10 transition ${isSpeaking ? 'bg-spotify/20' : ''}`}
                                aria-label={isSpeaking ? 'Stop listening' : 'Listen to message'}
                                style={{ alignSelf: 'center' }}
                            >
                                <SpeakerIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                 </div>
                {!isLoading && message.timestamp && (
                     <p className="text-xs text-gray-500 mt-1 sm:mt-1.5 px-1">
                        {message.timestamp}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;