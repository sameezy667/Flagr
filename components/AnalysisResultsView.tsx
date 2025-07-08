import React, { useRef } from 'react';
import { AnalysisResult, Flag, Risk, Insight } from '../types';
import {
    PlainLanguageIcon, LegalFindingsIcon, RiskAssessmentIcon, AiInsightsIcon, StatsIcon
} from '../constants';

const getSeverityDot = (severity: 'Low' | 'Medium' | 'High') => {
    const color = severity === 'High' ? 'bg-red-500' : severity === 'Medium' ? 'bg-yellow-400' : 'bg-sky-400';
    return <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${color}`}></span>;
};

const ClauseExplorer: React.FC<{ flags: Flag[] }> = ({ flags }) => (
    <aside className="sticky top-4 bg-neutral-900/80 border border-neutral-700/60 rounded-xl p-4 mb-6 max-h-[80vh] overflow-y-auto shadow-lg">
        <h3 className="text-sm font-bold text-white mb-3">Flagged Clauses</h3>
        <ul className="space-y-2">
            {flags.map(flag => (
                <li key={flag.id}>
                    <button
                        className="flex items-center w-full text-left px-2 py-1 rounded hover:bg-neutral-800/80 transition group"
                        onClick={() => {
                            const el = document.getElementById(flag.id);
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                el.classList.add('ring-4', 'ring-spotify', 'transition');
                                setTimeout(() => el.classList.remove('ring-4', 'ring-spotify', 'transition'), 1200);
                            }
                        }}
                    >
                        {getSeverityDot(flag.severity)}
                        <span className="font-medium text-white mr-2">{flag.title}</span>
                        <span className="text-xs text-gray-400">[{flag.severity}]</span>
                    </button>
                </li>
            ))}
        </ul>
    </aside>
);

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

const FlagCard: React.FC<{ flag: Flag }> = ({ flag }) => (
    <div className="p-4 rounded-lg border bg-neutral-800/50 border-neutral-700/80">
        <div className="flex justify-between items-start mb-2 gap-4">
            <h4 className="font-semibold text-white">{flag.title}</h4>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getSeverityClass(flag.severity)}`}>{flag.severity}</span>
        </div>
        <blockquote className="text-sm text-neutral-400 border-l-2 border-spotify/50 pl-3 my-2 italic">
            <span id={flag.id}>"{flag.clause}"</span>
        </blockquote>
        <p className="text-sm text-neutral-300 mt-2">{flag.explanation}</p>
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

const RiskBar: React.FC<{ risk: Risk }> = ({ risk }) => {
    const riskGradient = risk.score > 7 
        ? 'from-red-500 to-red-400' 
        : risk.score > 4 
        ? 'from-yellow-500 to-yellow-400' 
        : 'from-spotify to-green-400';

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-neutral-200">{risk.area}</p>
                <p className={`text-sm font-bold ${risk.score > 7 ? 'text-red-400' : risk.score > 4 ? 'text-yellow-400' : 'text-spotify'}`}>{risk.score} / 10</p>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden shimmer-bg">
                <div className={`h-2 rounded-full animate-fill bg-gradient-to-r ${riskGradient}`} style={{ width: `${risk.score * 10}%` }}></div>
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

const AnalysisResultsView: React.FC<{ results: AnalysisResult }> = ({ results }) => {
    const detectedType = results.detectedDocType || results.docType || 'Uploaded Document';
    return (
        <>
            <h3 className="text-xl font-bold text-white mb-4">Analysis for: <strong>{detectedType}</strong></h3>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Clause Explorer Sidebar */}
                <div className="lg:col-span-1 hidden lg:block">
                    <ClauseExplorer flags={results.flags} />
                </div>
                {/* Main Column */}
                <div className="lg:col-span-2 space-y-6">
                    <AnalysisCard
                        icon={<PlainLanguageIcon className="w-6 h-6" />}
                        title="Plain Language Summary"
                        className="animate-stagger-in"
                        style={{ animationDelay: '0ms'}}
                    >
                        <p className="text-neutral-300 leading-relaxed">{results.plainLanguageSummary}</p>
                    </AnalysisCard>
                    <AnalysisCard
                        icon={<LegalFindingsIcon className="w-6 h-6" />}
                        title="Flags Found"
                        className="animate-stagger-in"
                        style={{ animationDelay: '100ms'}}
                    >
                        <div className="space-y-4">
                            {results.flags.length > 0 ? (
                                results.flags.map(flag => <FlagCard key={flag.id} flag={flag} />)
                            ) : (
                                <p className="text-neutral-400">No significant flags were detected in the document.</p>
                            )}
                        </div>
                    </AnalysisCard>
                </div>
                {/* Side Column */}
                <div className="lg:col-span-1 space-y-6">
                     <AnalysisCard
                        icon={<StatsIcon className="w-6 h-6" />}
                        title="Document Statistics"
                        className="animate-stagger-in"
                        style={{ animationDelay: '200ms'}}
                    >
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-white">
                                <span className="text-neutral-400 font-normal">Detected Type: </span>{results.docType}
                            </p>
                            <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                                <div><p className="text-neutral-400">Word Count</p><p className="text-xl font-semibold text-white">{results.stats.words.toLocaleString()}</p></div>
                                <div><p className="text-neutral-400">Characters</p><p className="text-xl font-semibold text-white">{results.stats.characters.toLocaleString()}</p></div>
                                <div><p className="text-neutral-400">Sentences</p><p className="text-xl font-semibold text-white">{results.stats.sentences.toLocaleString()}</p></div>
                                <div><p className="text-neutral-400">Reading Time</p><p className="text-xl font-semibold text-white">~{results.stats.readingTime} min</p></div>
                            </div>
                        </div>
                    </AnalysisCard>
                     <AnalysisCard
                        icon={<RiskAssessmentIcon className="w-6 h-6" />}
                        title="Risk Assessment"
                        className="animate-stagger-in"
                        style={{ animationDelay: '300ms'}}
                    >
                        <div className="space-y-4">
                            <p className="text-sm text-neutral-300 mb-2">{results.riskAssessment.overallSummary}</p>
                             {results.riskAssessment.risks.map((risk, i) => <RiskBar key={i} risk={risk} />)}
                        </div>
                    </AnalysisCard>
                     <AnalysisCard
                        icon={<AiInsightsIcon className="w-6 h-6" />}
                        title="AI-Powered Insights"
                        className="animate-stagger-in"
                        style={{ animationDelay: '400ms'}}
                    >
                        <div className="space-y-4">
                           <p className="text-sm text-neutral-300 mb-2">{results.aiInsights.overallSummary}</p>
                           {results.aiInsights.recommendations.map(insight => <InsightCard key={insight.id} insight={insight} />)}
                        </div>
                    </AnalysisCard>
                </div>
            </div>
        </>
    );
};

export default AnalysisResultsView;