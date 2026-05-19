'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/common/Button'
import { CustomSelect } from './CustomSelect'
import { PRICE_OPTIONS } from '@/utils/price'

interface FilterModalProps {
    isOpen: boolean
    onClose: () => void
    activeFilters: {
        city: string
        price: string
        rating: string
        facilities: string[]
        tags: string[]
        isOpenNow: boolean
        sort: string
    }
    availableCities: string[]
    availableFacilities: string[]
    availableTags: string[]
    onCityChange: (city: string) => void
    onPriceChange: (price: string) => void
    onFacilitiesChange: (facility: string) => void
    onRatingChange: (rating: string) => void
    onTagChange: (tag: string) => void
    onIsOpenNowChange: (isOpen: boolean) => void
    onSortChange: (sort: string) => void
    onClearFilters: () => void
}

export function FilterModal({
    isOpen,
    onClose,
    activeFilters,
    availableCities,
    availableFacilities,
    availableTags,
    onCityChange,
    onPriceChange,
    onFacilitiesChange,
    onRatingChange,
    onTagChange,
    onIsOpenNowChange,
    onSortChange,
    onClearFilters
}: FilterModalProps) {
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
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
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
                                    <button onClick={onClose} className="p-3 rounded-full bg-secondary/50 text-neutral-light hover:bg-neutral/10 transition-all">
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
                                        <button onClick={onClose} className="flex-1 md:flex-none text-[10px] font-black uppercase tracking-widest text-neutral-light hover:text-primary transition-colors px-6">Tutup</button>
                                        <Button onClick={onClose} className="flex-1 md:flex-none h-14 rounded-full px-10 text-[10px] shadow-premium">Terapkan Filter</Button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
