'use client'

import { useEffect, useState } from 'react'
import { getTopVisitors } from '../service'
import { BrewSpotVisitorStats } from '../types'
import { getUserProfile } from '@/features/auth/api'
import { Card } from '@/components/common/Card'
import { UserCircleIcon, TrophyIcon } from '@heroicons/react/24/outline'

interface TopVisitorsListProps {
    brewSpotId: string
}

interface VisitorProfile {
    displayName?: string
    photoURL?: string
    email?: string
}

export const TopVisitorsList = ({ brewSpotId }: TopVisitorsListProps) => {
    const [stats, setStats] = useState<BrewSpotVisitorStats | null>(null)
    const [profiles, setProfiles] = useState<Record<string, VisitorProfile>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStatsAndProfiles = async () => {
            try {
                const data = await getTopVisitors(brewSpotId)
                setStats(data)

                if (data && data.topVisitors.length > 0) {
                    const topUserIds = data.topVisitors.slice(0, 5).map(v => v.userId)

                    // Fetch profiles in parallel
                    const profilePromises = topUserIds.map(uid => getUserProfile(uid))
                    const userProfiles = await Promise.all(profilePromises)

                    const profileMap: Record<string, VisitorProfile> = {}
                    userProfiles.forEach((profile, index) => {
                        if (profile) {
                            profileMap[topUserIds[index]] = {
                                displayName: profile.displayName,
                                photoURL: profile.photoURL,
                                email: profile.email
                            }
                        }
                    })
                    setProfiles(profileMap)
                }

            } catch (err) {
                console.error("Failed to fetch top visitors or profiles", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStatsAndProfiles()
    }, [brewSpotId])

    if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>

    if (!stats || stats.topVisitors.length === 0) {
        return (
            <Card className="p-6 text-center text-neutral/60">
                <TrophyIcon className="w-12 h-12 mx-auto mb-2 opacity-50 text-yellow-500" />
                <p>Be the first to check in and become a Local Legend!</p>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
                <TrophyIcon className="w-5 h-5 text-yellow-500" />
                Top Visitors (Local Legends)
            </h3>
            <div className="space-y-3">
                {stats.topVisitors.slice(0, 5).map((visitor, index) => {
                    const profile = profiles[visitor.userId]

                    let displayName = profile?.displayName;
                    if (!displayName) {
                        if (profile?.email) {
                            displayName = profile.email.split('@')[0]; // Use functionality before @
                        } else {
                            displayName = `User ${visitor.userId.slice(0, 4)}...`;
                        }
                    }

                    const photoURL = profile?.photoURL

                    return (
                        <div key={visitor.userId} className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    {/* Rank Badge */}
                                    <div className={`
                                        absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] z-10
                                        ${index === 0 ? 'bg-yellow-400 text-white ring-1 ring-white' :
                                            index === 1 ? 'bg-gray-400 text-white ring-1 ring-white' :
                                                index === 2 ? 'bg-orange-400 text-white ring-1 ring-white' : 'hidden'}
                                    `}>
                                        {index + 1}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border border-gray-100">
                                        {photoURL ? (
                                            <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <UserCircleIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-neutral-800">
                                        {displayName}
                                    </span>
                                    <span className="text-xs text-neutral/50">
                                        Last visited: {visitor.lastVisit.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-primary bg-primary/5 px-3 py-1 rounded-full">
                                {visitor.count} visits
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
