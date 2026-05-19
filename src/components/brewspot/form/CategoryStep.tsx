'use client'

import { Card } from '@/components/common/Card'
import { SPOT_CATEGORIES, AddBrewSpotInput, SpotCategory } from '@/features/brewspot/types'

interface CategoryStepProps {
    value?: SpotCategory
    onChange: (category: SpotCategory) => void
}

export function CategoryStep({ value, onChange }: CategoryStepProps) {
    return (
        <Card className="p-6 border-b-4" style={{ borderBottomColor: SPOT_CATEGORIES[value || 'cafe'].color }}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-heading font-bold text-primary">
                    Langkah 1: Pilih Kategori
                </h2>
                <span className="text-xs font-bold px-2 py-1 bg-primary/5 text-primary rounded-full uppercase tracking-wider">Wajib</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(Object.entries(SPOT_CATEGORIES) as [SpotCategory, typeof SPOT_CATEGORIES['cafe']][]).map(([key, data]) => {
                    const isSelected = value === key
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onChange(key)}
                            className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${
                                isSelected
                                    ? 'bg-primary/5 border-primary shadow-md ring-4 ring-primary/10'
                                    : 'bg-surface border-border hover:border-primary/30 hover:shadow-sm'
                            }`}
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${isSelected ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                {data.icon}
                            </div>
                            <span className={`text-xs font-bold text-center leading-tight ${isSelected ? 'text-primary' : 'text-gray-500'}`}>
                                {data.label}
                            </span>
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                        </button>
                    )
                })}
            </div>
        </Card>
    )
}
