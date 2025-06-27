import React, { useRef } from 'react';
import {
    UploadIcon, LegalFindingsIcon, PlainLanguageIcon,
    RiskAssessmentIcon, PatternSearchIcon, AiInsightsIcon
} from '../constants';

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick?: () => void;
    fullWidth?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick, fullWidth = false }) => {
    const isClickable = !!onClick;
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
            onClick={onClick}
            onMouseMove={handleMouseMove}
            className={`spotlight-card relative p-4 rounded-xl border border-white/5 bg-black/20 backdrop-blur-lg transition-all duration-300 hover:border-spotify/50 glass-pane hover:-translate-y-1 ${isClickable ? 'cursor-pointer' : ''}`}
        >
            <div className={`relative flex items-start gap-4 ${fullWidth ? 'md:items-center' : ''}`}>
                <div className="p-3 rounded-full transition-all bg-spotify/10 border border-spotify/20">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-white mb-1">{title}</h3>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
            </div>
        </div>
    );
};

interface InitialViewProps {
    onUploadClick: () => void;
}

const InitialView: React.FC<InitialViewProps> = ({ onUploadClick }) => {
    const cardData = [
        {
            icon: <UploadIcon className="w-6 h-6 text-spotify" />,
            title: 'Upload Document',
            description: 'Click to select documents for instant AI analysis',
            action: onUploadClick
        },
        {
            icon: <LegalFindingsIcon className="w-6 h-6 text-spotify" />,
            title: 'Find Flags',
            description: 'Review AI-detected risks, clauses, and key points',
        },
        {
            icon: <PlainLanguageIcon className="w-6 h-6 text-spotify" />,
            title: 'Plain Language',
            description: 'Convert complex language into understandable text',
        },
        {
            icon: <RiskAssessmentIcon className="w-6 h-6 text-spotify" />,
            title: 'Risk Assessment',
            description: 'Comprehensive compliance and transparency analysis',
        },
        {
            icon: <PatternSearchIcon className="w-6 h-6 text-spotify" />,
            title: 'Pattern Search',
            description: 'Find similar clauses across document databases',
        },
        {
            icon: <AiInsightsIcon className="w-6 h-6 text-spotify" />,
            title: 'AI Insights',
            description: 'Get detailed analysis and recommendations',
        },
    ];

    const uploadCard = cardData[0];
    const otherCards = cardData.slice(1);

    return (
        <div>
            <div className="mb-8 animate-fadeInSlideUp">
                 <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 mb-4 py-2">Flag Issues. Instantly.</h1>
                <p className="text-lg text-gray-400 max-w-2xl">
                    Analyze documents, detect hidden flags, and translate complex language into clear, understandable insights with Flagr.
                </p>
            </div>
            
            <div className="space-y-6 animate-fadeInSlideUp" style={{animationDelay: '150ms'}}>
                <ActionCard
                    key={uploadCard.title}
                    icon={uploadCard.icon}
                    title={uploadCard.title}
                    description={uploadCard.description}
                    onClick={uploadCard.action}
                    fullWidth={true}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {otherCards.map(card => (
                        <ActionCard 
                            key={card.title} 
                            icon={card.icon}
                            title={card.title}
                            description={card.description}
                            onClick={card.action}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default InitialView;