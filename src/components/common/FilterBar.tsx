'use client'

import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'

interface FilterBarProps {
    onSearch: (query: string) => void
    onCityChange: (city: string) => void
    onPriceChange: (price: string) => void
    onFacilitiesChange: (facility: string) => void
    onRatingChange: (rating: string) => void
    onTagChange: (tag: string) => void
    availableCities: string[]
    availableFacilities: string[]
    availableTags?: string[]
    activeFilters: {
        search: string
        city: string
        price: string
        rating: string
        facilities: string[]
        tag?: string
    }
    onClearFilters: () => void
}

export function FilterBar({
    onSearch,
    onCityChange,
    onPriceChange,
    onFacilitiesChange,
    onRatingChange,
    onTagChange,
    availableCities,
    availableFacilities,
    availableTags = [],
    activeFilters,
    onClearFilters
}: FilterBarProps) {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)

    // Debounce search
    const [localSearch, setLocalSearch] = useState(activeFilters.search)

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(localSearch)
        }, 300)
        return () => clearTimeout(timer)
    }, [localSearch, onSearch])

    // Sync local search with prop if it changes externally (e.g. clear)
    useEffect(() => {
        setLocalSearch(activeFilters.search)
    }, [activeFilters.search])

    const hasActiveFilters = activeFilters.city || activeFilters.price || activeFilters.facilities.length > 0 || activeFilters.search || activeFilters.tag

    return (
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-soft border border-primary/5 space-y-4 sticky top-24 z-30 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-light group-focus-within:text-primary transition-colors" />
                    <Input
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Search for coffee spots..."
                        className="pl-12 w-full bg-secondary/10 border-transparent focus:bg-white focus:border-primary/20 transition-all h-12 rounded-xl"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={isFiltersOpen ? 'primary' : 'outline'}
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={`shrink-0 h-12 rounded-xl px-6 ${isFiltersOpen ? 'shadow-lg shadow-primary/20' : ''}`}
                    >
                        <FunnelIcon className="w-5 h-5 mr-2" />
                        Filters
                    </Button>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={onClearFilters}
                            className="h-12 w-12 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 p-0 flex items-center justify-center shrink-0"
                            title="Clear Filters"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </Button>
                    )}
                </div>
            </div>

            {isFiltersOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-dashed border-gray-200 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-neutral font-heading">Price Range</label>
                        <select
                            value={activeFilters.price}
                            onChange={(e) => onPriceChange(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:border-primary/50"
                        >
                            <option value="">Any Price</option>
                            <option value="cheap">Cheap ($)</option>
                            <option value="moderate">Moderate ($$)</option>
                            <option value="expensive">Expensive ($$$)</option>
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-neutral font-heading">City</label>
                        <select
                            value={activeFilters.city}
                            onChange={(e) => onCityChange(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:border-primary/50"
                        >
                            <option value="">All Cities</option>
                            {availableCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-neutral font-heading">Min Rating</label>
                        <select
                            value={activeFilters.rating}
                            onChange={(e) => onRatingChange(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:border-primary/50"
                        >
                            <option value="">Any Rating</option>
                            <option value="4.5">4.5+ Excellent</option>
                            <option value="4">4.0+ Very Good</option>
                            <option value="3">3.0+ Good</option>
                        </select>
                    </div>


                    <div className="space-y-3">
                        <label className="text-sm font-bold text-neutral font-heading">Tags</label>
                        <select
                            value={activeFilters.tag}
                            onChange={(e) => onTagChange(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:border-primary/50"
                        >
                            <option value="">All Tags</option>
                            {availableTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-3 md:col-span-2 lg:col-span-4">
                        <label className="text-sm font-bold text-neutral font-heading">Facilities</label>
                        <div className="flex flex-wrap gap-2">
                            {availableFacilities.map(facility => (
                                <button
                                    key={facility}
                                    onClick={() => onFacilitiesChange(facility)}
                                    className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 font-medium ${activeFilters.facilities.includes(facility)
                                        ? 'bg-primary text-white border-primary shadow-md transform scale-105'
                                        : 'bg-white text-neutral-light border-gray-200 hover:border-primary/50 hover:text-primary'
                                        }`}
                                >
                                    {facility}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
