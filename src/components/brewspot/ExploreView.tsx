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
import { PopularViewsSection } from '@/components/brewspot/PopularViewsSection'
import { calculateDistance } from '@/lib/locationUtils'
import { useUserLocation } from '@/hooks/useUserLocation'
import { CategoryPills } from '@/components/spots/CategoryPills'
import { SpotCategory } from '@/features/brewspot/types'

const BrewSpotMap = dynamic(() => import('@/components/brewspot/BrewSpotMap'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-neutral/10 animate-pulse rounded-xl flex items-center justify-center text-neutral/40">Memuat Peta...</div>
})

export function ExploreView() {
    const { brewSpots, loading } = useBrewSpots()
    const { latitude, longitude } = useUserLocation()
    const userLocation = latitude && longitude ? { latitude, longitude } : null

    const [filteredSpots, setFilteredSpots] = useState<BrewSpot[]>([])
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    // Filter States
    const [searchQuery, setSearchQuery] = useState('')
    const [cityFilter, setCityFilter] = useState('')
    const [priceFilter, setPriceFilter] = useState('')
    const [ratingFilter, setRatingFilter] = useState('')
    const [facilityFilters, setFacilityFilters] = useState<string[]>([])
    const [tagFilters, setTagFilters] = useState<string[]>([])
    const [isOpenNowFilter, setIsOpenNowFilter] = useState(false)
    const [categoryFilter, setCategoryFilter] = useState<SpotCategory | 'all'>('all')
    const [sortOption, setSortOption] = useState('default')

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

        // ... existing filters

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

        if (categoryFilter !== 'all') {
            result = result.filter(spot => spot.category === categoryFilter)
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

        if (tagFilters.length > 0) {
            result = result.filter(spot => {
                const spotTags = [...(spot.tags || []), ...(spot.aiMeta?.tags || [])];
                return tagFilters.some(tag => spotTags.includes(tag));
            });
        }

        if (isOpenNowFilter) {
            const now = new Date();
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const currentDay = days[now.getDay()];
            const currentTime = now.getHours() * 60 + now.getMinutes();

            result = result.filter(spot => {
                if (!spot.weekly_hours) return false;
                // @ts-ignore - weekly_hours is typed but indexing might be tricky
                const schedule = spot.weekly_hours[currentDay];

                if (!schedule || !schedule.isOpen) return false;

                const [openH, openM] = schedule.openTime.split(':').map(Number);
                const [closeH, closeM] = schedule.closeTime.split(':').map(Number);
                const openTime = openH * 60 + openM;
                const closeTime = closeH * 60 + closeM;

                return currentTime >= openTime && currentTime < closeTime;
            });
        }

        // Sorting Logic
        if (sortOption === 'nearest' && userLocation) {
            result = [...result].sort((a, b) => {
                const distA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
                const distB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
                return distA - distB;
            });
        } else if (sortOption === 'rating') {
            result = [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setFilteredSpots(result)
    }, [brewSpots, searchQuery, cityFilter, categoryFilter, priceFilter, ratingFilter, facilityFilters, tagFilters, isOpenNowFilter, sortOption, userLocation])

    // ... analytics effect

    const handleFacilityChange = (facility: string) => {
        setFacilityFilters(prev =>
            prev.includes(facility)
                ? prev.filter(f => f !== facility)
                : [...prev, facility]
        )
    }

    const handleTagChange = (tag: string) => {
        setTagFilters(prev =>
            prev.includes(tag)
                ? prev.filter(t => t !== tag)
                : [...prev, tag]
        )
    }

    const clearFilters = () => {
        setSearchQuery('')
        setCityFilter('')
        setPriceFilter('')
        setRatingFilter('')
        setFacilityFilters([])
        setTagFilters([])
        setIsOpenNowFilter(false)
        setCategoryFilter('all')
        setSortOption('default')
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
            <PopularViewsSection />

            <div className="pt-2">
                <CategoryPills
                    activeCategory={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                />
            </div>

            <FilterBar
                onSearch={setSearchQuery}
                onCityChange={setCityFilter}
                onPriceChange={setPriceFilter}
                onFacilitiesChange={handleFacilityChange}
                onRatingChange={setRatingFilter}
                onTagChange={handleTagChange}
                onIsOpenNowChange={setIsOpenNowFilter}
                onSortChange={setSortOption}
                availableCities={availableCities}
                availableFacilities={availableFacilities}
                availableTags={availableTags}
                activeFilters={{
                    search: searchQuery,
                    city: cityFilter,
                    price: priceFilter,
                    rating: ratingFilter,
                    facilities: facilityFilters,
                    tags: tagFilters,
                    isOpenNow: isOpenNowFilter,
                    sort: sortOption
                }}
                onClearFilters={clearFilters}
            />

            <div className="w-full h-[500px] z-0 relative rounded-[3rem] overflow-hidden shadow-premium border border-white/20 group">
                <BrewSpotMap
                    spots={filteredSpots}
                    interactive={true}
                    center={mapCenter}
                    zoom={filteredSpots.length === 1 ? 15 : undefined}
                />
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-[3rem]" />
            </div>

            <div className="pt-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-1">
                        <h2 className="text-3xl md:text-5xl font-black font-heading text-primary tracking-tighter">
                            {loading ? 'Discovering...' : (
                                <>
                                    {filteredSpots.length} <span className="text-accent italic">Tempat</span> Ditemukan
                                </>
                            )}
                        </h2>
                        <p className="text-neutral-light font-medium uppercase tracking-[0.2em] text-[10px]">Spot viral & hidden gem pilihan komunitas</p>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-surface shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-surface shadow-sm text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </div>
                        <Link href="/add-spot">
                            <Button>
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Tambah Lokasi
                            </Button>
                        </Link>
                    </div>
                </div>
                <BrewSpotList
                    spots={filteredSpots}
                    isLoading={loading}
                    viewMode={viewMode}
                    userLocation={userLocation}
                />
            </div>
        </div>
    )
}

