'use client'

import { XMarkIcon } from '@heroicons/react/24/outline'

interface FilterChipProps {
    label: string
    onRemove: () => void
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
    return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full shrink-0 group hover:bg-accent hover:border-accent transition-all duration-300">
            <span className="text-[10px] font-bold text-accent group-hover:text-white transition-colors uppercase tracking-tight">{label}</span>
            <button onClick={onRemove} className="text-accent group-hover:text-white transition-colors">
                <XMarkIcon className="w-3 h-3 stroke-[3]" />
            </button>
        </div>
    )
}
