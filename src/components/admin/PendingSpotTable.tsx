'use client'

import Link from 'next/link';
import { AdminBrewSpot } from '@/features/admin/types';
import { Button } from '@/components/common/Button';
import { MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

interface PendingSpotTableProps {
    spots: AdminBrewSpot[];
}

export function PendingSpotTable({ spots }: PendingSpotTableProps) {
    return (
        <div className="flex flex-col">
            {/* Mobile Card View (< md) */}
            <div className="md:hidden space-y-4">
                {spots.map((spot) => (
                    <div key={spot.id} className="bg-white p-4 rounded-xl shadow-sm border border-neutral/10 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg border border-orange-100 shrink-0">
                                    {spot.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-neutral-900 line-clamp-1">{spot.name}</div>
                                    <div className="text-xs text-neutral/50 flex items-center mt-0.5">
                                        <MapPinIcon className="w-3 h-3 mr-1" />
                                        {spot.city}
                                    </div>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-100 capitalize">
                                {spot.status}
                            </span>
                        </div>

                        <div className="flex items-center text-xs text-neutral/50 border-t border-neutral/5 pt-2">
                            <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                            Submitted on {new Date(spot.created_at).toLocaleDateString()}
                        </div>

                        <Link href={`/admin/brewspots/${spot.id}`} className="w-full">
                            <Button size="sm" className="w-full justify-center bg-white text-neutral-600 border border-neutral-200 hover:bg-primary hover:text-white hover:border-primary">
                                Review Application
                            </Button>
                        </Link>
                    </div>
                ))}
                {spots.length === 0 && (
                    <div className="text-center py-8 text-neutral/40 text-sm">No pending applications</div>
                )}
            </div>

            {/* Desktop Table View (>= md) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-neutral/10 shadow-sm bg-white">
                <table className="min-w-full divide-y divide-neutral-100">
                    <thead className="bg-neutral-50/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                BrewSpot Details
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                Location
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                Submitted
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="relative px-6 py-4">
                                <span className="sr-only">Review</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {spots.map((spot) => (
                            <tr key={spot.id} className="group hover:bg-neutral-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg mr-4 border border-orange-100">
                                            {spot.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-neutral-900 group-hover:text-primary transition-colors">{spot.name}</div>
                                            <div className="text-xs text-neutral-400 font-medium flex items-center mt-0.5">
                                                <MapPinIcon className="w-3 h-3 mr-1" />
                                                {spot.address.substring(0, 30)}{spot.address.length > 30 ? '...' : ''}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full w-fit">
                                        {spot.city}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-neutral-500">
                                        <ClockIcon className="w-4 h-4 mr-1.5 text-neutral-400" />
                                        {new Date(spot.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100 capitalize">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 mr-2 my-auto animate-pulse"></span>
                                        {spot.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link href={`/admin/brewspots/${spot.id}`}>
                                        <Button size="sm" className="bg-white text-neutral-600 border border-neutral-200 hover:bg-primary hover:text-white hover:border-primary shadow-sm active:scale-95">
                                            Review
                                        </Button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {spots.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-12 text-neutral/40">
                                    <div className="flex flex-col items-center">
                                        <span className="text-4xl mb-2">📭</span>
                                        <p>No pending applications</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
