'use client'

import { useBrewSpots } from '@/features/brewspot/hooks'
import { BrewSpotCard } from './BrewSpotCard'
import { Button } from '@/components/common/Button'
import { PlusIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

import { BrewSpot } from '@/features/brewspot/types'

interface BrewSpotListProps {
    spots?: BrewSpot[]
    isLoading?: boolean
}

export function BrewSpotList({ spots, isLoading }: BrewSpotListProps) {
    const { brewSpots: fetchedSpots, loading: fetchLoading, error, refetch } = useBrewSpots()

    // Use passed props if available, otherwise fall back to internal fetch
    const brewSpots = spots ?? fetchedSpots
    const loading = isLoading ?? fetchLoading

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-[350px] bg-gray-100 rounded-xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (error && !spots) {
        return (
            <div className="text-center py-12 bg-red-50 rounded-xl">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => refetch()} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                    Try Again
                </Button>
            </div>
        )
    }

    if (brewSpots.length === 0) {
        return (
            <div className="text-center py-16 px-4 bg-secondary/30 rounded-2xl border border-secondary dashed">
                <span className="text-4xl mb-4 block">🧐</span>
                <h3 className="text-xl font-heading font-bold text-neutral mb-2">No BrewSpots Found</h3>
                <p className="text-neutral/70 max-w-sm mx-auto mb-6">
                    Looks like there are no coffee shops matching your criteria. Be the first one to share a hidden gem!
                </p>
                <Link href="/add-brewspot">
                    <Button>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add a BrewSpot
                    </Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brewSpots.map((spot) => (
                <BrewSpotCard key={spot.id} brewSpot={spot} />
            ))}
        </div>
    )
}
