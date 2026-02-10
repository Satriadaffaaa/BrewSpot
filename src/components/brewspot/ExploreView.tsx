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
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>
})

export function ExploreView() {
    const { brewSpots, loading } = useBrewSpots()
    const [filteredSpots, setFilteredSpots] = useState<BrewSpot[]>([])

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
                    <Link href="/add-brewspot">
                        <Button>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Add BrewSpot
                        </Button>
                    </Link>
                </div>

                {/* We need to update BrewSpotList to accept spots as props or filter internally */}
                <BrewSpotList spots={filteredSpots} isLoading={loading} />
            </div>
        </div>
    )
}
