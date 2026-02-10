'use client'

import { useState, useEffect } from 'react'
import { BrewSpot } from '@/features/brewspot/types'
import { BrewSpotCard } from '@/components/brewspot/BrewSpotCard'
import { getTrendingBrewSpots } from '@/features/brewspot/api'

export function TrendingSection() {
    const [trendingSpots, setTrendingSpots] = useState<BrewSpot[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getTrendingBrewSpots(5).then(data => {
            setTrendingSpots(data)
            setLoading(false)
        })
    }, [])

    if (loading) return <div className="h-48 bg-neutral/5 animate-pulse rounded-xl" />

    if (trendingSpots.length === 0) return null

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-2xl font-heading font-bold text-neutral-900">Trending Now</h2>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {trendingSpots.map(spot => (
                    <div key={spot.id} className="min-w-[300px] md:min-w-[320px] snap-center h-full">
                        <BrewSpotCard brewSpot={spot} />
                    </div>
                ))}
            </div>
        </div>
    )
}
