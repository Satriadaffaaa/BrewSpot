import { Badge, BADGE_DEFINITIONS } from '@/features/gamification/badges';
import { BadgeItem } from './BadgeItem';
import { UserStats } from '@/features/gamification/types';
import { getBadgeProgress } from '@/features/gamification/utils';
import { Button } from '@/components/common/Button';
import Link from 'next/link';

interface BadgeListProps {
    badgeIds: string[];
    userStats?: UserStats;
    variant?: 'preview' | 'full';
}

export function BadgeList({ badgeIds, userStats, variant = 'full' }: BadgeListProps) {
    const earnedBadgeSet = new Set(badgeIds);

    // PREVIEW MODE: Only Show Unlocked Badges
    if (variant === 'preview') {
        const unlockedBadges = badgeIds
            .map(id => BADGE_DEFINITIONS[id])
            .filter(Boolean);

        if (unlockedBadges.length === 0) {
            return (
                <div className="text-sm text-gray-400 italic text-center py-4">
                    No badges earned yet. Start reviewing and adding spots!
                </div>
            );
        }

        // Show max 4 badges in preview
        const visibleBadges = unlockedBadges.slice(0, 4);

        return (
            <div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                    {visibleBadges.map(badge => (
                        <BadgeItem
                            key={badge.id}
                            badge={badge}
                            isUnlocked={true}
                            size="sm"
                        />
                    ))}
                </div>
                <Link href="/profile/badges" className="block">
                    <Button variant="outline" className="w-full text-xs" size="sm">
                        View All Badges
                    </Button>
                </Link>
            </div>
        );
    }

    // FULL MODE: Show Categories & Progress
    const allBadges = Object.values(BADGE_DEFINITIONS);

    // Group by category
    const categories = {
        community: allBadges.filter(b => b.category === 'community'),
        contribution: allBadges.filter(b => b.category === 'contribution'),
        excellence: allBadges.filter(b => b.category === 'excellence')
    };

    const renderCategory = (title: string, badges: Badge[]) => (
        <div className="mb-8 last:mb-0">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">
                {title}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-6">
                {badges.map(badge => {
                    const isUnlocked = earnedBadgeSet.has(badge.id);
                    const progress = getBadgeProgress(badge.id, userStats);

                    return (
                        <BadgeItem
                            key={badge.id}
                            badge={badge}
                            isUnlocked={isUnlocked}
                            progress={progress}
                        />
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="py-2">
            {renderCategory('Community', categories.community)}
            {renderCategory('Contribution', categories.contribution)}
            {renderCategory('Excellence', categories.excellence)}
        </div>
    );
}
