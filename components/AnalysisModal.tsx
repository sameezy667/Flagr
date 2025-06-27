import React, { useEffect } from 'react';
import { XIcon } from '../constants';

interface ModalProps {
    children: React.ReactNode;
    onClose: () => void;
}

const AnalysisModal: React.FC<ModalProps> = ({ children, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'auto';
        };
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-4xl h-[90vh] bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-4 border-b border-neutral-800 flex justify-between items-center flex-shrink-0">
                    <h2 className="font-semibold text-lg text-white">Analysis Report</h2>
                    <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:bg-neutral-700 hover:text-white transition-colors">
                        <XIcon className="w-5 h-5"/>
                    </button>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AnalysisModal;