'use client'

import { Input } from '@/components/common/Input'
import { Button } from '@/components/common/Button'
import { MagnifyingGlassIcon, XMarkIcon, AdjustmentsHorizontalIcon, ChevronDownIcon, FunnelIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useState, useEffect, Fragment } from 'react'
import { PRICE_OPTIONS } from '@/utils/price'
import { Dialog, Transition, Listbox } from '@headlessui/react'
import { cn } from '@/lib/utils/cn'

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

    const ratingOptions = [
        { value: '', label: 'Semua Rating' },
        { value: '4.5', label: '4.5+ Luar Biasa' },
        { value: '4', label: '4.0+ Sangat Baik' },
        { value: '3', label: '3.0+ Baik' }
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

            {/* Filter Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-[100]" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95 translate-y-8" enterTo="opacity-100 scale-100 translate-y-0" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100 translate-y-0" leaveTo="opacity-0 scale-95 translate-y-8">
                                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-[3rem] bg-surface p-8 md:p-12 text-left align-middle shadow-premium border border-white/50 transition-all">
                                    <div className="flex items-center justify-between mb-10">
                                        <div>
                                            <Dialog.Title as="h3" className="text-2xl md:text-3xl font-black text-primary font-heading tracking-tight">
                                                Filter <span className="text-accent italic">Pencarian</span>
                                            </Dialog.Title>
                                            <p className="text-neutral-light text-xs font-bold uppercase tracking-widest mt-1">Personalisasikan petualangan kopimu</p>
                                        </div>
                                        <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-full bg-secondary/50 text-neutral-light hover:bg-neutral/10 transition-all">
                                            <XMarkIcon className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12 max-h-[60vh] overflow-y-auto pr-4 no-scrollbar">
                                        
                                        <CustomSelect
                                            label="Lokasi"
                                            value={activeFilters.city}
                                            onChange={onCityChange}
                                            options={[{ value: '', label: 'Semua Kota' }, ...availableCities.map(c => ({ value: c, label: c }))]}
                                        />

                                        <CustomSelect
                                            label="Urutkan"
                                            value={activeFilters.sort}
                                            onChange={onSortChange}
                                            options={sortOptions}
                                        />

                                        <CustomSelect
                                            label="Rentang Harga"
                                            value={activeFilters.price}
                                            onChange={onPriceChange}
                                            options={[{ value: '', label: 'Semua Harga' }, ...PRICE_OPTIONS]}
                                        />

                                        <CustomSelect
                                            label="Rating Minimum"
                                            value={activeFilters.rating}
                                            onChange={onRatingChange}
                                            options={ratingOptions}
                                        />

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-neutral-light uppercase tracking-[0.3em]">Ketersediaan</label>
                                            <label className="flex items-center gap-4 cursor-pointer group mt-2">
                                                <div className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${activeFilters.isOpenNow ? 'bg-accent shadow-lg shadow-accent/20' : 'bg-neutral/20'}`} onClick={() => onIsOpenNowChange(!activeFilters.isOpenNow)}>
                                                    <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${activeFilters.isOpenNow ? 'translate-x-6' : 'translate-x-0'}`} />
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeFilters.isOpenNow ? 'text-accent' : 'text-neutral-light'}`}>Buka Sekarang</span>
                                            </label>
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3 space-y-6 pt-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-neutral-light uppercase tracking-[0.3em]">Kategori & Suasana</label>
                                                <span className="text-[10px] font-bold text-accent px-3 py-1 bg-accent/10 rounded-full">Pilihan Kurator</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {availableTags.map(tag => (
                                                    <button key={tag} onClick={() => onTagChange(tag)} className={`px-5 py-2.5 text-[10px] rounded-2xl border font-bold uppercase tracking-wider transition-all duration-300 ${activeFilters.tags.includes(tag) ? 'bg-primary text-white border-primary shadow-premium scale-105' : 'bg-white text-neutral-light border-neutral/10 hover:border-accent/30 hover:text-accent shadow-sm'}`}>#{tag}</button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 lg:col-span-3 space-y-6">
                                            <label className="text-[10px] font-black text-neutral-light uppercase tracking-[0.3em]">Fasilitas Unggulan</label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableFacilities.map(facility => (
                                                    <button key={facility} onClick={() => onFacilitiesChange(facility)} className={`px-6 py-3 text-[10px] rounded-2xl border font-bold uppercase tracking-wider transition-all duration-300 ${activeFilters.facilities.includes(facility) ? 'bg-accent text-white border-accent shadow-premium scale-105' : 'bg-white text-neutral-light border-neutral/10 hover:border-accent/30 hover:text-accent shadow-sm'}`}>{facility}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 pt-8 border-t border-neutral/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                        <button onClick={onClearFilters} className="text-[10px] font-black uppercase tracking-widest text-danger hover:underline transition-all flex items-center gap-2"><XMarkIcon className="w-4 h-4" /> Reset Semua Filter</button>
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <button onClick={() => setIsModalOpen(false)} className="flex-1 md:flex-none text-[10px] font-black uppercase tracking-widest text-neutral-light hover:text-primary transition-colors px-6">Tutup</button>
                                            <Button onClick={() => setIsModalOpen(false)} className="flex-1 md:flex-none h-14 rounded-full px-10 text-[10px] shadow-premium">Terapkan Filter</Button>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    )
}

interface CustomSelectProps {
    label: string
    value: string
    onChange: (val: string) => void
    options: { value: string; label: string }[]
    variant?: 'default' | 'inline'
}

function CustomSelect({ label, value, onChange, options, variant = 'default' }: CustomSelectProps) {
    const selectedOption = options.find(o => o.value === value) || options[0]

    return (
        <Listbox value={value} onChange={onChange}>
            <div className="relative space-y-1">
                {variant === 'default' && (
                    <Listbox.Label className="text-[10px] font-black text-neutral-light uppercase tracking-[0.3em] block mb-2">
                        {label}
                    </Listbox.Label>
                )}
                
                <Listbox.Button className={cn(
                    "relative w-full text-left transition-all duration-300",
                    variant === 'inline' 
                        ? "px-2 py-1 group cursor-pointer" 
                        : "h-14 px-5 rounded-2xl border border-neutral/10 bg-secondary/20 hover:border-accent/30 hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20"
                )}>
                    {variant === 'inline' ? (
                        <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-light leading-none mb-1 group-hover:text-accent transition-colors">
                                {label}
                            </span>
                            <span className="text-sm font-bold text-primary truncate pr-6">
                                {selectedOption.label}
                            </span>
                            <ChevronDownIcon className="absolute right-2 bottom-1 w-3.5 h-3.5 text-neutral-light group-hover:text-accent transition-colors" />
                        </div>
                    ) : (
                        <>
                            <span className="block truncate text-sm font-bold text-primary">
                                {selectedOption.label}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                                <ChevronDownIcon className="h-4 w-4 text-neutral-light" aria-hidden="true" />
                            </span>
                        </>
                    )}
                </Listbox.Button>

                <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <Listbox.Options className="absolute z-[110] mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white p-2 text-base shadow-glass ring-1 ring-black/5 focus:outline-none sm:text-sm no-scrollbar">
                        {options.map((option, idx) => (
                            <Listbox.Option
                                key={idx}
                                className={({ active, selected }) => cn(
                                    "relative cursor-pointer select-none py-3 pl-10 pr-4 rounded-xl transition-all duration-200",
                                    active ? "bg-accent/10 text-accent" : "text-primary",
                                    selected ? "bg-accent/5" : ""
                                )}
                                value={option.value}
                            >
                                {({ selected, active }) => (
                                    <>
                                        <span className={cn(
                                            "block truncate text-xs",
                                            selected ? "font-black" : "font-medium",
                                            active ? "translate-x-1" : ""
                                        )}>
                                            {option.label}
                                        </span>
                                        {selected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-accent">
                                                <CheckIcon className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                                            </span>
                                        )}
                                    </>
                                )}
                            </Listbox.Option>
                        ))}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full shrink-0 group hover:bg-accent hover:border-accent transition-all duration-300">
            <span className="text-[10px] font-bold text-accent group-hover:text-white transition-colors uppercase tracking-tight">{label}</span>
            <button onClick={onRemove} className="text-accent group-hover:text-white transition-colors">
                <XMarkIcon className="w-3 h-3 stroke-[3]" />
            </button>
        </div>
    )
}
