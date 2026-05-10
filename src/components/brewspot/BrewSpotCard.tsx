import { getPriceLabel } from '@/utils/price'

import { LinkIcon, MapPinIcon, StarIcon, SparklesIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BrewSpot, SPOT_CATEGORIES, getCategoryOrDefault } from '@/features/brewspot/types'
import { Card } from '@/components/common/Card'
import { useAuth } from '@/providers/AuthProvider'
import { deleteBrewSpot } from '@/features/brewspot/api'
import { useState, useEffect } from 'react'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'

import { calculateDistance, formatDistance } from '@/lib/locationUtils'

interface BrewSpotCardProps {
    brewSpot: BrewSpot
    userLocation?: { latitude: number, longitude: number } | null
}

export function BrewSpotCard({ brewSpot, userLocation }: BrewSpotCardProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const [mounted, setMounted] = useState(false)
    
    useEffect(() => {
        setMounted(true)
    }, [])

    const displayImage = brewSpot.photos?.[0] || brewSpot.image_url
    const isOwner = user?.uid === brewSpot.user_id

    const distance = userLocation ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        brewSpot.latitude,
        brewSpot.longitude
    ) : null



    // ...

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent link navigation

        const result = await AdminSwal.fire({
            title: 'Hapus Spot?',
            text: "Tindakan ini tidak dapat dibatalkan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus!',
            cancelButtonText: 'Batal',
            reverseButtons: true
        })

        if (!result.isConfirmed) return

        setIsDeleting(true)
        try {
            await deleteBrewSpot(brewSpot.id)
            await Toast.fire({
                icon: 'success',
                title: 'Spot berhasil dihapus'
            })
            router.refresh()
        } catch (error) {
            console.error("Delete failed:", error)
            await AdminSwal.fire({
                title: 'Error!',
                text: 'Gagal menghapus spot',
                icon: 'error'
            })
            setIsDeleting(false)
        }
    }

    if (isDeleting) return null // Hide card immediately on delete start/success for better UX

    return (
        <Card className="hover:shadow-premium transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col h-full bg-surface group/card relative border border-white shadow-premium">
            {/* Owner Actions Overlay - High Fidelity */}
            {isOwner && (
                <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0">
                    <Link
                        href={`/edit-spot/${brewSpot.id}`}
                        className="p-3 bg-surface/90 backdrop-blur-md rounded-2xl shadow-xl text-neutral-light hover:text-accent hover:bg-surface transition-all"
                        title="Edit Spot"
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="p-3 bg-surface/90 backdrop-blur-md rounded-2xl shadow-xl text-neutral-light hover:text-danger hover:bg-surface transition-all"
                        title="Delete Spot"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Image Section - Luxury Treatment */}
            <div className="h-60 bg-secondary/30 flex items-center justify-center relative group-hover/card:scale-[1.05] transition-transform duration-700 overflow-hidden">
                {displayImage ? (
                    <img src={displayImage} alt={brewSpot.name} className="w-full h-full object-cover" width={400} height={240} loading="lazy" />
                ) : (
                    <div className="text-neutral-light/20 text-5xl font-black opacity-50 uppercase tracking-widest">LOKALI</div>
                )}
                
                {/* Status Badges Overlay */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
                    <div className="bg-primary/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 shadow-glass uppercase tracking-[0.2em]">
                        <span className="text-accent">{SPOT_CATEGORIES[getCategoryOrDefault(brewSpot)].icon}</span>
                        {SPOT_CATEGORIES[getCategoryOrDefault(brewSpot)].label}
                    </div>
                    {brewSpot.status === 'pending' && (
                        <div className="bg-amber-500/90 backdrop-blur-md text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-[0.2em] border border-white/20 shadow-glass">Pending Review</div>
                    )}
                </div>

                {/* Author Premium Badge */}
                {brewSpot.authorName && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent flex items-center gap-3">
                        <div className="relative">
                            {brewSpot.authorAvatar ? (
                                <img src={brewSpot.authorAvatar} alt={brewSpot.authorName} className="w-8 h-8 rounded-full border-2 border-white shadow-xl object-cover" width={32} height={32} loading="lazy" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow-xl">
                                    {brewSpot.authorName.charAt(0)}
                                </div>
                            )}
                            {brewSpot.authorIsContributor && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-surface rounded-full flex items-center justify-center shadow-sm">
                                    <SparklesIcon className="w-2.5 h-2.5 text-accent fill-accent" />
                                </div>
                            )}
                        </div>
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] truncate">
                            By {brewSpot.authorName}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-6 flex flex-col flex-1 relative bg-surface">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-4 space-y-2">
                        <Link href={`/spot/${brewSpot.id}`}>
                            <h3 className="font-heading font-black text-xl text-primary tracking-tighter line-clamp-1 group-hover/card:text-accent transition-colors leading-tight">
                                {brewSpot.name}
                            </h3>
                        </Link>
                        
                        <div className="flex flex-wrap gap-2">
                            {distance && (
                                <span className="inline-flex items-center rounded-lg bg-accent/5 px-2 py-1 text-[10px] font-black text-accent uppercase tracking-wider border border-accent/10">
                                    {formatDistance(distance)} AWAY
                                </span>
                            )}
                            
                            {/* Status Indicator */}
                            {mounted && (() => {
                                if (!brewSpot.weekly_hours) return null;
                                const days: (keyof typeof brewSpot.weekly_hours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                                const now = new Date();
                                const currentDay = days[now.getDay()];
                                const todaySchedule = brewSpot.weekly_hours[currentDay];

                                if (!todaySchedule?.isOpen) return <span className="text-[10px] text-danger font-black uppercase tracking-widest">• Closed</span>;

                                const currentTime = now.getHours() * 60 + now.getMinutes();
                                const [openH, openM] = todaySchedule.openTime.split(':').map(Number);
                                const [closeH, closeM] = todaySchedule.closeTime.split(':').map(Number);
                                const openTime = openH * 60 + openM;
                                const closeTime = closeH * 60 + closeM;

                                return currentTime >= openTime && currentTime < closeTime 
                                    ? <span className="text-[10px] text-accent font-black uppercase tracking-widest animate-pulse">• Open Now</span>
                                    : <span className="text-[10px] text-danger font-black uppercase tracking-widest">• Closed</span>;
                            })()}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {brewSpot.rating !== undefined && (
                            <div className="flex items-center gap-1.5 bg-primary text-white px-3 py-1.5 rounded-2xl shadow-premium">
                                <StarIcon className="w-4 h-4 fill-accent text-accent" />
                                <span className="text-sm font-black tracking-tighter">{brewSpot.rating.toFixed(1)}</span>
                            </div>
                        )}
                        {brewSpot.totalCheckIns && brewSpot.totalCheckIns > 0 && (
                            <div className="text-[10px] font-black text-accent bg-accent/10 px-2 py-1 rounded-full border border-accent/10 uppercase tracking-widest">
                                🔥 {brewSpot.totalCheckIns}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-2 text-neutral-light/60 text-sm mb-6 mt-1 font-medium italic">
                    <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
                    <span className="line-clamp-2 leading-relaxed">{brewSpot.address}, {brewSpot.city}</span>
                </div>

                {/* AI Meta / Highlights */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {brewSpot.aiMeta?.tags?.slice(0, 2).map((tag, i) => (
                        <span key={`ai-${i}`} className="text-[9px] font-black bg-secondary/50 text-primary px-2.5 py-1.5 rounded-xl uppercase tracking-widest border border-white shadow-sm">
                            ✨ {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-auto pt-6 border-t border-neutral/5 flex items-center justify-between">
                    <div className="text-[10px] font-black text-neutral-light/60 uppercase tracking-[0.2em] px-3 py-1.5 bg-secondary/30 rounded-xl">
                        {getPriceLabel(brewSpot.price_range)}
                    </div>
                    <Link
                        href={`/spot/${brewSpot.id}`}
                        className="text-primary text-[10px] font-black uppercase tracking-[0.3em] hover:text-accent transition-all flex items-center gap-2 group/link"
                    >
                        View Haven
                        <LinkIcon className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </Card>
    )
}

