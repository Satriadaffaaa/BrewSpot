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
            <div className="overflow-x-auto">
                <div className="align-middle inline-block min-w-full">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-neutral-100">
                            <thead className="bg-neutral-50/50">
                                <tr>
                                    <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                        BrewSpot Details
                                    </th>
                                    <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th scope="col" className="relative px-6 py-5">
                                        <span className="sr-only">Review</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-neutral-100">
                                {spots.map((spot) => (
                                    <tr key={spot.id} className="group hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
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
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm font-medium text-neutral-700 bg-neutral-100 px-3 py-1 rounded-full w-fit">
                                                {spot.city}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-neutral-500">
                                                <ClockIcon className="w-4 h-4 mr-1.5 text-neutral-400" />
                                                {new Date(spot.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100 capitalize">
                                                <span className="w-2 h-2 rounded-full bg-amber-400 mr-2 my-auto animate-pulse"></span>
                                                {spot.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/admin/brewspots/${spot.id}`}>
                                                <Button size="sm" className="bg-white text-neutral-600 border border-neutral-200 hover:bg-primary hover:text-white hover:border-primary shadow-sm">
                                                    Review Application
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
