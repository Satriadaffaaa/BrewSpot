'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { AnalyticsSnapshot, getAnalyticsSnapshots } from '@/features/analytics/statsSnapshot'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts'
import { ChartBarIcon, ArrowTrendingUpIcon, UsersIcon } from '@heroicons/react/24/outline'

export default function AnalyticsPage() {
    const [snapshots, setSnapshots] = useState<AnalyticsSnapshot[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAnalyticsSnapshots().then(data => {
            // Reverse to show oldest to newest left-to-right
            setSnapshots(data.reverse());
            setLoading(false);
        });
    }, [])

    if (loading) return <div className="p-12 text-center text-gray-400">Loading Analytics...</div>

    const latest = snapshots[snapshots.length - 1];

    // Prepare data for charts
    // If empty, show placeholder
    // Prepare data for charts (removed blocking return)

    return (
        <div className="space-y-8 p-6">
            <div className="flex items-center gap-3 mb-6">
                <ChartBarIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-heading font-bold text-neutral">Platform Analytics</h1>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-white">
                    <div className="flex items-center gap-3 text-blue-600 mb-2">
                        <UsersIcon className="w-5 h-5" />
                        <h3 className="font-bold">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-neutral">{latest?.totalUsers || 0}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <ArrowTrendingUpIcon className="w-3 h-3" />
                        +{latest?.newUsers || 0} today
                    </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-white">
                    <div className="flex items-center gap-3 text-purple-600 mb-2">
                        <span className="text-lg">☕</span>
                        <h3 className="font-bold">Total BrewSpots</h3>
                    </div>
                    <p className="text-3xl font-bold text-neutral">{latest?.totalBrewSpots || 0}</p>
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <ArrowTrendingUpIcon className="w-3 h-3" />
                        +{latest?.newBrewSpots || 0} today
                    </p>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-white">
                    <div className="flex items-center gap-3 text-green-600 mb-2">
                        <span className="text-lg">✅</span>
                        <h3 className="font-bold">Approvals</h3>
                    </div>
                    <p className="text-3xl font-bold text-neutral">{latest?.approvals || 0}</p>
                    <p className="text-xs text-gray-400 mt-1">Today's activity</p>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Growth Chart */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg mb-6">User & Spot Growth (30 Days)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={snapshots}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="totalUsers" name="Users" stroke="#2563EB" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="totalBrewSpots" name="BrewSpots" stroke="#7C3AED" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Activity Chart */}
                <Card className="p-6">
                    <h3 className="font-bold text-lg mb-6">Daily Activity</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={snapshots}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Bar dataKey="newUsers" name="New Users" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="newBrewSpots" name="Submissions" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Phase 8: Real-Time Analytics (Search & Views) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                <RealTimeViewsSection />
                <RecentSearchesSection />
            </div>
        </div>
    )
}

// Sub-components for cleanliness
import { getRecentSearches, getTopViewedSpots, SearchLog } from '@/features/analytics/api'
import { BrewSpot } from '@/features/brewspot/types'
import { EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

function RealTimeViewsSection() {
    const [spots, setSpots] = useState<BrewSpot[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getTopViewedSpots(5).then(data => {
            setSpots(data)
            setLoading(false)
        })
    }, [])

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    <EyeIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold font-heading">Most Viewed Spots</h2>
            </div>
            <div className="space-y-4">
                {loading ? (
                    <div className="h-40 animate-pulse bg-gray-50 rounded-xl" />
                ) : spots.length > 0 ? (
                    spots.map((spot, idx) => (
                        <div key={spot.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {idx + 1}
                                </span>
                                <div className="truncate max-w-[200px]">
                                    <p className="font-bold text-neutral-800 truncate">{spot.name}</p>
                                    <p className="text-xs text-neutral-500 truncate">{spot.city}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-neutral-600 font-mono text-sm">
                                <span>{spot.viewsCount || 0}</span>
                                <EyeIcon className="w-3 h-3" />
                            </div>
                        </div>
                    ))
                ) : <p className="text-gray-400 text-center">No views recorded yet.</p>}
            </div>
        </Card>
    )
}

function RecentSearchesSection() {
    const [searches, setSearches] = useState<SearchLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRecentSearches(10).then(data => {
            setSearches(data)
            setLoading(false)
        })
    }, [])

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                    <MagnifyingGlassIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold font-heading">Recent Searches</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-4 py-3">Query</th>
                            <th className="px-4 py-3 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={2}><div className="h-32 bg-gray-50 animate-pulse" /></td></tr>
                        ) : searches.length > 0 ? (
                            searches.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-neutral-800">
                                        "{log.query}"
                                        {log.city !== 'all' && <span className="ml-2 text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{log.city}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-500 text-xs whitespace-nowrap">
                                        {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={2} className="text-center py-8 text-gray-400">No searches log.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    )
}
