'use client'

import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { PRICE_OPTIONS } from '@/utils/price'
import { CATEGORIZED_FACILITIES } from '@/features/brewspot/constants'
import { BusinessHoursInput } from './BusinessHoursInput'
import { WeeklyHours } from '@/features/brewspot/types'

interface DetailsStepProps {
    name: string
    description: string
    priceRange: string
    facilities: string[]
    weeklyHours?: WeeklyHours
    onNameChange: (name: string) => void
    onDescriptionChange: (desc: string) => void
    onPriceRangeChange: (price: 'cheap' | 'moderate' | 'expensive') => void
    onFacilitiesChange: (facilities: string[]) => void
    onWeeklyHoursChange: (hours: WeeklyHours) => void
    showBusinessHours?: boolean
}

export function DetailsStep({
    name,
    description,
    priceRange,
    facilities,
    weeklyHours,
    onNameChange,
    onDescriptionChange,
    onPriceRangeChange,
    onFacilitiesChange,
    onWeeklyHoursChange,
    showBusinessHours = false
}: DetailsStepProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                </div>
                <h2 className="text-xl font-heading font-bold text-primary">
                    Langkah 3: Detail & Klasifikasi
                </h2>
            </div>
            <div className="space-y-6">
                <Input
                    label="Nama Tempat / Lokasi"
                    value={name}
                    onChange={e => onNameChange(e.target.value)}
                    required
                    placeholder="misal: Kopi Kenangan Mantan"
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral">Apa yang Spesial dari Tempat Ini? (Opsional)</label>
                    <textarea
                        className="w-full min-h-[120px] rounded-xl border border-gray-300 bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-gray-400"
                        placeholder="Ceritakan suasana, menu jagoan, atau alasan kenapa orang harus ke sini..."
                        value={description}
                        onChange={e => onDescriptionChange(e.target.value)}
                    />
                </div>

                {showBusinessHours && (
                    <div className="pt-4 border-t border-border">
                        <BusinessHoursInput 
                            value={weeklyHours}
                            onChange={onWeeklyHoursChange}
                        />
                    </div>
                )}

                <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-neutral">Rentang Harga</label>
                        <span className="text-[10px] bg-neutral-100 text-neutral/60 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Estimasi per orang</span>
                    </div>
                    
                    <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-border shadow-inner">
                        {PRICE_OPTIONS.map((option, idx) => {
                            const isSelected = priceRange === option.value;
                            const symbols = ["$", "$$", "$$$"];
                            
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onPriceRangeChange(option.value as 'cheap' | 'moderate' | 'expensive')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 ${isSelected
                                        ? 'bg-surface text-primary shadow-sm border border-border'
                                        : 'text-neutral-500 hover:text-primary hover:bg-surface/50'
                                        }`}
                                >
                                    <span className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-primary/40'}`}>
                                        {symbols[idx]}
                                    </span>
                                    <div className="flex flex-col items-start">
                                        <span className="text-xs font-bold leading-none">
                                            {option.label.split(' (')[0]}
                                        </span>
                                        <span className="text-[9px] opacity-60 leading-tight">
                                            {option.label.match(/\((.*?)\)/)?.[1] || ''}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                    <label className="text-sm font-bold text-neutral flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span>Pilih Fasilitas yang Tersedia</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(CATEGORIZED_FACILITIES).map(([group, groupFacilities]) => (
                            <div key={group} className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-border">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral/40 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-primary/40 rounded-full" />
                                    {group}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {groupFacilities.map(facility => {
                                        const isSelected = facilities?.includes(facility)
                                        return (
                                            <button
                                                key={facility}
                                                type="button"
                                                onClick={() => {
                                                    const newFacilities = isSelected
                                                        ? facilities.filter(f => f !== facility)
                                                        : [...facilities, facility]
                                                    onFacilitiesChange(newFacilities)
                                                }}
                                                className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${isSelected
                                                    ? 'bg-primary text-white border-primary shadow-sm scale-[1.02]'
                                                    : 'bg-surface text-gray-500 border-border hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                                                    }`}
                                            >
                                                {isSelected ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                                )}
                                                {facility}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}
