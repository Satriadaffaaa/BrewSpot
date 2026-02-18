'use client'

import { useState, useEffect } from 'react'
import { useBrewSpots } from '@/features/brewspot/hooks'
import { BrewSpotList } from '@/components/brewspot/BrewSpotList'
import { FilterBar } from '@/components/common/FilterBar'
import { BrewSpot } from '@/features/brewspot/types'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/common/Button'
import { PlusIcon } from '@heroicons/react/24/outline'
import { BrewSpotCard } from '@/components/brewspot/BrewSpotCard'
import { TrendingSection } from '@/components/brewspot/TrendingSection'

const BrewSpotMap = dynamic(() => import('@/components/brewspot/BrewSpotMap'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-neutral/10 animate-pulse rounded-xl flex items-center justify-center text-neutral/40">Loading Map...</div>
})

export function ExploreView() {
    const { brewSpots, loading } = useBrewSpots()
    const [filteredSpots, setFilteredSpots] = useState<BrewSpot[]>([])
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Filter States
    const [searchQuery, setSearchQuery] = useState('')
    const [cityFilter, setCityFilter] = useState('')
    const [priceFilter, setPriceFilter] = useState('')
    const [ratingFilter, setRatingFilter] = useState('')
    const [facilityFilters, setFacilityFilters] = useState<string[]>([])
    const [tagFilter, setTagFilter] = useState('')

    // Derived Lists
    const availableCities = Array.from(new Set(brewSpots.map(spot => spot.city))).sort()
    const availableFacilities = Array.from(
        new Set(brewSpots.flatMap(spot => spot.facilities))
    ).sort()

    // Aggregate unique tags from manual 'tags' and 'aiMeta.tags'
    const availableTags = Array.from(
        new Set(brewSpots.flatMap(spot => {
            const manualTags = spot.tags || [];
            const aiTags = spot.aiMeta?.tags || [];
            return [...manualTags, ...aiTags];
        }))
    ).sort()

    useEffect(() => {
        let result = brewSpots

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(spot =>
                spot.name.toLowerCase().includes(query) ||
                spot.address.toLowerCase().includes(query)
            )
        }

        if (cityFilter) {
            result = result.filter(spot => spot.city === cityFilter)
        }

        if (priceFilter) {
            result = result.filter(spot => spot.price_range === priceFilter)
        }

        if (ratingFilter) {
            const minRating = parseFloat(ratingFilter)
            result = result.filter(spot => (spot.rating || 0) >= minRating)
        }

        if (facilityFilters.length > 0) {
            result = result.filter(spot =>
                facilityFilters.every(facility => spot.facilities.includes(facility))
            )
        }

        if (tagFilter) {
            result = result.filter(spot => {
                const spotTags = [...(spot.tags || []), ...(spot.aiMeta?.tags || [])];
                return spotTags.some(t => t === tagFilter);
            });
        }

        setFilteredSpots(result)
    }, [brewSpots, searchQuery, cityFilter, priceFilter, ratingFilter, facilityFilters, tagFilter])

    // Phase 8: Search Analytics (2s Debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 3) {
                import('@/features/analytics/actions').then(({ logSearchAction }) => {
                    logSearchAction(searchQuery, cityFilter);
                });
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [searchQuery, cityFilter]);

    const handleFacilityChange = (facility: string) => {
        setFacilityFilters(prev =>
            prev.includes(facility)
                ? prev.filter(f => f !== facility)
                : [...prev, facility]
        )
    }

    const clearFilters = () => {
        setSearchQuery('')
        setCityFilter('')
        setPriceFilter('')
        setRatingFilter('')
        setFacilityFilters([])
        setTagFilter('')
    }

    // Calculate Map Center logic
    const getMapCenter = (): [number, number] | undefined => {
        if (filteredSpots.length === 0) return undefined
        // If 1 spot, center on it
        if (filteredSpots.length === 1) return [filteredSpots[0].latitude, filteredSpots[0].longitude]

        // If multiple, average them (simple centroid)
        const totalLat = filteredSpots.reduce((sum, spot) => sum + spot.latitude, 0)
        const totalLng = filteredSpots.reduce((sum, spot) => sum + spot.longitude, 0)
        return [totalLat / filteredSpots.length, totalLng / filteredSpots.length]
    }

    const mapCenter = getMapCenter()

    return (
        <div className="space-y-8">
            <TrendingSection />

            <FilterBar
                onSearch={setSearchQuery}
                onCityChange={setCityFilter}
                onPriceChange={setPriceFilter}
                onFacilitiesChange={handleFacilityChange}
                onRatingChange={setRatingFilter}
                onTagChange={setTagFilter}
                availableCities={availableCities}
                availableFacilities={availableFacilities}
                availableTags={availableTags}
                activeFilters={{
                    search: searchQuery,
                    city: cityFilter,
                    price: priceFilter,
                    rating: ratingFilter,
                    facilities: facilityFilters,
                    tag: tagFilter
                }}
                onClearFilters={clearFilters}
            />

            <div className="w-full h-[400px] z-0 relative">
                <BrewSpotMap
                    spots={filteredSpots}
                    interactive={true}
                    center={mapCenter}
                    zoom={filteredSpots.length === 1 ? 15 : undefined}
                />
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-heading font-bold text-primary">
                        {loading ? 'Loading...' : `${filteredSpots.length} BrewSpots Found`}
                    </h2>

                    <div className="flex gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </div>
                        <Link href="/add-brewspot">
                            <Button>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Add BrewSpot
                            </Button>
                        </Link>
                    </div>
                </div>

                <BrewSpotList spots={filteredSpots} isLoading={loading} viewMode={viewMode} />
            </div>
        </div>
    )
}
