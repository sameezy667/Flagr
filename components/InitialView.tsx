import React, { useRef, useEffect } from 'react';
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

    // Only the Generate Template card is a button
    if (isClickable && title === 'Generate Template') {
        return (
            <button
                ref={cardRef as any}
                onClick={e => {
                    e.stopPropagation();
                    console.log('Generate Template ActionCard BUTTON fired');
                    if (onClick) onClick();
                }}
                onMouseMove={handleMouseMove as any}
                className={`spotlight-card relative p-3 sm:p-4 rounded-xl border border-white/5 bg-black/20 backdrop-blur-lg transition-all duration-300 hover:border-spotify/50 glass-pane hover:-translate-y-1 cursor-pointer w-full text-left focus:outline-none focus:ring-2 focus:ring-spotify z-[10] ${fullWidth ? 'md:items-center' : ''}`}
                tabIndex={0}
                type="button"
                style={{ position: 'relative', zIndex: 10 }}
            >
                <div className={`relative flex items-start gap-3 sm:gap-4 ${fullWidth ? 'md:items-center' : ''}`}>
                    <div className="p-2 sm:p-3 rounded-full transition-all bg-spotify/10 border border-spotify/20 flex-shrink-0">
                        {icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">{title}</h3>
                        <p className="text-xs sm:text-sm text-gray-400">{description}</p>
                    </div>
                </div>
            </button>
        );
    }
    // Default: render as div
    return (
        <div 
            ref={cardRef}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            className={`spotlight-card relative p-3 sm:p-4 rounded-xl border border-white/5 bg-black/20 backdrop-blur-lg transition-all duration-300 hover:border-spotify/50 glass-pane hover:-translate-y-1 ${isClickable ? 'cursor-pointer' : ''}`}
        >
            <div className={`relative flex items-start gap-3 sm:gap-4 ${fullWidth ? 'md:items-center' : ''}`}>
                <div className="p-2 sm:p-3 rounded-full transition-all bg-spotify/10 border border-spotify/20 flex-shrink-0">
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">{title}</h3>
                    <p className="text-xs sm:text-sm text-gray-400">{description}</p>
                </div>
            </div>
        </div>
    );
};

interface InitialViewProps {
    onUploadClick: () => void;
    onRiskQuizClick?: () => void;
    onGenerateTemplate?: () => void;
}

const InitialView: React.FC<InitialViewProps> = ({ onUploadClick, onRiskQuizClick, onGenerateTemplate }) => {
    const cardData = [
        {
            icon: <UploadIcon className="w-5 h-5 sm:w-6 sm:h-6 text-spotify" />,
            title: 'Upload Document',
            description: 'Click to select documents for instant AI analysis',
            action: onUploadClick
        },
        // Remove Generate Template card from here
        {
            icon: <LegalFindingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-spotify" />,
            title: 'Find Flags',
            description: 'Review AI-detected risks, clauses, and key points',
        },
        {
            icon: <PlainLanguageIcon className="w-5 h-5 sm:w-6 sm:h-6 text-spotify" />,
            title: 'Plain Language',
            description: 'Convert complex language into understandable text',
        },
        {
            icon: <RiskAssessmentIcon className="w-5 h-5 sm:w-6 sm:h-6 text-spotify" />,
            title: 'Risk Assessment',
            description: 'Comprehensive compliance and transparency analysis',
        },
        {
            icon: <PatternSearchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-spotify" />,
            title: 'Pattern Search',
            description: 'Find similar clauses across document databases',
        },
        {
            icon: <AiInsightsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-spotify" />,
            title: 'AI Insights',
            description: 'Get detailed analysis and recommendations',
        },
    ];

    const uploadCard = cardData[0];
    const otherCards = cardData.slice(1);

    return (
        <div
            // Add top padding to prevent overlap with fixed top-right buttons
            className="pt-[88px] sm:pt-[88px] md:pt-[40px]"
            style={{ paddingTop: '88px' }}
        >
            {/* Top-right action buttons container */}
            <div style={{ position: 'fixed', top: 24, right: 32, zIndex: 99999, display: 'flex', gap: '16px' }}>
                {onRiskQuizClick && (
                    <button
                        onClick={onRiskQuizClick}
                        className="px-5 py-2.5 rounded-full font-bold text-spotify border-2 border-spotify bg-black shadow-lg transition-all duration-200 hover:bg-spotify hover:text-black hover:scale-105 focus:outline-none focus:ring-2 focus:ring-spotify text-base"
                        style={{ boxShadow: '0 2px 16px rgba(29,185,84,0.15)' }}
                    >
                        <span role="img" aria-label="Quiz">📝</span> Take the Risk Quiz
                    </button>
                )}
                {onGenerateTemplate && (
                    <button
                        onClick={() => {
                            console.log('Top Right Generate Template button clicked');
                            onGenerateTemplate();
                        }}
                        className="px-5 py-2.5 rounded-full font-bold text-spotify border-2 border-spotify bg-black shadow-lg transition-all duration-200 hover:bg-spotify hover:text-black hover:scale-105 focus:outline-none focus:ring-2 focus:ring-spotify text-base"
                        style={{ boxShadow: '0 2px 16px rgba(29,185,84,0.15)' }}
                    >
                        Generate Template
                    </button>
                )}
            </div>
            {/* Remove old Take the Risk Quiz button from below the title */}
            <div className="mb-6 sm:mb-8 animate-fadeInSlideUp">
                 <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white mb-3 sm:mb-4 py-2">Flag Issues. Instantly.</h1>
                <p className="text-base sm:text-lg text-gray-400 max-w-2xl">
                    Analyze documents, detect hidden flags, and translate complex language into clear, understandable insights with Flagr.
                </p>
            </div>
            <div className="space-y-4 sm:space-y-6 animate-fadeInSlideUp" style={{animationDelay: '150ms'}}>
                {/* Render Upload card only */}
                <ActionCard
                    key={cardData[0].title}
                    icon={cardData[0].icon}
                    title={cardData[0].title}
                    description={cardData[0].description}
                    onClick={cardData[0].action}
                    fullWidth={true}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClose: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    } else {
      return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top };
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    drawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleEnd = () => {
    drawing.current = false;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 backdrop-blur animate-fadeIn">
      <div className="bg-neutral-900 p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col items-center">
        <h2 className="text-xl font-bold text-white mb-4">Sign Below</h2>
        <canvas
          ref={canvasRef}
          width={400}
          height={180}
          className="border border-spotify rounded bg-neutral-900 cursor-crosshair mb-4"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        />
        <div className="flex gap-3 mb-4">
          <button className="px-4 py-2 bg-neutral-700 text-white rounded font-semibold hover:bg-neutral-600 transition" onClick={handleClear}>Clear</button>
          <button className="px-4 py-2 bg-spotify text-white rounded font-semibold hover:bg-spotify/80 transition" onClick={handleSave}>Save</button>
        </div>
        <button className="px-4 py-2 bg-neutral-700 text-white rounded font-semibold hover:bg-neutral-600 transition w-full" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default InitialView;