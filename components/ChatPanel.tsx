import React from 'react';
import { ChatSession } from '../types';
import ChatInput from './ChatInput';
import ChatView from './ChatView';
import { MenuIcon, DocumentChatIcon } from '../constants';

interface ChatPanelProps {
    session: ChatSession;
    isProcessing: boolean;
    onSendMessage: (content: string) => void;
    onUploadClick: () => void;
    onToggleSidebar: () => void;
    isMobile: boolean;
    onViewAnalysis?: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ session, isProcessing, onSendMessage, onUploadClick, onToggleSidebar, isMobile, onViewAnalysis }) => {
    
    const showViewAnalysisButton = isMobile && session.analysis && onViewAnalysis;

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            <header className="p-4 border-b border-neutral-800/50 flex justify-between items-center flex-shrink-0 bg-black/30 backdrop-blur-xl relative glass-pane">
                <div className="flex items-center gap-3">
                    <button onClick={onToggleSidebar} className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-neutral-700 md:hidden">
                        <MenuIcon className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-200 truncate" title={session?.title}>
                            {session?.title ?? 'New Chat'}
                        </h2>
                        <p className="text-xs text-gray-400">AI-powered document analysis</p>
                    </div>
                </div>
                 {showViewAnalysisButton && (
                    <button 
                        onClick={onViewAnalysis}
                        className="flex items-center gap-2 text-sm ml-4 px-3 py-1.5 bg-spotify/20 text-spotify font-semibold rounded-lg hover:bg-spotify/30 transition-colors flex-shrink-0"
                    >
                        <DocumentChatIcon className="w-4 h-4" />
                        <span>View Report</span>
                    </button>
                 )}
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 animate-fadeIn">
                <ChatView
                    key={session.id}
                    session={session}
                    isProcessing={isProcessing}
                />
            </div>

            <div className="p-4 border-t border-neutral-800/50 flex-shrink-0 bg-black/30 backdrop-blur-xl relative glass-pane">
                <ChatInput
                    onSubmit={onSendMessage}
                    isLoading={isProcessing}
                    onUploadClick={onUploadClick}
                    hasStartedChat={!!session && session.messages.length > 1}
                />
            </div>
        </div>
    )
}


export default ChatPanel;