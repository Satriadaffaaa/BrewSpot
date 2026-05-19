'use client'

import { useState, useEffect } from 'react'
import { BrewSpot } from '@/features/brewspot/types'
import { BrewSpotCard } from '@/components/brewspot/BrewSpotCard'
import { getTrendingBrewSpots } from '@/features/brewspot/api'

export function PopularViewsSection() {
    const [popularSpots, setPopularSpots] = useState<BrewSpot[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getTrendingBrewSpots(5, 'views').then(data => {
            setPopularSpots(data)
            setLoading(false)
        })
    }, [])

    if (loading) return <div className="h-48 bg-neutral/5 animate-pulse rounded-xl" />

    if (popularSpots.length === 0) return null

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">👁️</span>
                    <h2 className="text-2xl font-heading font-black text-primary tracking-tight">Paling Banyak Dilihat</h2>
                </div>
                <p className="text-sm text-neutral-light ml-9">Spot yang lagi jadi pusat perhatian</p>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                {popularSpots.map(spot => (
                    <div key={spot.id} className="min-w-[300px] md:min-w-[320px] snap-center h-full">
                        <BrewSpotCard brewSpot={spot} />
                    </div>
                ))}
            </div>
        </div>
    )
}
