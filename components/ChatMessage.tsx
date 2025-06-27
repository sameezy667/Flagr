import React, { useState } from 'react';
import { Message, MessageRole } from '../types';
import { FlagrIcon, UserIcon, CopyIcon, CheckIcon } from '../constants';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
    message: Message;
    isLoading?: boolean;
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
                        prose-a:text-spotify prose-a:no-underline hover:prose-a:underline">
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
                                    style={vscDarkPlus as any}
                                    language={match[1]}
                                    PreTag="div"
                                    className="!bg-neutral-900 rounded-lg !p-4 !text-sm"
                                >
                                    {codeText}
                                </SyntaxHighlighter>
                             </div>
                        ) : (
                            <code className="bg-neutral-900 text-spotify rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
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

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLoading = false }) => {
    const isAssistant = message.role === MessageRole.ASSISTANT;

    return (
        <div className={`group flex items-start gap-3.5 animate-fadeInSlideUp ${!isAssistant ? 'flex-row-reverse' : ''}`}>
            {isAssistant ? <FlagrIcon /> : <UserIcon />}
            <div className={`flex flex-col flex-1 w-0 ${isAssistant ? 'items-start' : 'items-end'}`}>
                 <div className="flex items-end gap-2">
                    <div className={`relative max-w-full px-4 py-3 rounded-2xl ${
                        isAssistant 
                            ? 'bg-gradient-to-br from-neutral-800 to-neutral-800/80 text-gray-300 rounded-bl-none' 
                            : 'bg-gradient-to-br from-neutral-700 to-neutral-700/80 text-gray-100 rounded-br-none'
                    }`}>
                        
                        {isLoading ? <LoadingIndicator /> : <MessageContent content={message.content} />}
                        
                    </div>
                 </div>
                {!isLoading && message.timestamp && (
                     <p className="text-xs text-gray-500 mt-1.5 px-1">
                        {message.timestamp}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;