import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { AnalysisResult, Flag, Risk, Insight } from '../types';
import {
    PlainLanguageIcon, LegalFindingsIcon, RiskAssessmentIcon, AiInsightsIcon, SpeakerIcon
} from '../constants';
import { speakText, stopSpeaking } from '../services/speechService';
import jsPDF from 'jspdf';
import { v4 as uuidv4 } from 'uuid';
import { Document, Packer, Paragraph, HeadingLevel } from 'docx';

const getSeverityClass = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
        case 'High': return 'bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.35)]';
        case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.35)]';
        case 'Low': return 'bg-sky-500/20 text-sky-400 border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.35)]';
        default: return 'bg-neutral-700 text-neutral-400';
    }
};

const AnalysisCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties
}> = ({ icon, title, children, className = '', style }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--mouse-x', `${x}px`);
        cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    };

    return (
    <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className={`spotlight-card relative bg-black/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-lg transition-all duration-300 hover:border-spotify/50 glass-pane hover:-translate-y-1 ${className}`}
        style={style}
    >
        <div className="relative p-4 border-b border-white/5 flex items-center gap-3">
            <span className="text-spotify">{icon}</span>
            <h3 className="font-semibold text-white">{title}</h3>
        </div>
        <div className="relative p-4">
            {children}
        </div>
    </div>
    );
};

const FlagCard: React.FC<{ flag: Flag }> = ({ flag }) => {
    const [isSpeakingClause, setIsSpeakingClause] = useState(false);
    const [isSpeakingExplanation, setIsSpeakingExplanation] = useState(false);

    const handleListenClause = () => {
        if (isSpeakingClause) {
            stopSpeaking();
            setIsSpeakingClause(false);
        } else {
            speakText(flag.clause, () => setIsSpeakingClause(false));
            setIsSpeakingClause(true);
        }
    };
    const handleListenExplanation = () => {
        if (isSpeakingExplanation) {
            stopSpeaking();
            setIsSpeakingExplanation(false);
        } else {
            speakText(flag.explanation, () => setIsSpeakingExplanation(false));
            setIsSpeakingExplanation(true);
        }
    };
    return (
    <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700/80">
        <div className="flex justify-between items-start mb-2 gap-4">
            <h4 className="font-semibold text-white">{flag.title}</h4>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getSeverityClass(flag.severity)}`}>{flag.severity}</span>
        </div>
            <blockquote className="text-sm text-neutral-400 border-l-2 border-spotify/50 pl-3 my-2 italic flex items-center gap-2">
                <span id={flag.id}>"{flag.clause}"</span>
                <button
                    onClick={handleListenClause}
                    className={`ml-1 p-1 rounded-full border border-spotify text-spotify hover:bg-spotify/10 transition ${isSpeakingClause ? 'bg-spotify/20' : ''}`}
                    aria-label={isSpeakingClause ? 'Stop listening' : 'Listen to clause'}
                >
                    <SpeakerIcon className="w-4 h-4" />
                </button>
        </blockquote>
            <div className="flex items-center gap-2 mt-2">
                <p className="text-sm text-neutral-300 flex-1">{flag.explanation}</p>
                <button
                    onClick={handleListenExplanation}
                    className={`ml-1 p-1 rounded-full border border-spotify text-spotify hover:bg-spotify/10 transition ${isSpeakingExplanation ? 'bg-spotify/20' : ''}`}
                    aria-label={isSpeakingExplanation ? 'Stop listening' : 'Listen to explanation'}
                >
                    <SpeakerIcon className="w-4 h-4" />
                </button>
            </div>
            {flag.suggestedRewrite && (
                <div className="mt-4 p-3 bg-spotify/10 border-l-4 border-spotify rounded">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-spotify text-lg">💡</span>
                        <span className="font-semibold text-spotify">Suggestion:</span>
                    </div>
                    <p className="text-sm text-spotify font-medium">{flag.suggestedRewrite}</p>
                </div>
            )}
    </div>
);
};

const RiskBar: React.FC<{ risk: Risk }> = ({ risk }) => {
    let barColor = 'bg-spotify';
    if (risk.score > 7) barColor = 'bg-red-500';
    else if (risk.score > 4) barColor = 'bg-yellow-400';

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-neutral-200">{risk.area}</p>
                <p className={`text-sm font-bold ${risk.score > 7 ? 'text-red-400' : risk.score > 4 ? 'text-yellow-400' : 'text-spotify'}`}>{risk.score} / 10</p>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full ${barColor}`} style={{ width: `${risk.score * 10}%` }}></div>
            </div>
             <p className="text-xs text-neutral-400 mt-1.5">{risk.assessment}</p>
        </div>
    );
};

const InsightCard: React.FC<{ insight: Insight }> = ({ insight }) => (
     <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/80">
        <h4 className="font-semibold text-white mb-1.5">{insight.recommendation}</h4>
        <p className="text-sm text-neutral-300">{insight.justification}</p>
    </div>
);

const ChevronDownIcon = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface AnalysisResultsViewProps {
    results: AnalysisResult;
    fullText: string;
    analyticsOpen?: boolean;
    onCloseAnalytics?: () => void;
    historyOpen?: boolean;
    onCloseHistory?: () => void;
}

const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({ results, fullText, analyticsOpen, onCloseAnalytics, historyOpen, onCloseHistory }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | undefined>(undefined);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const [historyList, setHistoryList] = useState<any[]>([]);
    const detectedType = results.detectedDocType || results.docType || 'Uploaded Document';
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
    const [showShareDropdown, setShowShareDropdown] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number, width: number} | null>(null);
    const [shareDropdownPosition, setShareDropdownPosition] = useState<{top: number, left: number, width: number} | null>(null);
    const shareButtonRef = useRef<HTMLButtonElement>(null);
    const downloadButtonRef = useRef<HTMLButtonElement>(null);
    const [downloadDropdownPosition, setDownloadDropdownPosition] = useState<{top: number, left: number, width: number} | null>(null);

    // Load voices on mount and when voices change
    useEffect(() => {
        const loadVoices = () => {
            const voicesList = window.speechSynthesis.getVoices();
            setVoices(voicesList);
            // Load default from localStorage
            const storedDefault = localStorage.getItem('flagr_default_voice');
            if (storedDefault && voicesList.some(v => v.voiceURI === storedDefault)) {
                setSelectedVoiceURI(storedDefault);
            } else if (!selectedVoiceURI && voicesList.length > 0) {
                setSelectedVoiceURI(voicesList[0].voiceURI);
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []); // Only run once on mount

    // Close dropdown on outside click
    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [dropdownOpen]);

    // Save analysis to history on mount
    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('flagr_analysis_history') || '[]');
        const id = uuidv4();
        const newEntry = {
            id,
            date: new Date().toISOString(),
            title: detectedType,
            results,
            fullText,
        };
        // Only add if not already present (by content hash or similar)
        const exists = history.some((h: any) => JSON.stringify(h.results) === JSON.stringify(results));
        if (!exists) {
            const updated = [newEntry, ...history].slice(0, 20); // Keep last 20
            localStorage.setItem('flagr_analysis_history', JSON.stringify(updated));
            setHistoryList(updated);
        } else {
            setHistoryList(history);
        }
    }, [results, fullText, detectedType]);

    const handleLoadHistory = () => {
        window.location.reload(); // For now, reload to trigger analysis view (can be improved to set state)
        // In a more advanced app, you would set the analysis state directly
    };

    const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);

    const setDefaultVoice = (voiceURI: string) => {
        localStorage.setItem('flagr_default_voice', voiceURI);
        setSelectedVoiceURI(voiceURI);
    };

    // Concatenate all analysis text for TTS
    const getFullAnalysisText = () => {
        let text = '';
        text += `Analysis for: ${detectedType}.\n`;
        text += `Plain Language Summary: ${results.plainLanguageSummary}\n`;
        text += `Risk Assessment: ${results.riskAssessment.overallSummary}\n`;
        results.riskAssessment.risks.forEach(risk => {
            text += `${risk.area}: ${risk.assessment} (Score: ${risk.score}/10)\n`;
        });
        text += `AI Insights: ${results.aiInsights.overallSummary}\n`;
        results.aiInsights.recommendations.forEach(insight => {
            text += `${insight.recommendation}: ${insight.justification}\n`;
        });
        if (results.flags.length > 0) {
            text += 'Flags Found: ';
            results.flags.forEach(flag => {
                text += `${flag.title}: ${flag.clause}. Explanation: ${flag.explanation}.`;
                if (flag.suggestedRewrite) text += ` Suggested Rewrite: ${flag.suggestedRewrite}.`;
                text += '\n';
            });
        }
        return text;
    };

    const handleListen = () => {
        if (isSpeaking) {
            stopSpeaking();
            setIsSpeaking(false);
        } else {
            speakText(getFullAnalysisText(), () => setIsSpeaking(false), selectedVoice);
            setIsSpeaking(true);
        }
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 12;
        const lineHeight = 8;
        let y = margin + 4;
        const maxLineWidth = pageWidth - margin * 2;
        function addTextBlock(text: string, fontSize = 12, indent = 0) {
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(text, maxLineWidth - indent);
            for (let line of lines) {
                if (y + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                }
                doc.text(line, margin + indent, y);
                y += lineHeight;
            }
        }
        doc.setFontSize(16);
        addTextBlock(`Analysis for: ${detectedType}`, 16);
        y += 2;
        addTextBlock('Plain Language Summary:', 13);
        addTextBlock(results.plainLanguageSummary, 12, 6);
        y += 2;
        addTextBlock('Risk Assessment:', 13);
        addTextBlock(results.riskAssessment.overallSummary, 12, 6);
        for (const risk of results.riskAssessment.risks) {
            addTextBlock(`${risk.area}: ${risk.assessment} (Score: ${risk.score}/10)`, 12, 12);
        }
        y += 2;
        addTextBlock('AI Insights:', 13);
        addTextBlock(results.aiInsights.overallSummary, 12, 6);
        for (const insight of results.aiInsights.recommendations) {
            addTextBlock(`${insight.recommendation}: ${insight.justification}`, 12, 12);
        }
        if (results.flags.length > 0) {
            y += 2;
            addTextBlock('Flags Found:', 13);
            for (const flag of results.flags) {
                addTextBlock(`${flag.title}: ${flag.clause}`, 12, 6);
                addTextBlock(`Explanation: ${flag.explanation}`, 12, 12);
                if (flag.suggestedRewrite) {
                    addTextBlock(`Suggested Rewrite: ${flag.suggestedRewrite}`, 12, 12);
                }
            }
        }
        doc.save(`analysis-${detectedType.replace(/\s+/g, '_')}.pdf`);
    };

    const handleDownloadDOCX = async () => {
        // Build children array with no nulls and fully flattened
        const children: Paragraph[] = [
            new Paragraph({
                text: `Analysis for: ${detectedType}`,
                heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
                text: 'Plain Language Summary:',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
                text: results.plainLanguageSummary,
            }),
            new Paragraph({ text: '' }),
            new Paragraph({
                text: 'Risk Assessment:',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
                text: results.riskAssessment.overallSummary,
            }),
            ...results.riskAssessment.risks.map(risk =>
                new Paragraph({
                    text: `${risk.area}: ${risk.assessment} (Score: ${risk.score}/10)`,
                    bullet: { level: 0 },
                })
            ),
            new Paragraph({ text: '' }),
            new Paragraph({
                text: 'AI Insights:',
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
                text: results.aiInsights.overallSummary,
            }),
            ...results.aiInsights.recommendations.map(insight =>
                new Paragraph({
                    text: `${insight.recommendation}: ${insight.justification}`,
                    bullet: { level: 0 },
                })
            ),
        ];
        if (results.flags.length > 0) {
            children.push(new Paragraph({ text: '' }));
            children.push(new Paragraph({
                text: 'Flags Found:',
                heading: HeadingLevel.HEADING_2,
            }));
            results.flags.forEach(flag => {
                children.push(new Paragraph({
                    text: `${flag.title}: ${flag.clause}`,
                    bullet: { level: 0 },
                }));
                children.push(new Paragraph({
                    text: `Explanation: ${flag.explanation}`,
                    bullet: { level: 1 },
                }));
                if (flag.suggestedRewrite) {
                    children.push(new Paragraph({
                        text: `Suggested Rewrite: ${flag.suggestedRewrite}`,
                        bullet: { level: 1 },
                    }));
                }
            });
        }
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children,
                },
            ],
        });
        const blob = await Packer.toBlob(doc);
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `analysis-${detectedType.replace(/\s+/g, '_')}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleShare = () => {
        // For now, generate a local link with a hash (could be improved with backend)
        const shareUrl = `${window.location.origin}${window.location.pathname}#analysis-${Date.now()}`;
        navigator.clipboard.writeText(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
    };

    const handleEmail = () => {
        const subject = encodeURIComponent(`Analysis for: ${detectedType}`);
        const body = encodeURIComponent(getFullAnalysisText());
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
    };

    // Analytics modal content
    const renderAnalyticsModal = (onClose: () => void) => (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur animate-fadeIn" onClick={onClose}>
            <div className="bg-neutral-900 p-6 rounded-xl shadow-2xl max-w-lg w-full flex flex-col" style={{ maxHeight: '360px' }} onClick={() => {}}>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-2 text-white">Analytics & Insights</h2>
                    <div className="mb-2 text-white text-base">
                        <div><strong>Documents Analyzed:</strong> {historyList.length}</div>
                        <div><strong>Total Flags Found:</strong> {historyList.reduce((sum: number, item: any) => sum + (item.results.flags?.length || 0), 0)}</div>
                        <div><strong>Average Risk Score:</strong> {historyList.length ? (historyList.reduce((a: number, item: any) => a + (item.results.riskAssessment?.risks?.reduce((sum: number, r: any) => sum + r.score, 0) || 0), 0) / historyList.length).toFixed(2) : 'N/A'}</div>
                    </div>
                    <div className="mb-2">
                        <div className="font-semibold text-white mb-1 text-base">Risk Score Trend (last 10 docs)</div>
                        <svg width="220" height="80" viewBox="0 0 220 80" className="bg-neutral-800 rounded-lg">
                            {[...Array(5)].map((_, i) => (
                                <line key={i} x1={24} x2={200} y1={12 + i*16} y2={12 + i*16} stroke="#444" strokeDasharray="2 2" />
                            ))}
                            {historyList.slice(0, 10).map((_: any, i: number) => (
                                <text key={i} x={24 + i*20} y={77} fontSize="12" fill="#aaa" textAnchor="middle">{i+1}</text>
                            ))}
                            {historyList.slice(0, 10).map((item: any, i: number) => {
                                const avg = item.results.riskAssessment?.risks?.length
                                    ? item.results.riskAssessment.risks.reduce((a: number, b: any) => a + b.score, 0) / item.results.riskAssessment.risks.length
                                    : 0;
                                return (
                                    <rect key={i} x={24 + i*20 - 7} y={12 + (64 - avg*6.4)} width={14} height={avg*6.4} fill="#1DB954" rx={2} />
                                );
                            })}
                            {[0,2,4,6,8,10].map((v, i) => (
                                <text key={i} x={16} y={80 - i*13} fontSize="12" fill="#aaa" textAnchor="end">{v}</text>
                            ))}
                        </svg>
                    </div>
                </div>
                <div className="sticky bottom-0 left-0 right-0 bg-neutral-900 pt-2 pb-1 z-10">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-spotify text-white rounded-lg font-semibold shadow hover:bg-spotify/80 transition text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    // History modal content
    const renderHistoryModal = (onClose: () => void) => (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur animate-fadeIn" onClick={onClose}>
            <div className="bg-neutral-900 p-6 rounded-xl shadow-2xl max-w-lg w-full flex flex-col" style={{ maxHeight: '360px' }} onClick={() => {}}>
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <h2 className="text-2xl font-bold mb-2 text-white">Analysis History</h2>
                    {historyList.length === 0 && <div className="px-2 py-1 text-gray-400 text-base">No history yet.</div>}
                    {historyList.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleLoadHistory()}
                            className="w-full text-left px-2 py-1 border-b border-neutral-800 hover:bg-spotify/10 transition text-base"
                        >
                            <div className="font-bold text-white truncate">{item.title}</div>
                            <div className="text-xs text-gray-400">{new Date(item.date).toLocaleString()}</div>
                        </button>
                    ))}
                </div>
                <div className="sticky bottom-0 left-0 right-0 bg-neutral-900 pt-2 pb-1 z-10">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-spotify text-white rounded-lg font-semibold shadow hover:bg-spotify/80 transition text-base"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="flex flex-row-reverse items-center justify-between mb-4 gap-3">
                <div className="flex gap-2 items-center" ref={dropdownRef}>
                    <div className="flex">
                        <button
                            onClick={handleListen}
                            className={`flex items-center gap-2 px-6 py-3 rounded-l-full border-2 border-spotify bg-black shadow-lg transition-all duration-200 hover:bg-spotify hover:text-black focus:outline-none focus:ring-2 focus:ring-spotify text-base drop-shadow-lg font-bold text-spotify ${isSpeaking ? 'bg-spotify/20' : ''}`}
                            aria-label={isSpeaking ? 'Stop listening' : 'Listen to analysis'}
                            style={{ minWidth: 180, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                        >
                            <SpeakerIcon className="w-6 h-6" />
                            <span>{isSpeaking ? 'Stop' : 'Listen to Analysis'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setDropdownOpen(v => !v);
                                if (!dropdownOpen && dropdownRef.current) {
                                    const rect = dropdownRef.current.getBoundingClientRect();
                                    setDropdownPosition({
                                        top: rect.bottom + window.scrollY,
                                        left: rect.left + window.scrollX,
                                        width: rect.width
                                    });
                                }
                            }}
                            className={`flex items-center px-3 py-3 rounded-r-full border-2 border-l-0 border-spotify bg-black shadow-lg transition-all duration-200 hover:bg-spotify hover:text-black focus:outline-none focus:ring-2 focus:ring-spotify text-base drop-shadow-lg font-bold text-spotify ${dropdownOpen ? 'bg-spotify/10' : ''}`}
                            aria-label="Select voice"
                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        >
                            <ChevronDownIcon className={`w-5 h-5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                    <button
                        ref={downloadButtonRef}
                        onClick={() => {
                            setShowDownloadDropdown(v => !v);
                            if (!showDownloadDropdown && downloadButtonRef.current) {
                                const rect = downloadButtonRef.current.getBoundingClientRect();
                                setDownloadDropdownPosition({
                                    top: rect.bottom + window.scrollY,
                                    left: rect.left + window.scrollX,
                                    width: rect.width
                                });
                            }
                        }}
                        className="px-4 py-3 rounded-full border-2 border-spotify text-spotify font-semibold bg-black hover:bg-spotify hover:text-black transition ml-2 shadow-lg text-base"
                        style={{ minWidth: 120 }}
                    >
                        Download
                    </button>
                    {showDownloadDropdown && downloadDropdownPosition && ReactDOM.createPortal(
                        <div
                            className="absolute z-[20000] w-40 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl animate-fadeIn"
                            style={{
                                position: 'absolute',
                                top: downloadDropdownPosition.top,
                                left: downloadDropdownPosition.left,
                                minWidth: downloadDropdownPosition.width,
                            }}
                        >
                            <button
                                onClick={() => { handleDownloadPDF(); setShowDownloadDropdown(false); }}
                                className="w-full text-left px-4 py-2 hover:bg-spotify/10 text-white"
                            >
                                PDF
                            </button>
                            <button
                                onClick={() => { handleDownloadDOCX(); setShowDownloadDropdown(false); }}
                                className="w-full text-left px-4 py-2 hover:bg-spotify/10 text-white"
                            >
                                DOCX
                            </button>
                        </div>,
                        document.body
                    )}
                </div>
                <h3 className="text-xl font-bold text-white flex-1">Analysis for: <strong>{detectedType}</strong></h3>
            </div>
            <div className="space-y-6">
                <AnalysisCard
                    icon={<PlainLanguageIcon className="w-6 h-6" />}
                    title="Plain Language Summary"
                >
                    <p className="text-neutral-300 leading-relaxed flex-1">{results.plainLanguageSummary}</p>
                </AnalysisCard>
                <AnalysisCard
                    icon={<RiskAssessmentIcon className="w-6 h-6" />}
                    title="Risk Assessment"
                >
                    <div className="mb-2">
                        <p className="text-neutral-300 flex-1">{results.riskAssessment.overallSummary}</p>
                    </div>
                    <div className="space-y-3 mt-2">
                        {results.riskAssessment.risks.map((risk, i) => (
                            <RiskBar key={i} risk={risk} />
                        ))}
                    </div>
                </AnalysisCard>
                <AnalysisCard
                    icon={<AiInsightsIcon className="w-6 h-6" />}
                    title="AI Insights"
                >
                    <div className="mb-2">
                        <p className="text-neutral-300 flex-1">{results.aiInsights.overallSummary}</p>
                    </div>
                    <div className="space-y-3 mt-2">
                        {results.aiInsights.recommendations.map((insight, i) => (
                            <InsightCard key={i} insight={insight} />
                        ))}
                    </div>
                </AnalysisCard>
                <AnalysisCard
                    icon={<LegalFindingsIcon className="w-6 h-6" />}
                    title="Flags Found"
                >
                    <div className="space-y-4">
                        {results.flags.length > 0 ? (
                            results.flags.map(flag => (
                                <div key={flag.id} className="cursor-pointer transition border-l-4 pl-2 border-transparent hover:bg-neutral-800/50">
                                    <FlagCard flag={flag} />
                                </div>
                            ))
                        ) : (
                            <p className="text-neutral-400">No significant flags were detected in the document.</p>
                        )}
                    </div>
                </AnalysisCard>
            </div>
            {analyticsOpen && renderAnalyticsModal(onCloseAnalytics || (() => {})) }
            {historyOpen && renderHistoryModal(onCloseHistory || (() => {})) }
            {showCopied && (
                <div className="absolute top-0 right-0 mt-[-2.5rem] mr-2 bg-spotify text-white px-4 py-2 rounded shadow-lg animate-fadeIn z-50">
                    Link copied!
                </div>
            )}
            {dropdownOpen && dropdownPosition && ReactDOM.createPortal(
                <div
                    className="absolute z-[20000] w-72 max-h-64 overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl animate-fadeIn"
                    style={{
                        position: 'absolute',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        minWidth: dropdownPosition.width,
                    }}
                    onMouseDown={e => e.stopPropagation()}
                >
                    {voices.map(voice => (
                        <div key={voice.voiceURI} className="flex items-center justify-between px-2 py-1 hover:bg-spotify/10 rounded transition">
                            <button
                                onClick={e => { e.stopPropagation(); setSelectedVoiceURI(voice.voiceURI); setDropdownOpen(false); }}
                                className={`flex-1 text-left px-2 py-2 text-white hover:bg-spotify/20 focus:bg-spotify/30 transition rounded ${selectedVoiceURI === voice.voiceURI ? 'bg-spotify/10 font-bold text-spotify' : ''}`}
                            >
                                {voice.name} <span className="text-xs text-gray-400">{voice.lang}</span> {voice.default ? <span className="text-xs text-spotify">(Default)</span> : ''}
                                {localStorage.getItem('flagr_default_voice') === voice.voiceURI && <span className="ml-2 text-xs text-green-400">(Your Default)</span>}
                            </button>
                            <button
                                onClick={() => { setDefaultVoice(voice.voiceURI); }}
                                className="ml-2 px-2 py-1 text-xs rounded bg-spotify/20 text-spotify hover:bg-spotify/40 border border-spotify"
                            >
                                Set as Default
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
            {/* At the bottom of the analysis, add a Share button with popover/modal for Copy Link and Email Report */}
            <div className="flex justify-end mt-8">
                <div className="relative">
                    <button
                        ref={shareButtonRef}
                        onClick={() => {
                            setShowShareDropdown(v => !v);
                            if (!showShareDropdown && shareButtonRef.current) {
                                const rect = shareButtonRef.current.getBoundingClientRect();
                                // If dropdown would overflow bottom, open upwards
                                const dropdownHeight = 120; // estimate, adjust as needed
                                const spaceBelow = window.innerHeight - rect.bottom;
                                const top = spaceBelow < dropdownHeight
                                    ? rect.top + window.scrollY - dropdownHeight
                                    : rect.bottom + window.scrollY;
                                setShareDropdownPosition({
                                    top,
                                    left: rect.left + window.scrollX,
                                    width: rect.width
                                });
                            }
                        }}
                        className="px-6 py-3 rounded-full border-2 border-spotify text-spotify font-bold bg-black hover:bg-spotify hover:text-black transition shadow-lg"
                    >
                        Share
                    </button>
                    {showShareDropdown && shareDropdownPosition && ReactDOM.createPortal(
                        <div
                            className="absolute z-[20000] w-56 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl animate-fadeIn"
                            style={{
                                position: 'absolute',
                                top: shareDropdownPosition.top,
                                left: shareDropdownPosition.left,
                                minWidth: shareDropdownPosition.width,
                            }}
                        >
                            <button
                                onClick={() => { handleShare(); setShowShareDropdown(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-spotify/10 text-white"
                            >
                                Copy Link
                            </button>
                            <button
                                onClick={() => { handleEmail(); setShowShareDropdown(false); }}
                                className="w-full text-left px-4 py-3 hover:bg-spotify/10 text-white"
                            >
                                Email Report
                            </button>
                        </div>,
                        document.body
                    )}
                    </div>
            </div>
        </div>
    );
};

export default AnalysisResultsView;