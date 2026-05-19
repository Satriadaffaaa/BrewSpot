'use client'

import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { PRICE_OPTIONS } from '@/utils/price'
import { CustomSelect } from './FilterBar/CustomSelect'
import { FilterChip } from './FilterBar/FilterChip'
import { FilterModal } from './FilterBar/FilterModal'

interface FilterBarProps {
    onSearch: (query: string) => void
    onCityChange: (city: string) => void
    onPriceChange: (price: string) => void
    onFacilitiesChange: (facility: string) => void
    onRatingChange: (rating: string) => void
    onTagChange: (tag: string) => void
    onIsOpenNowChange: (isOpen: boolean) => void
    onSortChange: (sort: string) => void
    availableCities: string[]
    availableFacilities: string[]
    availableTags?: string[]
    activeFilters: {
        search: string
        city: string
        price: string
        rating: string
        facilities: string[]
        tags: string[]
        isOpenNow: boolean
        sort: string
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
    onIsOpenNowChange,
    onSortChange,
    availableCities,
    availableFacilities,
    availableTags = [],
    activeFilters,
    onClearFilters
}: FilterBarProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [localSearch, setLocalSearch] = useState(activeFilters.search)

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(localSearch)
        }, 300)
        return () => clearTimeout(timer)
    }, [localSearch, onSearch])

    useEffect(() => {
        setLocalSearch(activeFilters.search)
    }, [activeFilters.search])

    const hasActiveFilters = activeFilters.city || activeFilters.price || activeFilters.facilities.length > 0 || activeFilters.search || activeFilters.tags.length > 0 || activeFilters.isOpenNow

    const activeFilterCount = [
        activeFilters.city,
        activeFilters.price,
        activeFilters.rating,
        activeFilters.isOpenNow ? 'open' : '',
        ...activeFilters.facilities,
        ...activeFilters.tags
    ].filter(Boolean).length

    const sortOptions = [
        { value: 'default', label: 'Relevansi' },
        { value: 'nearest', label: 'Terdekat' },
        { value: 'rating', label: 'Rating Tertinggi' }
    ]

    return (
        <div className="sticky top-28 z-30 space-y-4">
            {/* Main Omni-Bar */}
            <div className="bg-surface/90 backdrop-blur-3xl p-3 md:p-4 rounded-[2.5rem] shadow-premium border border-white/40 flex flex-col md:flex-row items-stretch md:items-center gap-3 transition-all duration-500 hover:shadow-glass">
                
                {/* Search Input Section */}
                <div className="relative flex-[2.5] group min-w-0">
                    <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-light group-focus-within:text-accent transition-all duration-300" />
                    <input
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Cari tempat viral, hidden gem, atau destinasi favorit..."
                        className="pl-14 pr-6 w-full bg-secondary/20 border-transparent focus:bg-white focus:ring-0 outline-none transition-all h-14 rounded-full font-medium text-base text-primary placeholder:text-neutral-light/60"
                    />
                </div>

                {/* Desktop Separator */}
                <div className="hidden lg:block w-px h-8 bg-neutral/10 mx-2" />

                {/* City Select - Desktop Only Inline */}
                <div className="hidden lg:block flex-1 min-w-0">
                    <CustomSelect
                        label="Lokasi"
                        value={activeFilters.city}
                        onChange={onCityChange}
                        options={[{ value: '', label: 'Semua Kota' }, ...availableCities.map(c => ({ value: c, label: c }))]}
                        variant="inline"
                    />
                </div>

                {/* Desktop Separator */}
                <div className="hidden lg:block w-px h-8 bg-neutral/10 mx-2" />

                {/* Sort Select - Desktop Only Inline */}
                <div className="hidden lg:block flex-1 min-w-0">
                    <CustomSelect
                        label="Urutkan"
                        value={activeFilters.sort}
                        onChange={onSortChange}
                        options={sortOptions}
                        variant="inline"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        variant="primary"
                        onClick={() => setIsModalOpen(true)}
                        className="h-14 rounded-full px-6 font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-primary/20 relative"
                    >
                        <AdjustmentsHorizontalIcon className="w-5 h-5 md:mr-2" />
                        <span className="hidden md:inline">Semua Filter</span>
                        {activeFilterCount > 0 && (
                             <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-accent text-[10px] flex items-center justify-center rounded-full border-2 border-white px-1 shadow-sm">
                                {activeFilterCount}
                             </span>
                        )}
                    </Button>
                    
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="h-14 w-14 rounded-full bg-danger/5 text-danger hover:bg-danger hover:text-white transition-all duration-300 flex items-center justify-center shrink-0 border border-danger/10 shadow-sm"
                            title="Reset Filter"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Active Filter Chips */}
            {hasActiveFilters && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 px-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-light shrink-0 mr-2">Aktif:</span>
                    {activeFilters.city && <FilterChip label={activeFilters.city} onRemove={() => onCityChange('')} />}
                    {activeFilters.price && <FilterChip label={PRICE_OPTIONS.find(p => p.value === activeFilters.price)?.label || activeFilters.price} onRemove={() => onPriceChange('')} />}
                    {activeFilters.rating && <FilterChip label={`${activeFilters.rating}+ Rating`} onRemove={() => onRatingChange('')} />}
                    {activeFilters.isOpenNow && <FilterChip label="Buka Sekarang" onRemove={() => onIsOpenNowChange(false)} />}
                    {activeFilters.facilities.map(f => <FilterChip key={f} label={f} onRemove={() => onFacilitiesChange(f)} />)}
                    {activeFilters.tags.map(t => <FilterChip key={t} label={`#${t}`} onRemove={() => onTagChange(t)} />)}
                </div>
            )}

            <FilterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                activeFilters={activeFilters}
                availableCities={availableCities}
                availableFacilities={availableFacilities}
                availableTags={availableTags}
                onCityChange={onCityChange}
                onPriceChange={onPriceChange}
                onFacilitiesChange={onFacilitiesChange}
                onRatingChange={onRatingChange}
                onTagChange={onTagChange}
                onIsOpenNowChange={onIsOpenNowChange}
                onSortChange={onSortChange}
                onClearFilters={onClearFilters}
            />
        </div>
    )
}
