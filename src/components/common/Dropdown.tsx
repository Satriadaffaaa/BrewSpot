'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

export interface DropdownItem {
    label: string
    href?: string
    onClick?: () => void
    icon?: ReactNode
    variant?: 'default' | 'danger'
}

interface DropdownProps {
    trigger: ReactNode
    items: DropdownItem[]
    align?: 'left' | 'right'
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer"
            >
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={cn(
                        "absolute z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg border border-gray-100 focus:outline-none",
                        align === 'right' ? "right-0" : "left-0"
                    )}
                >
                    {items.map((item, index) => {
                        const content = (
                            <div className="flex items-center gap-2">
                                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                                {item.label}
                            </div>
                        )

                        const className = cn(
                            "block w-full px-4 py-2 text-sm text-left hover:bg-gray-50",
                            item.variant === 'danger' ? "text-red-600 hover:bg-red-50" : "text-gray-700"
                        )

                        if (item.href) {
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={className}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {content}
                                </Link>
                            )
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    item.onClick?.()
                                    setIsOpen(false)
                                }}
                                className={className}
                            >
                                {content}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
