'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { getDashboardStats } from '@/features/admin/api'
import {
    ClipboardDocumentCheckIcon,
    ExclamationTriangleIcon,
    ShieldExclamationIcon,
    ArrowTrendingUpIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/providers/AuthProvider'

export default function AdminPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ pendingSpots: 0, openReports: 0, suspendedUsers: 0 })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getDashboardStats()
                setStats(data)
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            title: 'Pending Approvals',
            value: stats.pendingSpots,
            icon: ClipboardDocumentCheckIcon,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            href: '/admin/brewspots',
            desc: 'Awaiting Review'
        },
        {
            title: 'Active Reports',
            value: stats.openReports,
            icon: ExclamationTriangleIcon,
            color: 'text-rose-600',
            bg: 'bg-rose-100',
            href: '/admin/reports',
            desc: 'Requires Attention'
        },
        {
            title: 'Suspended Users',
            value: stats.suspendedUsers,
            icon: ShieldExclamationIcon,
            color: 'text-slate-600',
            bg: 'bg-slate-100',
            href: '/admin/users',
            desc: 'Restricted Accounts'
        }
    ]

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2c1e16] to-[#4a342a] p-8 md:p-12 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-amber-500/20 blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-bold uppercase tracking-wider mb-3">
                                Admin Console
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold font-heading mb-2">
                                Good Evening, {user?.displayName?.split(' ')[0] || 'Admin'}
                            </h1>
                            <p className="text-amber-100/70 max-w-xl text-lg">
                                Access critical metrics and manage platform safety from your command center.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            {/* Future quick actions */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-white rounded-3xl animate-pulse shadow-sm border border-neutral-100" />)
                ) : (
                    statCards.map((card, idx) => (
                        <Link key={idx} href={card.href} className="group block focus:outline-none">
                            <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-900/5 transition-all duration-300 hover:shadow-xl hover:ring-primary/20 hover:-translate-y-1">
                                <div className={`absolute right-4 top-4 rounded-2xl p-3 ${card.bg}`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} />
                                </div>

                                <div className="mt-8">
                                    <p className="text-sm font-medium text-neutral-500 group-hover:text-primary/70 transition-colors">{card.title}</p>
                                    <p className="mt-2 text-4xl font-bold font-heading text-neutral-900 tracking-tight">{card.value}</p>
                                </div>
                                <div className="mt-6 flex items-center text-sm text-neutral-400">
                                    <ArrowTrendingUpIcon className="mr-1.5 h-4 w-4 text-green-500" />
                                    <span>{card.desc}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Tools & Analytics Grid */}
            <h2 className="text-xl font-bold font-heading text-neutral-800 mb-4 mt-8">Platform Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link href="/admin/analytics" className="group block focus:outline-none">
                    <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-900/5 transition-all duration-300 hover:shadow-xl hover:ring-primary/20 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                                <ArrowTrendingUpIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">Analytics Dashboard</h3>
                                <p className="text-sm text-neutral-500">View traffic, growth, and user engagement metrics.</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <Link href="/admin/ai-tools" className="group block focus:outline-none">
                    <div className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm ring-1 ring-neutral-900/5 transition-all duration-300 hover:shadow-xl hover:ring-primary/20 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                                <ShieldExclamationIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900">AI Control Center</h3>
                                <p className="text-sm text-neutral-500">Manage AI features, quotas, and audit logs.</p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Operaional Visibility / System Status */}
                <div className="lg:col-span-2 rounded-3xl bg-white p-8 shadow-md border border-neutral-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold font-heading text-neutral-800">System Health</h3>
                            <p className="text-sm text-neutral-400">Operational status and automated checks</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-bold text-green-700 uppercase">Systems Operational</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col items-center text-center">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-full mb-3">
                                <ClockIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Last Log</span>
                            <span className="font-mono text-sm font-medium text-neutral-800">Auto-Logged</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col items-center text-center">
                            <div className="p-2 bg-green-100 text-green-600 rounded-full mb-3">
                                <CheckCircleIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Auto-Approval</span>
                            <span className="font-mono text-sm font-medium text-green-600">Active</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col items-center text-center">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-full mb-3">
                                <ShieldExclamationIcon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">Admin Tools</span>
                            <span className="font-mono text-sm font-medium text-neutral-800">Protected</span>
                        </div>
                    </div>
                </div>

                {/* Quick Action / CTA */}
                <div className="rounded-3xl bg-gradient-to-b from-primary/5 to-primary/10 p-8 border border-primary/10 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold font-heading text-neutral-800 mb-2">Pending Actions</h3>
                        <p className="text-neutral-500 mb-6">You have <strong>{stats.openReports}</strong> reports needing attention.</p>
                    </div>

                    <Link href="/admin/reports">
                        <button className="w-full py-4 rounded-xl bg-primary text-secondary font-bold shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            Review Reports
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
