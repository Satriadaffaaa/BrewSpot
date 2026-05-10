'use client'

import { SPOT_CATEGORIES, SpotCategory } from '@/features/brewspot/types'

interface CategoryPillsProps {
    activeCategory: SpotCategory | 'all'
    onCategoryChange: (category: SpotCategory | 'all') => void
}

export function CategoryPills({ activeCategory, onCategoryChange }: CategoryPillsProps) {
    const categories = Object.entries(SPOT_CATEGORIES) as [SpotCategory, typeof SPOT_CATEGORIES['cafe']][]

    return (
        <div className="flex overflow-x-auto pb-6 gap-4 no-scrollbar scroll-smooth -mx-4 px-4 md:mx-0 md:px-0">
            <button
                onClick={() => onCategoryChange('all')}
                className={`flex-shrink-0 px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 border ${
                    activeCategory === 'all'
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105'
                        : 'bg-white text-neutral-light border-neutral/10 hover:border-accent/30 hover:text-accent shadow-sm'
                }`}
            >
                🍱 Semua
            </button>

            {categories.map(([key, data]) => {
                const isActive = activeCategory === key
                return (
                    <button
                        key={key}
                        onClick={() => onCategoryChange(key)}
                        className={`flex-shrink-0 px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 border flex items-center gap-3 ${
                            isActive
                                ? 'text-white border-transparent shadow-lg scale-105'
                                : 'bg-white text-neutral-light border-neutral/10 hover:border-accent/30 hover:text-accent shadow-sm'
                        }`}
                        style={{
                            backgroundColor: isActive ? data.color : undefined,
                            boxShadow: isActive ? `0 10px 20px -5px ${data.color}33` : undefined
                        }}
                    >
                        <span className="text-sm">{data.icon}</span>
                        <span>{data.label}</span>
                    </button>
                )
            })}
        </div>
    )
}

