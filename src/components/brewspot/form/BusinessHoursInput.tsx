'use client'

import { WeeklyHours, DayOfWeek } from '@/features/brewspot/types'
import { Switch } from '@headlessui/react'
import { ClockIcon } from '@heroicons/react/24/outline'

const DAYS: { key: DayOfWeek; label: string }[] = [
    { key: 'monday', label: 'Senin' },
    { key: 'tuesday', label: 'Selasa' },
    { key: 'wednesday', label: 'Rabu' },
    { key: 'thursday', label: 'Kamis' },
    { key: 'friday', label: 'Jumat' },
    { key: 'saturday', label: 'Sabtu' },
    { key: 'sunday', label: 'Minggu' },
]

interface BusinessHoursInputProps {
    value?: WeeklyHours
    onChange: (value: WeeklyHours) => void
}

export function BusinessHoursInput({ value = {}, onChange }: BusinessHoursInputProps) {
    const handleToggle = (day: DayOfWeek, isOpen: boolean) => {
        const current = value[day] || { isOpen: false, openTime: '09:00', closeTime: '22:00' }
        onChange({
            ...value,
            [day]: { ...current, isOpen }
        })
    }

    const handleTimeChange = (day: DayOfWeek, field: 'openTime' | 'closeTime', time: string) => {
        const current = value[day] || { isOpen: true, openTime: '09:00', closeTime: '22:00' }
        onChange({
            ...value,
            [day]: { ...current, [field]: time }
        })
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                    <ClockIcon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-neutral">Jam Operasional Mingguan</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DAYS.map(({ key, label }) => {
                    const schedule = value[key] || { isOpen: false, openTime: '09:00', closeTime: '22:00' }
                    
                    return (
                        <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-border bg-gray-50/50 gap-3">
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={schedule.isOpen}
                                    onChange={(checked: boolean) => handleToggle(key, checked)}
                                    className={`${
                                        schedule.isOpen ? 'bg-primary' : 'bg-gray-300'
                                    } relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`${
                                            schedule.isOpen ? 'translate-x-4' : 'translate-x-0'
                                        } pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                    />
                                </Switch>
                                <span className={`text-xs font-bold ${schedule.isOpen ? 'text-neutral' : 'text-neutral/40'}`}>
                                    {label}
                                </span>
                            </div>

                            {schedule.isOpen ? (
                                <div className="flex items-center gap-1.5">
                                    <input
                                        type="time"
                                        value={schedule.openTime}
                                        onChange={(e) => handleTimeChange(key, 'openTime', e.target.value)}
                                        className="text-[10px] font-bold bg-white border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <span className="text-neutral/20 text-[10px]">—</span>
                                    <input
                                        type="time"
                                        value={schedule.closeTime}
                                        onChange={(e) => handleTimeChange(key, 'closeTime', e.target.value)}
                                        className="text-[10px] font-bold bg-white border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            ) : (
                                <span className="text-[10px] font-black text-neutral/30 uppercase tracking-widest">
                                    Tutup
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
            <p className="text-[10px] text-neutral/40 italic">
                * Jam operasional resmi akan membantu pengunjung mengetahui kapan tempat ini dapat dikunjungi.
            </p>
        </div>
    )
}
