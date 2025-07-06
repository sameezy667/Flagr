import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { LogOutIcon, UserIcon as DefaultUserIcon, ChevronsLeftIcon } from '../constants';

interface UserProfileProps {
    user: User;
    onLogout: () => void;
    isSidebarExpanded: boolean;
    onToggleSidebar: () => void;
    isMobile?: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, isSidebarExpanded, onToggleSidebar, isMobile }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <div className={`flex items-center justify-between w-full h-12 sm:h-14 ${isSidebarExpanded ? '' : 'px-0'}`}>
                <button
                    onClick={() => setIsMenuOpen(prev => !prev)}
                    className={`flex items-center gap-2 sm:gap-3 text-left w-full p-2 rounded-lg hover:bg-neutral-800/50 transition-colors ${isSidebarExpanded ? '' : 'justify-center'}`}
                >
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 object-cover bg-neutral-700" />
                    ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-neutral-700 flex-shrink-0 flex items-center justify-center">
                            <DefaultUserIcon />
                        </div>
                    )}
                    {isSidebarExpanded && (
                        <div className="flex-1 truncate">
                            <span className="font-semibold text-white text-sm">{user.username}</span>
                        </div>
                    )}
                </button>
                {!isMobile && (
                    <>
                        <button onClick={onToggleSidebar} className={`p-2 sm:p-2.5 rounded-lg text-gray-400 hover:bg-neutral-800 hover:text-white transition-colors ${!isSidebarExpanded && 'hidden'}`}>
                            <ChevronsLeftIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${!isSidebarExpanded && 'rotate-180'}`} />
                        </button>
                        <button onClick={onToggleSidebar} className={`p-2 sm:p-2.5 rounded-lg text-gray-400 hover:bg-neutral-800 hover:text-white transition-colors ${isSidebarExpanded && 'hidden'}`}>
                            <ChevronsLeftIcon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${!isSidebarExpanded && 'rotate-180'}`} />
                        </button>
                    </>
                )}
            </div>

            {isMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-48 sm:w-56 bg-neutral-800 border border-neutral-700 rounded-lg shadow-2xl z-10 animate-fadeInSlideUp">
                    <div className="p-3 border-b border-neutral-700">
                        <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 sm:gap-3 px-3 py-2.5 text-left text-sm text-gray-300 hover:bg-neutral-700 hover:text-white transition-colors rounded-b-lg"
                    >
                        <LogOutIcon className="w-4 h-4" />
                        <span>Log Out</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
