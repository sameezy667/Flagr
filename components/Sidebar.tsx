import React, { useState, useRef, useEffect } from 'react';
import { ChatSession, User } from '../types';
import { PlusIcon, PencilIcon, TrashIcon } from '../constants';
import UserProfile from './UserProfile';
import { BarChart2, Clock } from 'lucide-react';

interface SidebarProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    isExpanded: boolean;
    onNewChat: () => void;
    onSwitchSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    onRenameSession: (id: string, newTitle: string) => void;
    onToggle: () => void;
    user: User;
    onLogout: () => void;
    isMobile: boolean;
    onShowAnalytics?: () => void;
    onShowHistory?: () => void;
}

const SessionItem: React.FC<{
    session: ChatSession,
    isActive: boolean,
    isExpanded: boolean,
    onSwitch: () => void,
    onDelete: () => void,
    onRename: (newTitle: string) => void,
}> = ({ session, isActive, isExpanded, onSwitch, onDelete, onRename }) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [title, setTitle] = useState(session.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setTitle(session.title);
    }, [session.title]);
    
    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming]);
    
    const handleRenameSubmit = () => {
        if (title.trim()) {
            onRename(title.trim());
        } else {
            setTitle(session.title); // revert if empty
        }
        setIsRenaming(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleRenameSubmit();
        if (e.key === 'Escape') {
            setTitle(session.title);
            setIsRenaming(false);
        }
    };
    
    return (
        <div
            onClick={() => !isRenaming && onSwitch()}
            className={`group relative flex items-center justify-between p-2.5 rounded-lg text-sm truncate transition-all duration-300 cursor-pointer border ${
                isActive ? 'bg-neutral-700/80 font-semibold text-white border-spotify/80 animate-glow' : 'text-gray-400 border-transparent hover:bg-neutral-800/50 hover:text-gray-200 hover:border-spotify/30 hover:shadow-[0_0_20px_rgba(29,185,84,0.15)] hover:-translate-y-0.5'
            }`}
        >
            {isRenaming ? (
                 <input
                    ref={inputRef}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent border-0 ring-1 ring-spotify rounded p-0 m-0 text-white text-sm focus:ring-2 focus:outline-none"
                />
            ) : (
                <span className={`truncate transition-opacity duration-200 ${!isExpanded && 'opacity-0 md:opacity-100'}`}>
                    {session.title}
                </span>
            )}

            {isExpanded && !isRenaming && isActive && (
                <div className="absolute right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-700/80">
                    <button onClick={(e) => {e.stopPropagation(); setIsRenaming(true)}} className="p-1 hover:text-white"><PencilIcon className="w-4 h-4" /></button>
                    <button onClick={(e) => {e.stopPropagation(); onDelete()}} className="p-1 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                </div>
            )}
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ sessions, activeSessionId, isExpanded, onNewChat, onSwitchSession, onDeleteSession, onRenameSession, onToggle, user, onLogout, isMobile, onShowAnalytics, onShowHistory }) => {
    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isMobile ? (isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none') : 'hidden'}`}
                onClick={() => { if (isMobile && isExpanded) onToggle(); }}
            ></div>
        
            <div className={`
                relative glass-pane
                bg-black/40 backdrop-blur-2xl border-r border-white/10
                flex flex-col h-screen 
                transition-all duration-300 ease-in-out z-[9999]
                ${isMobile 
                    ? isExpanded 
                        ? 'fixed left-0 top-0 w-80 translate-x-0 transform' // restore original width and remove debug bg
                        : 'fixed left-0 top-0 w-0 -translate-x-full transform'
                    : `${isExpanded ? 'w-64' : 'w-20'} mt-6` // mt-6 for desktop only
                }
                ${!isMobile && 'p-2'}
                ${isMobile && isExpanded && 'p-4'}
            `}>
                {/* Only show New Chat button if sidebar is expanded (open) on mobile, or always on desktop */}
                {(!isMobile || (isMobile && isExpanded)) && (
                    <button
                        onClick={onNewChat}
                        className={`flex items-center w-full p-2.5 my-2 rounded-lg text-sm font-medium text-gray-200 bg-neutral-800 hover:bg-neutral-700/80 transition-all hover:-translate-y-0.5 ${isExpanded ? 'justify-between' : 'justify-center'}`}
                    >
                        <span className={`${!isExpanded && 'md:hidden'}`}>New Chat</span>
                        <PlusIcon className="w-4 h-4" />
                    </button>
                )}
                
                <div className="flex-1 overflow-y-auto h-full pr-1 -mr-2">
                    <p className={`px-2.5 pb-2 text-xs text-gray-500 font-semibold uppercase tracking-wider ${!isExpanded ? 'text-center' : ''}`}>{isExpanded ? 'Chat History' : 'Chats'}</p>
                    <nav className="space-y-1">
                        {sessions.map(session => (
                            <SessionItem 
                                key={session.id}
                                session={session}
                                isActive={activeSessionId === session.id}
                                isExpanded={isExpanded}
                                onSwitch={() => onSwitchSession(session.id)}
                                onDelete={() => onDeleteSession(session.id)}
                                onRename={(newTitle) => onRenameSession(session.id, newTitle)}
                            />
                        ))}
                    </nav>
                </div>

                <footer className="mt-auto pt-2 border-t border-neutral-800">
                    <div className="flex flex-col gap-2 mt-4">
                        <button
                            onClick={onShowAnalytics}
                            className="w-full flex items-center gap-2 px-4 py-2 rounded-full border-2 border-spotify text-spotify font-semibold bg-black hover:bg-spotify hover:text-black transition min-w-0"
                        >
                            <BarChart2 className="w-5 h-5" />
                            {isExpanded && <span className="truncate">Analytics</span>}
                        </button>
                        <button
                            onClick={onShowHistory}
                            className="w-full flex items-center gap-2 px-4 py-2 rounded-full border-2 border-spotify text-spotify font-semibold bg-black hover:bg-spotify hover:text-black transition min-w-0"
                        >
                            <Clock className="w-5 h-5" />
                            {isExpanded && <span className="truncate">History</span>}
                        </button>
                    </div>
                    <UserProfile 
                        user={user}
                        onLogout={onLogout}
                        isSidebarExpanded={isExpanded}
                        onToggleSidebar={onToggle}
                        isMobile={isMobile}
                    />
                </footer>
            </div>
        </>
    );
};

export default Sidebar;
