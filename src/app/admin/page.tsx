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
import { cn } from '@/lib/utils/cn'

export default function AdminPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ pendingSpots: 0, openReports: 0, suspendedUsers: 0, pendingVerifications: 0 })
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
            title: 'Persetujuan Tertunda',
            value: stats.pendingSpots,
            icon: ClipboardDocumentCheckIcon,
            color: 'text-[#E8A87C]',
            bg: 'bg-[#E8A87C]/10',
            href: '/admin/spots',
            desc: 'Menunggu Peninjauan'
        },
        {
            title: 'Verifikasi Owner',
            value: stats.pendingVerifications || 0,
            icon: CheckCircleIcon,
            color: 'text-[#1a1a2e]',
            bg: 'bg-[#1a1a2e]/10',
            href: '/admin/verifications',
            desc: 'Antrean Akses Bisnis'
        },
        {
            title: 'Laporan Aktif',
            value: stats.openReports,
            icon: ExclamationTriangleIcon,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            href: '/admin/reports',
            desc: 'Butuh Perhatian'
        }
    ]

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Hero Section - Refined Contrast */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1a1a2e] to-[#2c1e16] p-10 md:p-14 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-[#E8A87C]/10 blur-2xl"></div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-4">
                            <div className="inline-flex px-3 py-1 rounded-full bg-[#E8A87C]/20 border border-[#E8A87C]/30">
                                <span className="text-[#E8A87C] text-[10px] font-black uppercase tracking-[0.2em]">Admin Console</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black font-heading tracking-tight !text-[#F5E6D3] leading-none">
                                Halo, <span className="text-white">{user?.displayName?.split(' ')[0] || 'Admin'}</span>
                            </h1>
                            <p className="!text-[#F5E6D3]/80 max-w-lg text-lg font-medium leading-relaxed">
                                Pantau metrik kritis dan kelola keamanan platform dari pusat kendali Anda hari ini.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid - More Compact & Premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-40 bg-white/50 rounded-[2rem] animate-pulse border border-white/20" />)
                ) : (
                    statCards.map((card, idx) => (
                        <Link key={idx} href={card.href} className="group block focus:outline-none">
                            <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm border border-[#2c1e16]/5 transition-all duration-500 hover:shadow-2xl hover:border-[#E8A87C]/20 hover:-translate-y-1">
                                <div className={cn("absolute right-6 top-6 rounded-2xl p-3", card.bg)}>
                                    <card.icon className={cn("h-6 w-6", card.color)} />
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs font-black uppercase tracking-widest text-[#8B5E3C]/60 group-hover:text-[#E8A87C] transition-colors">{card.title}</p>
                                    <p className="text-5xl font-black font-heading text-[#2c1e16] tracking-tighter">{card.value}</p>
                                </div>
                                <div className="mt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-[#8B5E3C]/40">
                                    <ArrowTrendingUpIcon className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                                    <span>{card.desc}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Tools & Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[#8B5E3C] mb-4 flex items-center gap-3">
                        <div className="w-8 h-[1px] bg-[#8B5E3C]/20"></div>
                        Platform Tools
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/admin/analytics" className="group p-5 rounded-[2rem] bg-white border border-[#2c1e16]/5 hover:border-[#E8A87C]/20 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <ArrowTrendingUpIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#2c1e16]">Analytics Dashboard</h3>
                                    <p className="text-xs text-[#8B5E3C]/60">Traffic & Growth Metrics</p>
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/ai-tools" className="group p-5 rounded-[2rem] bg-white border border-[#2c1e16]/5 hover:border-[#E8A87C]/20 transition-all duration-300">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                                    <ShieldExclamationIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-[#2c1e16]">AI Control Center</h3>
                                    <p className="text-xs text-[#8B5E3C]/60">AI Quotas & Audit Logs</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* System Health */}
                    <div className="rounded-[2.5rem] bg-white p-8 border border-[#2c1e16]/5 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-black text-[#2c1e16] uppercase tracking-tight">System Health</h3>
                                <p className="text-xs text-[#8B5E3C]/60">Live Operational Status</p>
                            </div>
                            <div className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Operational
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Last Log', value: 'Auto-Logged', icon: ClockIcon, color: 'text-blue-500' },
                                { label: 'Auto-Approve', value: 'Active', icon: CheckCircleIcon, color: 'text-emerald-500' },
                                { label: 'Security', value: 'Protected', icon: ShieldExclamationIcon, color: 'text-purple-500' }
                            ].map((item, i) => (
                                <div key={i} className="p-4 rounded-2xl bg-[#F5E6D3]/30 border border-[#2c1e16]/5 flex flex-col items-center text-center">
                                    <item.icon className={cn("w-5 h-5 mb-2", item.color)} />
                                    <span className="text-[8px] font-black text-[#8B5E3C]/40 uppercase tracking-[0.2em] mb-1">{item.label}</span>
                                    <span className="text-[10px] font-bold text-[#2c1e16]">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    <div className="rounded-[2.5rem] bg-[#1a1a2e] p-8 border border-white/5 shadow-2xl flex flex-col h-full">
                        <div className="mb-8">
                            <div className="w-12 h-12 bg-[#E8A87C]/20 rounded-2xl flex items-center justify-center mb-6">
                                <ExclamationTriangleIcon className="w-6 h-6 text-[#E8A87C]" />
                            </div>
                            <h3 className="text-xl font-black !text-[#F5E6D3] mb-2 tracking-tight">Pending Actions</h3>
                            <p className="text-[#F5E6D3]/40 text-sm leading-relaxed">
                                Anda memiliki <span className="text-[#E8A87C] font-bold">{stats.openReports} laporan</span> aktif yang membutuhkan tindakan segera.
                            </p>
                        </div>

                        <div className="mt-auto pt-8">
                            <Link href="/admin/reports">
                                <button className="w-full py-4 rounded-2xl bg-[#E8A87C] text-[#1a1a2e] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-[#E8A87C]/20 hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                                    Review Reports
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
