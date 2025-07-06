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
        <div className="flex-1 flex flex-col h-full max-h-screen overflow-hidden">
            <header className={`border-b border-neutral-800/50 flex justify-between items-center flex-shrink-0 bg-black/30 backdrop-blur-xl relative glass-pane z-10 ${isMobile ? 'px-4 py-3' : 'p-3 sm:p-4'}`}>
                <div className={`flex items-center min-w-0 flex-1 ${isMobile ? 'gap-3' : 'gap-2 sm:gap-3'}`}> 
                    {/* Sidebar toggle button (hamburger) - only on mobile */}
                    {isMobile && (
                        <button onClick={onToggleSidebar} className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-neutral-700 md:hidden flex-shrink-0">
                            <MenuIcon className="w-6 h-6" />
                        </button>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-200 truncate" title={session?.title}>
                            {session?.title ?? 'New Chat'}
                        </h2>
                        <p className="text-xs text-gray-400 hidden sm:block">AI-powered document analysis</p>
                    </div>
                </div>
                 {showViewAnalysisButton && (
                    <button 
                        onClick={onViewAnalysis}
                        className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm ml-2 sm:ml-4 px-2 sm:px-3 py-1.5 bg-spotify/20 text-spotify font-semibold rounded-lg hover:bg-spotify/30 transition-colors flex-shrink-0"
                    >
                        <DocumentChatIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">View Report</span>
                        <span className="sm:hidden">Report</span>
                    </button>
                 )}
            </header>

            {/* Add vertical spacing between header and chat area on mobile */}
            <div className={`flex-1 overflow-y-auto min-h-0 scrollbar-custom animate-fadeIn ${isMobile ? 'px-2 pt-2 pb-1' : 'p-3 sm:p-4 md:p-6'}`} style={{ scrollbarGutter: 'stable' }}>
                <ChatView
                    key={session.id}
                    session={session}
                    isProcessing={isProcessing}
                />
            </div>

            {/* Add extra bottom margin and horizontal padding on mobile to prevent overlap and crowding */}
            <div className={`border-t border-neutral-800/50 flex-shrink-0 bg-black/30 backdrop-blur-xl relative glass-pane z-10 ${isMobile ? 'px-4 py-2 mb-2' : 'p-3 sm:p-4'}`}>
                <ChatInput
                    onSubmit={onSendMessage}
                    isLoading={isProcessing}
                    onUploadClick={onUploadClick}
                    hasStartedChat={!!session && session.messages.length > 1}
                    isMobile={isMobile}
                />
            </div>
        </div>
    )
}


export default ChatPanel;