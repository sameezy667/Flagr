import React from 'react';

const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`shimmer-bg bg-neutral-800 rounded-md ${className}`}></div>
);

const SkeletonCard: React.FC<{ children?: React.ReactNode; className?: string; }> = ({ children, className }) => (
    <div className={`bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden ${className}`}>
        <div className="p-4 border-b border-neutral-800 flex items-center gap-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-32 h-5" />
        </div>
        <div className="p-5 space-y-3">
            {children}
        </div>
    </div>
);

const AnalysisLoadingView: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Main Column Skeletons */}
            <div className="lg:col-span-2 space-y-6">
                <SkeletonCard>
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                </SkeletonCard>
                <SkeletonCard>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-neutral-800 shimmer-bg">
                             <div className="flex justify-between items-start mb-2 gap-4">
                                <Skeleton className="w-1/2 h-5" />
                                <Skeleton className="w-16 h-6 rounded-full" />
                            </div>
                            <Skeleton className="w-full h-8" />
                            <Skeleton className="w-3/4 h-4 mt-2" />
                        </div>
                         <div className="p-4 rounded-lg bg-neutral-800 shimmer-bg">
                             <div className="flex justify-between items-start mb-2 gap-4">
                                <Skeleton className="w-1/2 h-5" />
                                <Skeleton className="w-16 h-6 rounded-full" />
                            </div>
                            <Skeleton className="w-full h-8" />
                            <Skeleton className="w-3/4 h-4 mt-2" />
                        </div>
                    </div>
                </SkeletonCard>
            </div>

            {/* Side Column Skeletons */}
            <div className="lg:col-span-1 space-y-6">
                <SkeletonCard>
                     <Skeleton className="w-full h-4" />
                     <Skeleton className="w-3/4 h-4" />
                     <div className="pt-2 space-y-4">
                        <div>
                             <div className="flex justify-between items-center mb-1">
                                <Skeleton className="w-20 h-4" />
                                <Skeleton className="w-12 h-4" />
                            </div>
                            <Skeleton className="w-full h-2 rounded-full" />
                        </div>
                         <div>
                             <div className="flex justify-between items-center mb-1">
                                <Skeleton className="w-20 h-4" />
                                <Skeleton className="w-12 h-4" />
                            </div>
                            <Skeleton className="w-full h-2 rounded-full" />
                        </div>
                     </div>
                </SkeletonCard>
                 <SkeletonCard>
                     <Skeleton className="w-full h-4" />
                     <Skeleton className="w-3/4 h-4" />
                </SkeletonCard>
            </div>
        </div>
    );
};

export default AnalysisLoadingView;