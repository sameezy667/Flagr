import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import InitialView from './components/InitialView';
import AnalysisResultsView from './components/AnalysisResultsView';
import AnalysisLoadingView from './components/AnalysisLoadingView';
import AnalysisModal from './components/AnalysisModal';
import LoginPage from './components/LoginPage';
import RiskQuiz from './components/RiskQuiz';
import { Message, MessageRole, ChatSession, User, AnalysisResult } from './types';
import { v4 as uuidv4 } from 'uuid';
import { generateTitleFromMessage, streamChatResponse, generateDocumentAnalysis, generateContractTemplate } from './services/llama-api.services';
import { storageService } from './services/storageService';
import { firebaseService } from './services/firebaseService';
import { extractTextFromFile, cleanText, detectDocumentType, getTextStats } from './services/documentParser';
import { CheckIcon, FlagrLogo } from './constants';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import SignaturePad from './components/SignaturePad';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        setMatches(media.matches);
        
        const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);
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
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [showRiskQuiz, setShowRiskQuiz] = useState(false);
    const [fullText, setFullText] = useState<string>('');
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateType, setTemplateType] = useState('Freelance Contract');
    const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
    const [generatedTemplate, setGeneratedTemplate] = useState<string | null>(null);
    const [templateFlags, setTemplateFlags] = useState<any[] | null>(null);
    const [templateError, setTemplateError] = useState<string | null>(null);
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
    const [analyticsOpen, setAnalyticsOpen] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);

    const contractTypes = [
        'Freelance Contract',
        'Non-Disclosure Agreement (NDA)',
        'Employment Agreement',
        'Consulting Agreement',
        'Lease Agreement',
        'Service Agreement',
        'Partnership Agreement',
        'Sales Agreement',
    ];

    const handleGenerateTemplate = async () => {
        setIsGeneratingTemplate(true);
        setGeneratedTemplate(null);
        setTemplateFlags(null);
        setTemplateError(null);
        try {
            const result = await generateContractTemplate(templateType);
            console.log('Raw AI template result:', result); // Debug log
            // Strict validation: template must be a string, not repeated, not empty
            if (typeof result.template !== 'string' || !result.template.trim() || /\b(\w+) \1\b/.test(result.template)) {
                throw new Error('AI did not return a valid template. Please try again.');
            }
            setGeneratedTemplate(result.template.trim());
            setTemplateFlags(result.flags);
        } catch (err: any) {
            setTemplateError(err.message || 'Failed to generate template.');
            setGeneratedTemplate(null);
            setTemplateFlags(null);
        } finally {
            setIsGeneratingTemplate(false);
        }
    };

    const handleDownloadTemplate = () => {
        if (!generatedTemplate) return;
        const blob = new Blob([generatedTemplate], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${templateType.replace(/\s+/g, '_')}_template.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSaveSignature = (dataUrl: string) => {
        setSignatureDataUrl(dataUrl);
        setShowSignaturePad(false);
    };
    const handleDownloadSignature = () => {
        if (!signatureDataUrl) return;
        const a = document.createElement('a');
        a.href = signatureDataUrl;
        a.download = 'signature.png';
        a.click();
    };

    const handleDownloadSignedDocument = async () => {
        if (!generatedTemplate || !signatureDataUrl) return;
        // Create an off-screen canvas
        const canvas = document.createElement('canvas');
        const width = 800;
        const lineHeight = 28;
        const padding = 32;
        // Word wrap logic
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.font = '18px monospace';
        const maxTextWidth = width - 2 * padding;
        const templateLines = generatedTemplate.split('\n');
        // Word wrap each line
        const wrappedLines: string[] = [];
        templateLines.forEach(line => {
            if (ctx.measureText(line).width <= maxTextWidth) {
                wrappedLines.push(line);
            } else {
                let words = line.split(' ');
                let current = '';
                for (let word of words) {
                    const test = current ? current + ' ' + word : word;
                    if (ctx.measureText(test).width > maxTextWidth) {
                        if (current) wrappedLines.push(current);
                        current = word;
                    } else {
                        current = test;
                    }
                }
                if (current) wrappedLines.push(current);
            }
        });
        // Estimate height: lines of template + signature
        const height = padding * 2 + wrappedLines.length * lineHeight + 200;
        canvas.width = width;
        canvas.height = height;
        // Background
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, width, height);
        // Draw wrapped template text centered
        ctx.font = '18px monospace';
        ctx.fillStyle = '#fff';
        wrappedLines.forEach((line, i) => {
            const textWidth = ctx.measureText(line).width;
            const x = (width - textWidth) / 2;
            ctx.fillText(line, x, padding + (i + 1) * lineHeight);
        });
        // Draw signature image
        const img = new window.Image();
        img.onload = () => {
            // Place signature at bottom right
            const sigWidth = 240;
            const sigHeight = 90;
            ctx.drawImage(img, width - sigWidth - padding, height - sigHeight - padding, sigWidth, sigHeight);
            // Download
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = `${templateType.replace(/\s+/g, '_')}_signed.png`;
            a.click();
        };
        img.src = signatureDataUrl;
    };

    // Debug logging
    useEffect(() => {
        console.log('Mobile detection:', isMobile, 'Sidebar expanded:', isSidebarExpanded);
    }, [isMobile, isSidebarExpanded]);

    // Immediate mobile detection on mount
    useEffect(() => {
        const checkMobile = () => {
            const isMobileView = window.innerWidth <= 768;
            if (isMobileView && isSidebarExpanded) {
                setIsSidebarExpanded(false);
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auth effect - runs once
    useEffect(() => {
        const unsubscribe = firebaseService.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setIsLoadingAuth(false);
        });

        const savedSidebarState = storageService.getItem('flagrSidebarState');
        if (savedSidebarState !== null) {
            try {
                const savedState = JSON.parse(savedSidebarState);
                // Only restore saved state if not on mobile
                if (!isMobile) {
                    setIsSidebarExpanded(savedState);
                } else {
                    setIsSidebarExpanded(false);
                }
            } catch (error) {
                console.error("Failed to parse sidebar state from storage", error);
                setIsSidebarExpanded(!isMobile);
            }
        } else {
            setIsSidebarExpanded(!isMobile);
        }
        
        return () => unsubscribe();
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
    };

    const handleLogout = async () => {
        try {
            await firebaseService.signOut();
            setToastMessage("Successfully signed out.");
        } catch (error) {
            console.error("Logout error:", error);
            setToastMessage("Error signing out. Please try again.");
        }
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
            let text = '';
            if (file.type.startsWith('image/')) {
                setToastMessage('Extracting text from image...');
                // Convert image to grayscale using a canvas
                const img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                await new Promise(resolve => { img.onload = resolve; });
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Could not get canvas context');
                ctx.drawImage(img, 0, 0);
                // Convert to grayscale
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const avg = (imageData.data[i] + imageData.data[i+1] + imageData.data[i+2]) / 3;
                    imageData.data[i] = avg;
                    imageData.data[i+1] = avg;
                    imageData.data[i+2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);
                const grayscaleBlob = await new Promise<Blob>((resolve, reject) => {
                    canvas.toBlob(blob => {
                        if (blob) resolve(blob);
                        else reject(new Error('Failed to create grayscale blob'));
                    }, file.type);
                });
                // Run Tesseract with logger and better config
                const { data: { text: ocrText } } = await Tesseract.recognize(grayscaleBlob, 'eng', {
                    logger: (m: any) => {
                        if (m.status === 'recognizing text') {
                            setToastMessage(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                        }
                    },
                    config: { tessedit_pageseg_mode: 6 }
                } as any);
                text = ocrText;
                setToastMessage(null);
            } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                setToastMessage('Extracting text from PDF...');
                const reader = new FileReader();
                const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as ArrayBuffer);
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(file);
                });
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                let pdfText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items.map(item => ('str' in item ? item.str : '')).join(' ');
                    pdfText += pageText + '\n';
                }
                text = pdfText;
                setToastMessage(null);
            } else {
                text = await extractTextFromFile(file);
            }
            setFullText(text); // Store the original text for highlighting
            const cleanedText = cleanText(text);
            if (cleanedText.trim().length > 0) {
                await runDocumentAnalysis(file, cleanedText);
            } else {
                 alert(`File '${file.name}' is empty or could not be read.`);
            }
        } catch(error) {
            setToastMessage(null);
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
            for (const file of Array.from(e.dataTransfer.files)) {
                await handleFileUpload(file);
            }
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
        console.log('Toggle sidebar clicked. Current state:', isSidebarExpanded, 'Mobile:', isMobile);
        setIsSidebarExpanded(prev => {
            const newState = !prev;
            console.log('Setting sidebar to:', newState);
            return newState;
        });
    };
    
    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            for (const file of Array.from(files)) {
                await handleFileUpload(file);
            }
            event.target.value = '';
        }
    };
    
    const renderMainPanelContent = () => {
        if (isProcessing && !activeSession?.analysis) {
            return <AnalysisLoadingView />;
        }
        if (activeSession?.analysis) {
            return (
                <AnalysisResultsView
                    results={activeSession.analysis}
                    fullText={fullText}
                    analyticsOpen={analyticsOpen}
                    onCloseAnalytics={() => setAnalyticsOpen(false)}
                    historyOpen={historyOpen}
                    onCloseHistory={() => setHistoryOpen(false)}
                />
            );
        }
        // Always pass onGenerateTemplate to InitialView
        return (
            <InitialView
                onUploadClick={triggerFileUpload}
                onRiskQuizClick={() => setShowRiskQuiz(true)}
                onGenerateTemplate={() => setShowTemplateModal(true)}
            />
        );
    };

    // Helper: always provide a valid ChatSession to ChatPanel
    const getActiveOrDefaultSession = () => {
        if (activeSession) return activeSession;
        return {
            id: 'default',
            title: 'New Chat',
            messages: [
                {
                    id: 'default-msg',
                    role: MessageRole.ASSISTANT,
                    content: "Hello! I'm your Flagr AI Assistant. Upload a document or ask me a question to get started.",
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ],
            createdAt: new Date().toISOString(),
            analysis: null,
        };
    };

    if (isLoadingAuth) {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-transparent flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block mb-6">
                        <FlagrLogo showText={true} />
                    </div>
                    <div className="mt-4">
                        <svg className="animate-spin h-8 w-8 text-spotify mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div
            className={`flex h-screen w-screen text-gray-300 bg-transparent font-sans ${!isMobile ? 'overflow-hidden' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={e => { e.preventDefault(); setIsDragging(false); }}
            onDrop={async e => {
                e.preventDefault(); setIsDragging(false);
                if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                    for (const file of Array.from(e.dataTransfer.files)) {
                        await handleFileUpload(file);
                    }
                }
            }}
        >
            {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
            {isDragging && <DropzoneOverlay />}
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt,.md,.rtf,.html,.xml,.pdf,.docx,.jpeg,.jpg,.png,.pdf"
                multiple
            />
            {showRiskQuiz && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur animate-fadeIn">
                    <RiskQuiz onClose={() => setShowRiskQuiz(false)} />
                </div>
            )}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur animate-fadeIn">
                    <div className="bg-neutral-900 p-8 rounded-xl shadow-2xl max-w-lg w-full overflow-y-auto" style={{ maxHeight: '90vh' }}>
                        <h2 className="text-2xl font-bold mb-4 text-white">Generate Contract Template</h2>
                        <p className="text-gray-300 mb-6">Select a contract type to generate a safe, compliant template with AI.</p>
                        <select
                            className="w-full mb-4 p-2 rounded bg-neutral-800 text-white border border-neutral-700 focus:outline-none"
                            value={templateType}
                            onChange={e => setTemplateType(e.target.value)}
                        >
                            {contractTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        <button
                            className="w-full px-5 py-2 bg-spotify text-white rounded-lg font-semibold shadow hover:bg-spotify/80 transition mb-4"
                            onClick={handleGenerateTemplate}
                            disabled={false}
                        >
                            {isGeneratingTemplate ? 'Generating...' : 'Generate Template'}
                        </button>
                        {templateError && (
                            <div className="text-red-400 mb-2 font-bold">{templateError}</div>
                        )}
                        {generatedTemplate && (
                            <div className="mt-4">
                                <pre className="bg-neutral-800 text-white p-4 rounded mb-2 whitespace-pre-wrap max-h-60 overflow-y-auto">{generatedTemplate}</pre>
                                <button
                                    className="px-4 py-2 bg-spotify text-white rounded font-semibold hover:bg-spotify/80 transition mb-2"
                                    onClick={handleDownloadTemplate}
                                >
                                    Download as .txt
                                </button>
                                <button
                                    className="px-4 py-2 bg-neutral-700 text-white rounded font-semibold hover:bg-neutral-600 transition mb-2 ml-2"
                                    onClick={() => setShowSignaturePad(true)}
                                >
                                    Sign Document
                                </button>
                                {signatureDataUrl && (
                                    <div className="mt-2 flex flex-col items-center">
                                        <img src={signatureDataUrl} alt="Signature" className="border border-spotify rounded bg-white mb-2 max-w-xs" />
                                        <button
                                            className="px-3 py-1 bg-spotify text-white rounded font-semibold hover:bg-spotify/80 transition mb-2"
                                            onClick={handleDownloadSignature}
                                        >
                                            Download Signature
                                        </button>
                                        <button
                                            className="px-3 py-1 bg-spotify text-white rounded font-semibold hover:bg-spotify/80 transition"
                                            onClick={handleDownloadSignedDocument}
                                        >
                                            Download Signed Document
                                        </button>
                                    </div>
                                )}
                                {templateFlags && templateFlags.length > 0 && (
                                    <div className="mt-4">
                                        <h3 className="text-lg font-bold text-white mb-2">Risk Flags</h3>
                                        <ul className="space-y-2">
                                            {templateFlags.map(flag => (
                                                <li key={flag.id} className="bg-neutral-800 p-3 rounded text-white border-l-4 border-spotify">
                                                    <div className="font-semibold">{flag.title} <span className="text-xs text-spotify ml-2">{flag.severity}</span></div>
                                                    <div className="text-sm text-neutral-300 mt-1"><strong>Clause:</strong> {flag.clause}</div>
                                                    <div className="text-sm text-neutral-400 mt-1"><strong>Explanation:</strong> {flag.explanation}</div>
                                                    {flag.suggestedRewrite && (
                                                        <div className="text-sm text-green-400 mt-1"><strong>Suggested Rewrite:</strong> {flag.suggestedRewrite}</div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                        {showSignaturePad && (
                            <SignaturePad onSave={handleSaveSignature} onClose={() => setShowSignaturePad(false)} />
                        )}
                        <button className="mt-6 px-5 py-2 bg-neutral-700 text-white rounded-lg font-semibold shadow hover:bg-neutral-600 transition w-full" onClick={() => setShowTemplateModal(false)}>Close</button>
                    </div>
                </div>
            )}
            {/* Hamburger menu always visible on mobile */}
            {isMobile && !isSidebarExpanded && (
                <button
                    onClick={handleToggleSidebar}
                    className="fixed top-4 left-4 z-50 p-2 bg-black/60 rounded-md text-gray-200 hover:bg-black/80 md:hidden"
                    aria-label="Toggle sidebar"
                >
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}
            {/* On mobile, only show sidebar or chat, not both */}
            {isMobile ? (
                isSidebarExpanded ? (
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
                        isMobile={isMobile}
                        onShowAnalytics={() => setAnalyticsOpen(true)}
                        onShowHistory={() => setHistoryOpen(true)}
                    />
                ) : (
                    activeSession && (
                        <ChatPanel
                            session={activeSession}
                            isProcessing={isProcessing}
                            onSendMessage={handleSendMessage}
                            onUploadClick={triggerFileUpload}
                            onToggleSidebar={handleToggleSidebar}
                            isMobile={true}
                            onViewAnalysis={() => setAnalysisModalOpen(true)}
                        />
                    )
                )
            ) : (
                // Desktop/tablet layout
                <>
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
                        isMobile={isMobile}
                        onShowAnalytics={() => setAnalyticsOpen(true)}
                        onShowHistory={() => setHistoryOpen(true)}
                    />
                    <main className="flex-1 flex flex-col overflow-hidden bg-neutral-900 transition-all duration-300">
                        <div className="flex-1 flex flex-col items-start overflow-y-auto bg-neutral-900">
                            <div className="w-full p-4 sm:p-6 lg:p-8 animate-fadeIn">
                                {renderMainPanelContent()}
                            </div>
                            <div className="w-full">
                                <ChatPanel 
                                    session={getActiveOrDefaultSession()}
                                    isProcessing={isProcessing}
                                    onSendMessage={handleSendMessage}
                                    onUploadClick={triggerFileUpload}
                                    onToggleSidebar={handleToggleSidebar}
                                    isMobile={false}
                                />
                            </div>
                        </div>
                    </main>
                </>
            )}
            {isAnalysisModalOpen && (
                <AnalysisModal onClose={() => setAnalysisModalOpen(false)}>
                    {activeSession?.analysis && <AnalysisResultsView results={activeSession.analysis} fullText={fullText} />}
                </AnalysisModal>
            )}
        </div>
    );
};

export default App;