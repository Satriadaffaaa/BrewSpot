'use client'

import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'

interface CustomSelectProps {
    label: string
    value: string
    onChange: (val: string) => void
    options: { value: string; label: string }[]
    variant?: 'default' | 'inline'
}

export function CustomSelect({ label, value, onChange, options, variant = 'default' }: CustomSelectProps) {
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
