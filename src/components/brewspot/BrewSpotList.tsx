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
    viewMode?: 'grid' | 'list'
    userLocation?: { latitude: number, longitude: number } | null
}

export function BrewSpotList({ spots, isLoading, viewMode = 'grid', userLocation }: BrewSpotListProps) {
    const { brewSpots: fetchedSpots, loading: fetchLoading, error, refetch } = useBrewSpots()

    // Use passed props if available, otherwise fall back to internal fetch
    const brewSpots = spots ?? fetchedSpots
    const loading = isLoading ?? fetchLoading

    if (loading) {
        return (
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`${viewMode === 'grid' ? 'h-[350px]' : 'h-[200px]'} bg-neutral/5 rounded-xl animate-pulse`} />
                ))}
            </div>
        )
    }

    if (error && !spots) {
        return (
            <div className="text-center py-12 bg-red-50 rounded-xl">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => refetch()} variant="danger" className="border-red-200 text-white hover:bg-red-700">
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
        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {brewSpots.map((spot) => (
                <div key={spot.id} className={viewMode === 'list' ? 'flex flex-row h-full' : ''}>
                    {/* 
                      Note: BrewSpotCard needs to support list view styling internally or we wrap it.
                      For now, we'll keep it simple and just change the grid columns.
                      Refining Card for true list view would require modifying BrewSpotCard to accept a 'variant' prop.
                    */}
                    <BrewSpotCard brewSpot={spot} userLocation={userLocation} />
                </div>
            ))}
        </div>
    )
}
