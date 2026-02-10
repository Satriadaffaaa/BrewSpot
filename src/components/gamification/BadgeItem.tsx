import { Badge } from '@/features/gamification/badges';

interface BadgeItemProps {
    badge: Badge;
    size?: 'sm' | 'md' | 'lg';
    isUnlocked?: boolean;
    progress?: {
        current: number;
        target: number;
        percentage: number;
    };
}

export function BadgeItem({ badge, size = 'md', isUnlocked = true, progress }: BadgeItemProps) {
    const sizeClasses = {
        sm: 'w-8 h-8 text-lg',
        md: 'w-12 h-12 text-2xl',
        lg: 'w-16 h-16 text-3xl'
    };

    return (
        <div className="group relative flex flex-col items-center">
            <div className={`
                ${sizeClasses[size]} 
                rounded-full flex items-center justify-center shadow-sm border 
                transition-all duration-300 cursor-help
                ${isUnlocked
                    ? 'bg-yellow-50 border-yellow-200 hover:scale-110 hover:shadow-md'
                    : 'bg-gray-100 border-gray-200 grayscale opacity-60'
                }
            `}>
                <span className={!isUnlocked ? 'filter grayscale contrast-50' : ''}>
                    {badge.icon}
                </span>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block w-40 p-3 bg-black/90 text-white text-xs rounded-lg text-center z-10 pointer-events-none shadow-xl border border-white/10">
                <div className="font-bold mb-1 text-sm">{badge.name}</div>
                <div className="text-gray-300 mb-2">{badge.description}</div>

                {/* Progress Bar */}
                {progress && !isUnlocked && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="flex justify-between text-[10px] uppercase text-gray-400 font-bold mb-1">
                            <span>Progress</span>
                            <span>{Math.floor(progress.percentage)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-yellow-400 transition-all duration-1000"
                                style={{ width: `${progress.percentage}%` }}
                            />
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1">
                            {progress.current} / {progress.target}
                        </div>
                    </div>
                )}

                {isUnlocked && (
                    <div className="mt-2 text-green-400 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1">
                        UNLOCKED
                    </div>
                )}

                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
            </div>
        </div>
    );
}
