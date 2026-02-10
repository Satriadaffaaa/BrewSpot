'use client'

import { UserCircleIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { UserProfile } from '@/features/gamification/types'
import { Card } from '@/components/common/Card'

interface LeaderboardTableProps {
    users: UserProfile[]
    type: 'explorers' | 'contributors'
    loading?: boolean
}

export const LeaderboardTable = ({ users, type, loading }: LeaderboardTableProps) => {
    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (users.length === 0) {
        return (
            <Card className="p-8 text-center text-neutral/60">
                <TrophyIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No data available yet.</p>
            </Card>
        )
    }

    return (
        <div className="space-y-3">
            {users.map((user, index) => {
                const displayName = user.displayName
                    || (user.email ? user.email.split('@')[0] : `User ${user.uid.slice(0, 4)}...`);

                const statValue = type === 'explorers'
                    ? user.stats?.totalCheckIns || 0
                    : user.xp || 0;

                const statLabel = type === 'explorers' ? 'Check-ins' : 'XP';

                return (
                    <div key={user.uid} className="flex items-center justify-between p-3 bg-white border border-neutral/10 rounded-xl hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                            {/* Rank */}
                            <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                            'text-neutral/50'
                                }`}>
                                #{index + 1}
                            </div>

                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-neutral/10 flex-shrink-0">
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <UserCircleIcon className="w-6 h-6" />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="min-w-0">
                                <h4 className="font-bold text-neutral-800 truncate">{displayName}</h4>
                                {type === 'contributors' && user.level && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                        Level {user.level}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stat */}
                        <div className="text-right">
                            <div className="font-bold text-lg text-primary">{statValue}</div>
                            <div className="text-xs text-neutral/50 font-medium uppercase tracking-wider">{statLabel}</div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
