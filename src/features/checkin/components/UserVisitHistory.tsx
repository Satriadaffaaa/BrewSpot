'use client'

import { useEffect, useState } from 'react'
import { getUserVisitHistory } from '../service'
import { UserVisitStats } from '../types'
import { getBrewSpotById } from '@/features/brewspot/api'
import { Card } from '@/components/common/Card'
import { MapPinIcon, HeartIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface UserVisitHistoryProps {
    userId: string
}

export const UserVisitHistory = ({ userId }: UserVisitHistoryProps) => {
    const [stats, setStats] = useState<UserVisitStats | null>(null)
    const [spotNames, setSpotNames] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStatsAndNames = async () => {
            try {
                const data = await getUserVisitHistory(userId)
                setStats(data)

                if (data && data.topSpots.length > 0) {
                    const spotIds = data.topSpots.map(s => s.brewSpotId)
                    const namesMap: Record<string, string> = {}

                    await Promise.all(spotIds.map(async (id) => {
                        try {
                            const spot = await getBrewSpotById(id)
                            if (spot) {
                                namesMap[id] = spot.name
                            }
                        } catch (e) {
                            console.warn(`Failed to fetch name for spot ${id}`, e)
                        }
                    }))
                    setSpotNames(namesMap)
                }
            } catch (err) {
                console.error("Failed to fetch users history", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStatsAndNames()
    }, [userId])

    if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl"></div>

    if (!stats || stats.topSpots.length === 0) {
        return (
            <Card className="p-6 text-center text-neutral/60">
                <MapPinIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No check-ins yet. Go explore!</p>
            </Card>
        )
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-red-500" />
                Favorite Spots
            </h3>
            <div className="space-y-3">
                {stats.topSpots.slice(0, 5).map((spot, index) => (
                    <Link href={`/brewspot/${spot.brewSpotId}`} key={spot.brewSpotId} className="block">
                        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <MapPinIcon className="w-5 h-5 text-neutral/40 group-hover:text-primary transition-colors" />
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-neutral-800 group-hover:text-primary transition-colors">
                                        {spotNames[spot.brewSpotId] || `BrewSpot ${spot.brewSpotId.slice(0, 6)}...`}
                                    </span>
                                    <span className="text-xs text-neutral/50">
                                        Last visited: {spot.lastVisit.toDate().toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm font-bold text-neutral/70">
                                {spot.count} x
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </Card>
    )
}
