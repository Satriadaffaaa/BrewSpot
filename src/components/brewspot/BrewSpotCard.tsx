import { getPriceLabel } from '@/utils/price'
import { LinkIcon, MapPinIcon, StarIcon, SparklesIcon, PencilSquareIcon, TrashIcon, CheckBadgeIcon, ClockIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BrewSpot, SPOT_CATEGORIES, getCategoryOrDefault } from '@/features/brewspot/types'
import { Card } from '@/components/common/Card'
import { useAuth } from '@/providers/AuthProvider'
import { deleteBrewSpot } from '@/features/brewspot/api'
import { useState, useEffect } from 'react'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { calculateDistance, formatDistance } from '@/lib/locationUtils'
import { cn } from '@/lib/utils'

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

    const isVerified = brewSpot.isOfficial || brewSpot.verificationStatus === 'verified'
    
    // Prioritize official photos if verified
    const displayImage = (isVerified && brewSpot.officialPhotos && brewSpot.officialPhotos.length > 0)
        ? brewSpot.officialPhotos[0]
        : (brewSpot.photos?.[0] || brewSpot.image_url)

    const isOwner = user?.uid === brewSpot.user_id

    const distance = userLocation ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        brewSpot.latitude,
        brewSpot.longitude
    ) : null

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

    if (isDeleting) return null

    return (
        <Card className="group/card relative flex flex-col h-full bg-surface border-white/50 hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden shadow-premium">
            {/* Owner Actions Overlay */}
            {isOwner && (
                <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300 translate-y-2 group-hover/card:translate-y-0">
                    <Link
                        href={`/edit-spot/${brewSpot.id}`}
                        className="p-2.5 bg-surface/90 backdrop-blur-md rounded-xl shadow-xl text-neutral-light hover:text-accent border border-white/20 transition-all"
                        title="Edit Spot"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="p-2.5 bg-surface/90 backdrop-blur-md rounded-xl shadow-xl text-neutral-light hover:text-danger border border-white/20 transition-all"
                        title="Delete Spot"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Image Section */}
            <div className="relative h-64 overflow-hidden bg-secondary/10">
                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
                    <div className="flex flex-col gap-2">
                         {brewSpot.status === 'pending' && (
                            <div className="bg-amber-500/20 backdrop-blur-md text-amber-200 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-amber-500/30 shadow-xl">
                                Pending Review
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-2 border border-white/20 shadow-xl uppercase tracking-wider">
                        <span className="text-accent">{SPOT_CATEGORIES[getCategoryOrDefault(brewSpot)].icon}</span>
                        {SPOT_CATEGORIES[getCategoryOrDefault(brewSpot)].label}
                    </div>
                </div>

                {/* Bottom Overlay: Author/Verified Info */}
                <div className="absolute bottom-4 left-4 z-20">
                    {isVerified ? (
                        <div className="flex items-center gap-1.5 bg-indigo-600/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg border border-indigo-400/30">
                            <CheckBadgeIcon className="w-3.5 h-3.5 text-white" />
                            <span className="text-white text-[9px] font-black uppercase tracking-wider">
                                Verified Haven
                            </span>
                        </div>
                    ) : brewSpot.authorName ? (
                        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                            {brewSpot.authorAvatar ? (
                                <img src={brewSpot.authorAvatar} alt={brewSpot.authorName} className="w-5 h-5 rounded-full object-cover border border-white/20" />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[8px] font-black text-white">
                                    {brewSpot.authorName.charAt(0)}
                                </div>
                            )}
                            <span className="text-white text-[9px] font-bold uppercase tracking-wider truncate max-w-[120px]">
                                {brewSpot.authorName}
                            </span>
                        </div>
                    ) : null}
                </div>

                {/* Actual Image */}
                <div className="h-full w-full group-hover/card:scale-110 transition-transform duration-1000">
                    {displayImage ? (
                        <img src={displayImage} alt={brewSpot.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                        <div className="w-full h-full bg-secondary/30 flex items-center justify-center text-neutral-light/10 text-4xl font-black uppercase tracking-widest">
                            LOKALI
                        </div>
                    )}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1 gap-4">
                {/* 1. Name Section */}
                <div>
                    <Link href={`/spot/${brewSpot.id}`}>
                        <h3 className="font-heading font-black text-2xl text-primary tracking-tight line-clamp-1 group-hover/card:text-accent transition-colors leading-tight">
                            {brewSpot.name}
                        </h3>
                    </Link>
                </div>

                {/* 2. Reputation Row (Rating & Visits) */}
                <div className="flex items-center gap-3">
                    {brewSpot.rating !== undefined && (
                        <div className="flex items-center gap-1.5 bg-accent text-primary px-3 py-1 rounded-full shadow-sm border border-accent-dark/10">
                            <StarIcon className="w-4 h-4 fill-primary text-primary" />
                            <span className="text-sm font-black">{brewSpot.rating.toFixed(1)}</span>
                        </div>
                    )}
                    {brewSpot.totalCheckIns && brewSpot.totalCheckIns > 0 && (
                        <div className="flex items-center gap-1.5 text-neutral-light/60">
                            <SparklesIcon className="w-4 h-4 text-accent" />
                            <span className="text-[11px] font-bold uppercase tracking-tight">
                                {brewSpot.totalCheckIns} Kunjungan
                            </span>
                        </div>
                    )}
                </div>

                {/* 3. Suitability Row (Budget & Category) */}
                <div className="flex items-center gap-3 py-2 border-y border-neutral/5">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-neutral-light/40 uppercase tracking-widest">Budget:</span>
                        <span className="text-xs font-bold text-primary bg-secondary/5 px-2 py-0.5 rounded">
                            Rp • {getPriceLabel(brewSpot.price_range)}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-neutral/10" />
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm">{SPOT_CATEGORIES[getCategoryOrDefault(brewSpot)].icon}</span>
                        <span className="text-xs font-bold text-neutral-light">{SPOT_CATEGORIES[getCategoryOrDefault(brewSpot)].label}</span>
                    </div>
                </div>

                {/* 4. Status & Distance Row */}
                <div className="flex flex-col gap-2">
                    {distance && (
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-light/70">
                            <MapPinIcon className="w-4 h-4 text-accent/70" />
                            <span>📍 {formatDistance(distance)} dari lokasimu</span>
                        </div>
                    )}
                    
                    {mounted && brewSpot.weekly_hours && (() => {
                        const days: (keyof typeof brewSpot.weekly_hours)[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                        const now = new Date();
                        const currentDay = days[now.getDay()];
                        const todaySchedule = brewSpot.weekly_hours[currentDay];

                        let statusText = "Tutup";
                        let isOpened = false;

                        if (todaySchedule?.isOpen) {
                            const currentTime = now.getHours() * 60 + now.getMinutes();
                            const [openH, openM] = todaySchedule.openTime.split(':').map(Number);
                            const [closeH, closeM] = todaySchedule.closeTime.split(':').map(Number);
                            const openTime = openH * 60 + openM;
                            const closeTime = closeH * 60 + closeM;
                            
                            if (currentTime >= openTime && currentTime < closeTime) {
                                statusText = "Buka Sekarang";
                                isOpened = true;
                            }
                        }

                        return (
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <ClockIcon className="w-4 h-4 text-accent/70" />
                                <span className={isOpened ? "text-accent" : "text-danger"}>
                                    🕒 {isOpened ? "Buka Sekarang" : "Tutup"}
                                </span>
                            </div>
                        );
                    })()}
                </div>

                {/* 5. Location Row (Address) */}
                <div className="text-[11px] text-neutral-light/50 italic flex items-start gap-1">
                    <span className="line-clamp-2 leading-relaxed">
                        {brewSpot.address}, {brewSpot.city}
                    </span>
                </div>

                {/* AI Insights Tags */}
                {brewSpot.aiMeta?.tags && brewSpot.aiMeta.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                        {brewSpot.aiMeta.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[9px] font-bold bg-secondary/5 text-primary/70 px-2 py-1 rounded-lg border border-primary/5 uppercase tracking-wider">
                                ✨ {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer Action */}
                <div className="mt-auto pt-4 border-t border-neutral/5 flex items-center justify-between">
                    <Link
                        href={`/spot/${brewSpot.id}`}
                        className="inline-flex items-center gap-2 text-primary hover:text-accent font-black text-[10px] uppercase tracking-[0.2em] group/link transition-all"
                    >
                        Lihat Detail
                        <svg className="w-4 h-4 group-hover/link:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </div>
        </Card>
    )
}
