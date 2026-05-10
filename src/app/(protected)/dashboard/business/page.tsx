'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/providers/AuthProvider'
import { getOwnedSpots } from '@/features/brewspot/api'
import { BrewSpot } from '@/features/brewspot/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
    BuildingStorefrontIcon, 
    ChartBarIcon, 
    UserGroupIcon, 
    StarIcon,
    ArrowUpRightIcon,
    PlusIcon,
    PencilSquareIcon,
    CheckBadgeIcon,
    EyeIcon
} from '@heroicons/react/24/outline'

export default function BusinessDashboardPage() {
    const { user, profile } = useAuth()
    const router = useRouter()
    const [spots, setSpots] = useState<BrewSpot[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user) {
            getOwnedSpots(user.uid).then((data) => {
                setSpots(data)
                setLoading(false)
            })
        }
    }, [user])

    // Calculate aggregate stats
    const totalViews = spots.reduce((acc, spot) => acc + (spot.viewsCount || 0), 0)
    const totalReviews = spots.reduce((acc, spot) => acc + (spot.reviews_count || 0), 0)
    const avgRating = spots.length > 0 
        ? spots.reduce((acc, spot) => acc + (spot.rating || 0), 0) / spots.length 
        : 0

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <Container className="py-8 md:py-12 max-w-6xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest mb-2">
                        <BuildingStorefrontIcon className="w-5 h-5" /> Business Suite
                    </div>
                    <h1 className="text-4xl font-black font-heading text-primary tracking-tight">Kendalikan Bisnis Anda</h1>
                    <p className="text-neutral-500 max-w-md mt-2">
                        Kelola kehadiran digital Anda, analisis performa, dan berinteraksi dengan komunitas Lokali.
                    </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link href="/add-spot" className="flex-1">
                        <Button className="w-full rounded-xl shadow-lg border-none flex items-center justify-center gap-2">
                            <PlusIcon className="w-5 h-5" /> Tambah Cabang Baru
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-surface shadow-soft border-none group hover:shadow-xl transition-all">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl w-fit mb-4">
                        <EyeIcon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-black text-primary">{totalViews.toLocaleString()}</div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Total Tampilan</div>
                </Card>
                <Card className="p-6 bg-surface shadow-soft border-none group hover:shadow-xl transition-all">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4">
                        <StarIcon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-black text-primary">{avgRating.toFixed(1)}</div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Rating Rata-rata</div>
                </Card>
                <Card className="p-6 bg-surface shadow-soft border-none group hover:shadow-xl transition-all">
                    <div className="p-3 bg-green-50 text-green-600 rounded-2xl w-fit mb-4">
                        <UserGroupIcon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-black text-primary">{totalReviews.toLocaleString()}</div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Total Ulasan</div>
                </Card>
                <Card className="p-6 bg-surface shadow-soft border-none group hover:shadow-xl transition-all">
                    <div className="p-3 bg-primary/10 text-primary rounded-2xl w-fit mb-4">
                        <BuildingStorefrontIcon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-black text-primary">{spots.length}</div>
                    <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Managed Spots</div>
                </Card>
            </div>

            {/* Managed Spots Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold font-heading text-primary">Spot Kelolaan Anda</h2>
                    <span className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
                        {spots.length} Total
                    </span>
                </div>

                {spots.length === 0 ? (
                    <Card className="p-20 text-center border-dashed border-2 border-primary/20 bg-primary/5 rounded-3xl">
                        <div className="max-w-sm mx-auto space-y-4">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                                <CheckBadgeIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-primary">Belum Ada Spot Terverifikasi</h3>
                            <p className="text-neutral-500">
                                Cari spot Anda di peta dan ajukan klaim untuk memulai manajemen bisnis.
                            </p>
                            <Link href="/explore">
                                <Button variant="outline" className="mt-4 rounded-xl">Cari Spot Saya</Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {spots.map((spot) => (
                            <Card key={spot.id} className="p-0 overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
                                <div className="flex flex-col md:flex-row">
                                    {/* Thumbnail */}
                                    <div className="md:w-64 h-48 relative overflow-hidden shrink-0">
                                        <img 
                                            src={spot.photos?.[0] || 'https://images.unsplash.com/photo-1501339817448-be5c71446ed6?q=80&w=1000&auto=format&fit=crop'} 
                                            alt={spot.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            {spot.city}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow p-6 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-primary mb-1 flex items-center gap-2">
                                                    {spot.name}
                                                    {spot.isOfficial && (
                                                        <CheckBadgeIcon className="w-5 h-5 text-blue-500" title="Verified Official" />
                                                    )}
                                                </h3>
                                                <p className="text-sm text-neutral-500 flex items-center gap-1.5">
                                                    {spot.address}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                                    Official
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-6 mt-6">
                                            <div className="flex items-center gap-2">
                                                <EyeIcon className="w-4 h-4 text-neutral-300" />
                                                <span className="text-sm font-bold text-neutral/70">{spot.viewsCount || 0}</span>
                                                <span className="text-[10px] uppercase text-neutral-400 font-bold">Tampilan</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StarIcon className="w-4 h-4 text-neutral-300" />
                                                <span className="text-sm font-bold text-neutral/70">{spot.rating?.toFixed(1) || '0.0'}</span>
                                                <span className="text-[10px] uppercase text-neutral-400 font-bold">Rating</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <PencilSquareIcon className="w-4 h-4 text-neutral-300" />
                                                <span className="text-sm font-bold text-neutral/70">{spot.reviews_count || 0}</span>
                                                <span className="text-[10px] uppercase text-neutral-400 font-bold">Ulasan</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-50">
                                            <Button 
                                                variant="outline" 
                                                className="rounded-xl px-6 text-xs font-bold uppercase tracking-widest border-border"
                                                onClick={() => router.push(`/spot/${spot.id}`)}
                                            >
                                                Lihat Publik <ArrowUpRightIcon className="w-3 h-3 ml-2" />
                                            </Button>
                                            <Button 
                                                className="rounded-xl px-8 text-xs font-bold uppercase tracking-widest shadow-md"
                                                onClick={() => router.push(`/dashboard/business/manage/${spot.id}`)}
                                            >
                                                Kendalikan Spot
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Performance Insights Tip */}
            <Card className="p-8 bg-neutral-900 text-white rounded-[2rem] overflow-hidden relative border-none">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <ChartBarIcon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold font-heading">Level Up Bisnis Anda</h3>
                    </div>
                    <p className="text-neutral-400 max-w-2xl text-lg leading-relaxed">
                        Spot dengan status <b>Verified Official</b> mendapatkan prioritas 2.5x lebih tinggi dalam hasil pencarian dan tingkat kepercayaan pengguna 4x lebih besar dibandingkan spot biasa.
                    </p>
                    <div className="flex gap-4 pt-2">
                        <div className="px-4 py-2 bg-surface/5 rounded-xl border border-white/10">
                            <div className="text-primary font-black">2.5x</div>
                            <div className="text-[10px] uppercase tracking-widest text-neutral-500">Search Boost</div>
                        </div>
                        <div className="px-4 py-2 bg-surface/5 rounded-xl border border-white/10">
                            <div className="text-primary font-black">400%</div>
                            <div className="text-[10px] uppercase tracking-widest text-neutral-500">Trust Index</div>
                        </div>
                    </div>
                </div>
            </Card>
        </Container>
    )
}

