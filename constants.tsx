import React from 'react';

export const FlagrLogo: React.FC<{showText?: boolean}> = ({ showText = true }) => (
    <div className="flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <path d="M6 28V4H18.5C21.2614 4 23.5 6.23858 23.5 9C23.5 11.7614 21.2614 14 18.5 14H13V21H26V28H6Z" fill="#1DB954">
                 <animate attributeName="fill" values="#1DB954;hsl(141, 76%, 45%);#1DB954" dur="4s" repeatCount="indefinite" />
            </path>
        </svg>
        {showText && <span className="text-xl font-bold text-white truncate">Flagr</span>}
    </div>
);

export const FlagrIcon = () => (
    <div className="w-8 h-8 flex-shrink-0 bg-black rounded-full flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 28V4H18.5C21.2614 4 23.5 6.23858 23.5 9C23.5 11.7614 21.2614 14 18.5 14H13V21H26V28H6Z" fill="#1DB954"/>
        </svg>
    </div>
);

export const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
    </svg>
);

interface IconWrapperProps {
    children: React.ReactNode;
    className?: string;
}

const IconWrapper: React.FC<IconWrapperProps> = ({children, className}) => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>{children}</svg>

export const DocumentChatIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></IconWrapper>
export const UploadIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></IconWrapper>
export const LegalFindingsIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M21.21 15.89A10 10 0 1 1 8.11 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path><line x1="12" y1="18" x2="12" y2="22"></line><line x1="15" y1="20" x2="9" y2="20"></line></IconWrapper>
export const RiskAssessmentIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></IconWrapper>
export const PatternSearchIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></IconWrapper>
export const AiInsightsIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M12 20h.01"></path><path d="M12 6h.01"></path><path d="M17.5 7.5h.01"></path><path d="M6.5 7.5h.01"></path><path d="M17.5 15.5h.01"></path><path d="M6.5 15.5h.01"></path><path d="M2 12h.01"></path><path d="M22 12h.01"></path><path d="m15.5 17.5.01.01"></path><path d="m8.5 17.5.01.01"></path><path d="m15.5 6.5.01.01"></path><path d="m8.5 6.5.01.01"></path></IconWrapper>
export const ArchiveIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></IconWrapper>
export const SettingsIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></IconWrapper>
export const HelpIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></IconWrapper>
export const PlainLanguageIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M13 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10l-6-6z" /><path d="M13 4v6h6" /><path d="M10 14H8" /><path d="M16 14H12" /><path d="M16 18H8" /></IconWrapper>
export const StatsIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="2" y="12" width="4" height="8" rx="1"/><rect x="2" y="4" width="4" height="4" rx="1"/><rect x="18" y="8" width="4" height="12" rx="1"/></IconWrapper>
export const SunIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></IconWrapper>
export const MoonIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></IconWrapper>
export const PlusIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></IconWrapper>
export const PaperclipIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></IconWrapper>
export const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" /></svg>
export const CopyIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></IconWrapper>
export const CheckIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><polyline points="20 6 9 17 4 12"></polyline></IconWrapper>
export const TrashIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></IconWrapper>
export const PencilIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></IconWrapper>
export const ChevronsLeftIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></IconWrapper>
export const MenuIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></IconWrapper>
export const XIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></IconWrapper>
export const LogOutIcon: React.FC<{className?: string}> = ({className}) => <IconWrapper className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></IconWrapper>