'use client'

import { useState, useEffect } from 'react'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/common/Card'
import { LeaderboardTable } from '@/features/leaderboard/components/LeaderboardTable'
import { getGlobalLeaderboard } from '@/features/checkin/service'
import { getLeaderboard } from '@/features/gamification/api'
import { UserProfile } from '@/features/gamification/types'
import { TrophyIcon, StarIcon, MapIcon } from '@heroicons/react/24/outline'

type LeaderboardType = 'explorers' | 'contributors'

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<LeaderboardType>('explorers')
    const [users, setUsers] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                let data: UserProfile[] = []
                if (activeTab === 'explorers') {
                    // Start of workaround: Casting unknown[] -> any -> UserProfile[] because service returns DocumentData
                    const rawData = await getGlobalLeaderboard(50)
                    data = rawData as unknown as UserProfile[]
                } else {
                    data = await getLeaderboard()
                }
                setUsers(data)
            } catch (error) {
                console.error("Failed to fetch leaderboard", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [activeTab])

    return (
        <Container className="py-12 max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-heading font-bold text-neutral-900 mb-2">
                    Community Leaderboard
                </h1>
                <p className="text-neutral/60">
                    Recognizing our top explorers and most helpful contributors.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-8">
                <div className="bg-neutral/5 p-1 rounded-xl inline-flex">
                    <button
                        onClick={() => setActiveTab('explorers')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'explorers'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-neutral/60 hover:text-neutral-800'
                            }`}
                    >
                        <MapIcon className="w-5 h-5" />
                        Top Explorers
                    </button>
                    <button
                        onClick={() => setActiveTab('contributors')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'contributors'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-neutral/60 hover:text-neutral-800'
                            }`}
                    >
                        <StarIcon className="w-5 h-5" />
                        Top Contributors
                    </button>
                </div>
            </div>

            <Card className="p-6 md:p-8 min-h-[500px]">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-neutral/10">
                    <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
                        <TrophyIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">
                            {activeTab === 'explorers' ? 'Most Check-ins' : 'Highest XP'}
                        </h2>
                        <p className="text-xs text-neutral/50">
                            Updates in real-time
                        </p>
                    </div>
                </div>

                <LeaderboardTable
                    users={users}
                    type={activeTab}
                    loading={loading}
                />
            </Card>
        </Container>
    )
}
