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
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Search by name..."
                        className="pl-10 w-full"
                    />
                </div>
                <Button
                    variant={isFiltersOpen ? 'primary' : 'outline'}
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className="shrink-0"
                >
                    <FunnelIcon className="w-5 h-5 mr-2" />
                    Filters
                </Button>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        onClick={onClearFilters}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </Button>
                )}
            </div>

            {isFiltersOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Price Range</label>
                        <select
                            value={activeFilters.price}
                            onChange={(e) => onPriceChange(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">Any components</option>
                            <option value="cheap">Cheap ($)</option>
                            <option value="moderate">Moderate ($$)</option>
                            <option value="expensive">Expensive ($$$)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">City</label>
                        <select
                            value={activeFilters.city}
                            onChange={(e) => onCityChange(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">All Cities</option>
                            {availableCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Min Rating</label>
                        <select
                            value={activeFilters.rating}
                            onChange={(e) => onRatingChange(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">Any Rating</option>
                            <option value="4.5">4.5+ Excellent</option>
                            <option value="4">4.0+ Very Good</option>
                            <option value="3">3.0+ Good</option>
                        </select>
                    </div>


                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Tags</label>
                        <select
                            value={activeFilters.tag}
                            onChange={(e) => onTagChange(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">All Tags</option>
                            {availableTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Facilities</label>
                        <div className="flex flex-wrap gap-2">
                            {availableFacilities.map(facility => (
                                <button
                                    key={facility}
                                    onClick={() => onFacilitiesChange(facility)}
                                    className={`px-3 py-1 text-xs rounded-full border transition-all ${activeFilters.facilities.includes(facility)
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'
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
