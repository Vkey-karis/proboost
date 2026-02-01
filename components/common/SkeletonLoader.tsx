import React from 'react';

interface SkeletonLoaderProps {
    variant?: 'text' | 'card' | 'avatar' | 'button' | 'input';
    width?: string;
    height?: string;
    className?: string;
    count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    variant = 'text',
    width,
    height,
    className = '',
    count = 1,
}) => {
    const baseClasses = 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 animate-shimmer bg-[length:200%_100%]';

    const getVariantClasses = () => {
        switch (variant) {
            case 'text':
                return 'h-4 rounded';
            case 'card':
                return 'h-48 rounded-xl';
            case 'avatar':
                return 'w-12 h-12 rounded-full';
            case 'button':
                return 'h-10 rounded-lg';
            case 'input':
                return 'h-12 rounded-lg';
            default:
                return 'h-4 rounded';
        }
    };

    const skeletons = Array.from({ length: count }, (_, i) => (
        <div
            key={i}
            className={`${baseClasses} ${getVariantClasses()} ${className}`}
            style={{
                width: width || (variant === 'avatar' ? '3rem' : '100%'),
                height: height,
            }}
            aria-hidden="true"
        />
    ));

    return count > 1 ? (
        <div className="space-y-3">{skeletons}</div>
    ) : (
        <>{skeletons}</>
    );
};

// Preset Skeleton Components for common use cases
export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${className}`}>
        <div className="flex items-center gap-4 mb-4">
            <SkeletonLoader variant="avatar" />
            <div className="flex-1 space-y-2">
                <SkeletonLoader variant="text" width="60%" />
                <SkeletonLoader variant="text" width="40%" />
            </div>
        </div>
        <SkeletonLoader variant="text" count={3} className="mb-2" />
        <div className="flex gap-2 mt-4">
            <SkeletonLoader variant="button" width="100px" />
            <SkeletonLoader variant="button" width="100px" />
        </div>
    </div>
);

export const SkeletonList: React.FC<{ count?: number; className?: string }> = ({
    count = 5,
    className = '',
}) => (
    <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }, (_, i) => (
            <div
                key={i}
                className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
            >
                <SkeletonLoader variant="avatar" />
                <div className="flex-1 space-y-2">
                    <SkeletonLoader variant="text" width="70%" />
                    <SkeletonLoader variant="text" width="50%" />
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonDashboard: React.FC = () => (
    <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
            <SkeletonLoader variant="text" width="300px" height="32px" />
            <SkeletonLoader variant="text" width="200px" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
        </div>

        {/* Content Section */}
        <div className="space-y-4">
            <SkeletonLoader variant="text" width="200px" height="24px" />
            <SkeletonList count={3} />
        </div>
    </div>
);

// Add shimmer animation styles
const shimmerStyles = `
@keyframes shimmer {
    0% {
        background-position: -200% 0;
    }
    100% {
        background-position: 200% 0;
    }
}

.animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
}
`;

// Inject styles
if (typeof document !== 'undefined') {
    const styleId = 'skeleton-loader-styles';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = shimmerStyles;
        document.head.appendChild(style);
    }
}
