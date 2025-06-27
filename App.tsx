

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import InitialView from './components/InitialView';
import AnalysisResultsView from './components/AnalysisResultsView';
import AnalysisLoadingView from './components/AnalysisLoadingView';
import AnalysisModal from './components/AnalysisModal';
import LoginPage from './components/LoginPage';
import { Message, MessageRole, ChatSession, User, AnalysisResult } from './types';
import { v4 as uuidv4 } from 'uuid';
import { generateTitleFromMessage, streamChatResponse, generateDocumentAnalysis } from './services/llama-api.services';
import { storageService } from './services/storageService';
import { extractTextFromFile, cleanText, detectDocumentType, getTextStats } from './services/documentParser';
import { CheckIcon } from './constants';

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

const createNewSession = (): ChatSession => ({
    id: uuidv4(),
    title: 'New Chat',
    messages: [
        {
            id: uuidv4(),
            role: MessageRole.ASSISTANT,
            content: "Hello! I'm your Flagr AI Assistant. Upload a document or ask me a question to get started.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ],
    createdAt: new Date().toISOString(),
    analysis: null,
});

const DropzoneOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 animate-fadeIn backdrop-blur-sm">
        <div className="w-4/5 max-w-2xl p-12 border-4 border-dashed border-spotify rounded-2xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Drop File to Start Analysis</h2>
            <p className="text-gray-300">Release the file to upload and begin your session.</p>
        </div>
    </div>
);

const Toast: React.FC<{ message: string; onDismiss: () => void; }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-toast-in">
            <div className="flex items-center gap-3 bg-neutral-800 border border-neutral-700 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-2xl">
                <CheckIcon className="w-5 h-5 text-spotify" />
                <span>{message}</span>
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);
    const isMobile = useMediaQuery('(max-width: 767px)');

    // Auth effect - runs once
    useEffect(() => {
        try {
            const savedUser = storageService.getItem('flagrUser');
            if (savedUser) {
                setCurrentUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error("Failed to load user from storage", error);
            storageService.removeItem('flagrUser'); // Clear corrupted data
        } finally {
            setIsLoadingAuth(false);
        }

        const savedSidebarState = storageService.getItem('flagrSidebarState');
        if (savedSidebarState !== null) {
            try {
                setIsSidebarExpanded(JSON.parse(savedSidebarState));
            } catch (error) {
                console.error("Failed to parse sidebar state from storage", error);
            }
        } else {
            setIsSidebarExpanded(!isMobile);
        }
    }, [isMobile]);
    
    // Session loading effect - depends on user
    useEffect(() => {
        if (!currentUser || isLoadingAuth) {
            setSessions([]);
            setActiveSessionId(null);
            return;
        }

        const sessionKey = `flagrSessions_${currentUser.id}`;
        try {
            const savedSessions = storageService.getItem(sessionKey);
            if (savedSessions) {
                const parsedSessions = JSON.parse(savedSessions);
                if (Array.isArray(parsedSessions) && parsedSessions.length > 0) {
                    setSessions(parsedSessions);
                    setActiveSessionId(parsedSessions[0].id);
                    return; // Exit if sessions loaded
                }
            }
        } catch (error) {
            console.error("Failed to load sessions from storage for user:", currentUser.id, error);
        }
        
        // If no sessions, create a default one
        const newSession = createNewSession();
        setSessions([newSession]);
        setActiveSessionId(newSession.id);

    }, [currentUser, isLoadingAuth]);
    
    // Session saving effect
    useEffect(() => {
        if (!currentUser || isLoadingAuth) return;
        const sessionKey = `flagrSessions_${currentUser.id}`;
        if (sessions.length > 0) {
             storageService.setItem(sessionKey, JSON.stringify(sessions));
        } else {
             storageService.removeItem(sessionKey);
        }
    }, [sessions, currentUser, isLoadingAuth]);

    useEffect(() => {
        storageService.setItem('flagrSidebarState', JSON.stringify(isSidebarExpanded));
    }, [isSidebarExpanded]);
    
    const handleLogin = (user: User) => {
        setCurrentUser(user);
        storageService.setItem('flagrUser', JSON.stringify(user));
    };

    const handleLogout = () => {
        storageService.removeItem('flagrUser');
        setCurrentUser(null);
    };

    const runDocumentAnalysis = useCallback(async (file: File, fileContent: string) => {
        const docType = detectDocumentType(fileContent);
        const stats = getTextStats(fileContent);

        const newSession: ChatSession = {
            id: uuidv4(),
            title: `${docType}: ${file.name}`,
            messages: [],
            createdAt: new Date().toISOString(),
            analysis: null,
        };

        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setIsProcessing(true);
        if (isMobile) {
            setIsSidebarExpanded(false);
        }

        try {
            const analysisData = await generateDocumentAnalysis(fileContent, docType);
            
            const fullAnalysisResult: AnalysisResult = {
                ...analysisData,
                docType,
                stats,
            };

            const initialUserMessage: Message = {
                id: uuidv4(),
                role: MessageRole.USER,
                content: `Analyzed document: "${file.name}"`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            const assistantMessage: Message = {
                 id: uuidv4(),
                 role: MessageRole.ASSISTANT,
                 content: `I've finished analyzing your document, "${file.name}". You can ask me any questions you have about it.`,
                 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setSessions(prev => prev.map(s => 
                s.id === newSession.id 
                ? { ...s, analysis: fullAnalysisResult, messages: [initialUserMessage, assistantMessage] } 
                : s
            ));
        } catch (error) {
            console.error("Document analysis failed:", error);
            const errorMessage: Message = {
                 id: uuidv4(),
                 role: MessageRole.ASSISTANT,
                 content: `Sorry, there was an error analyzing your document. Please try again. Error: ${error instanceof Error ? error.message : String(error)}`,
                 timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
             setSessions(prev => prev.map(s => 
                s.id === newSession.id 
                ? { ...s, messages: [errorMessage] } 
                : s
            ));
        } finally {
            setIsProcessing(false);
        }
    }, [isMobile]);

    const handleFileUpload = useCallback(async (file: File) => {
        if (!file) return;
        try {
            const text = await extractTextFromFile(file);
            const cleanedText = cleanText(text);
            if (cleanedText.trim().length > 0) {
                await runDocumentAnalysis(file, cleanedText);
            } else {
                 alert(`File '${file.name}' is empty or could not be read.`);
            }
        } catch(error) {
            alert(`Error processing file '${file.name}': ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
            console.error(error);
        }
    }, [runDocumentAnalysis]);

    const handleDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(async (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            await handleFileUpload(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [handleFileUpload]);

    useEffect(() => {
        window.addEventListener('dragenter', handleDragEnter);
        window.addEventListener('dragleave', handleDragLeave);
        window.addEventListener('dragover', handleDragOver);
        window.addEventListener('drop', handleDrop);

        return () => {
            window.removeEventListener('dragenter', handleDragEnter);
            window.removeEventListener('dragleave', handleDragLeave);
            window.removeEventListener('dragover', handleDragOver);
            window.removeEventListener('drop', handleDrop);
        };
    }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]);

    const activeSession = sessions.find(s => s.id === activeSessionId);

    const updateActiveSession = (updateFn: (session: ChatSession) => ChatSession) => {
        setSessions(prevSessions =>
            prevSessions.map(session =>
                session.id === activeSessionId ? updateFn(session) : session
            )
        );
    };

    const handleSendMessage = useCallback(async (messageContent: string) => {
        if (!activeSessionId) return;
        
        const newMessage: Message = {
            id: uuidv4(),
            role: MessageRole.USER,
            content: messageContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        updateActiveSession(session => {
            const isFirstUserMessage = !session.messages.some(m => m.role === MessageRole.USER);
            const newTitle = isFirstUserMessage && session.title === "New Chat" ? generateTitleFromMessage(messageContent) : session.title;
            const newMessages = [...session.messages, newMessage];
            
            return { ...session, title: newTitle, messages: newMessages };
        });

        setIsProcessing(true);
    }, [activeSessionId]);
    
    const handleReceiveAiMessageChunk = useCallback((chunk: string, isNewMessage: boolean) => {
        updateActiveSession(session => {
            const newMessages = [...session.messages];
            if (isNewMessage) {
                newMessages.push({ 
                    id: uuidv4(), 
                    role: MessageRole.ASSISTANT, 
                    content: chunk,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
            } else {
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage && lastMessage.role === MessageRole.ASSISTANT) {
                    lastMessage.content += chunk;
                }
            }
            return { ...session, messages: newMessages };
        });
    }, [activeSessionId]);
    
    const handleProcessingDone = useCallback(() => {
        setIsProcessing(false);
    }, []);

    const processStream = useCallback(async (currentHistory: Message[]) => {
        let isFirstChunk = true;
        try {
            const geminiHistory = currentHistory.filter(m => m.id !== 'loading');
            for await (const chunk of streamChatResponse(geminiHistory)) {
                handleReceiveAiMessageChunk(chunk, isFirstChunk);
                if (isFirstChunk) {
                    isFirstChunk = false;
                }
            }
        } catch (error) {
            console.error("Stream processing error:", error);
            const errorMessage = "Sorry, an error occurred while processing your request.";
            handleReceiveAiMessageChunk(errorMessage, isFirstChunk);
        } finally {
            handleProcessingDone();
        }
    }, [handleReceiveAiMessageChunk, handleProcessingDone]);
    
    useEffect(() => {
        const lastMessage = activeSession?.messages[activeSession.messages.length - 1];
        if (isProcessing && activeSession && lastMessage?.role === MessageRole.USER) {
             processStream(activeSession.messages);
        }
    }, [isProcessing, activeSession, processStream]);

    const handleNewChat = () => {
        const newSession = createNewSession();
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        if (isMobile) {
            setIsSidebarExpanded(false);
        }
    }

    const handleSwitchSession = (sessionId: string) => {
        setActiveSessionId(sessionId);
         if (isMobile) {
            setIsSidebarExpanded(false);
        }
    }

    const handleDeleteSession = (sessionIdToDelete: string) => {
        const sessionIndex = sessions.findIndex(s => s.id === sessionIdToDelete);
        if (sessionIndex === -1) return;

        const newSessions = sessions.filter(s => s.id !== sessionIdToDelete);

        if (activeSessionId === sessionIdToDelete) {
            if (newSessions.length > 0) {
                const newActiveIndex = Math.max(0, sessionIndex - 1);
                setActiveSessionId(newSessions[newActiveIndex].id);
            } else {
                const newSession = createNewSession();
                setSessions([newSession]);
                setActiveSessionId(newSession.id);
                return;
            }
        }
        
        setSessions(newSessions);
        setToastMessage("Chat deleted successfully.");
    };

    const handleRenameSession = (sessionIdToRename: string, newTitle: string) => {
        setSessions(prev => prev.map(s => s.id === sessionIdToRename ? { ...s, title: newTitle } : s));
        setToastMessage("Chat renamed.");
    };

    const handleToggleSidebar = () => {
        setIsSidebarExpanded(prev => !prev);
    };
    
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            await handleFileUpload(file);
            event.target.value = '';
        }
    };
    
    const renderMainPanelContent = () => {
        if (isProcessing && !activeSession?.analysis) {
            return <AnalysisLoadingView />;
        }
        if (activeSession?.analysis) {
            return <AnalysisResultsView results={activeSession.analysis} />;
        }
        return <InitialView onUploadClick={triggerFileUpload} />;
    };

    if (isLoadingAuth) {
        return <div className="fixed top-0 left-0 w-full h-full bg-transparent"></div>;
    }

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="flex h-screen w-screen text-gray-300 bg-transparent font-sans">
            {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
            {isDragging && <DropzoneOverlay />}
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.rtf,.html,.xml,.pdf,.docx"
            />
            <Sidebar 
                user={currentUser}
                onLogout={handleLogout}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onNewChat={handleNewChat}
                onSwitchSession={handleSwitchSession}
                onDeleteSession={handleDeleteSession}
                onRenameSession={handleRenameSession}
                isExpanded={isSidebarExpanded}
                onToggle={handleToggleSidebar}
            />
            <main className="flex-1 flex flex-col overflow-hidden bg-neutral-900 transition-all duration-300">
                 {isMobile ? (
                    <>
                        {activeSession && (
                            <ChatPanel
                                session={activeSession}
                                isProcessing={isProcessing}
                                onSendMessage={handleSendMessage}
                                onUploadClick={triggerFileUpload}
                                onToggleSidebar={handleToggleSidebar}
                                isMobile={true}
                                onViewAnalysis={() => setAnalysisModalOpen(true)}
                            />
                        )}
                    </>
                ) : (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-px md:bg-neutral-800/50 overflow-hidden">
                        {/* Left Panel: Main Content */}
                        <div className="flex flex-col overflow-y-auto bg-neutral-900">
                            <div className="flex-1 p-4 md:p-8 animate-fadeIn">
                                {renderMainPanelContent()}
                            </div>
                        </div>
                        
                        {/* Right Panel: Chat */}
                        <div className="flex flex-col bg-neutral-900">
                           {activeSession && (
                                <ChatPanel 
                                    session={activeSession}
                                    isProcessing={isProcessing}
                                    onSendMessage={handleSendMessage}
                                    onUploadClick={triggerFileUpload}
                                    onToggleSidebar={handleToggleSidebar}
                                    isMobile={false}
                                />
                           )}
                        </div>
                    </div>
                )}
            </main>
            {isAnalysisModalOpen && (
                <AnalysisModal onClose={() => setAnalysisModalOpen(false)}>
                    {activeSession?.analysis && <AnalysisResultsView results={activeSession.analysis} />}
                </AnalysisModal>
            )}
        </div>
    );
};

export default App;