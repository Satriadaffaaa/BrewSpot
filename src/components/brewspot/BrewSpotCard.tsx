'use client'

import { LinkIcon, MapPinIcon, StarIcon, SparklesIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BrewSpot } from '@/features/brewspot/types'
import { Card } from '@/components/common/Card'
import { useAuth } from '@/providers/AuthProvider'
import { deleteBrewSpot } from '@/features/brewspot/api'
import { useState } from 'react'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'

interface BrewSpotCardProps {
    brewSpot: BrewSpot
}

export function BrewSpotCard({ brewSpot }: BrewSpotCardProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [isDeleting, setIsDeleting] = useState(false)
    const displayImage = brewSpot.photos?.[0] || brewSpot.image_url
    const isOwner = user?.uid === brewSpot.user_id



    // ...

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault() // Prevent link navigation

        const result = await AdminSwal.fire({
            title: 'Delete BrewSpot?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true
        })

        if (!result.isConfirmed) return

        setIsDeleting(true)
        try {
            await deleteBrewSpot(brewSpot.id)
            await Toast.fire({
                icon: 'success',
                title: 'BrewSpot deleted successfully'
            })
            router.refresh()
        } catch (error) {
            console.error("Delete failed:", error)
            await AdminSwal.fire({
                title: 'Error!',
                text: 'Failed to delete BrewSpot',
                icon: 'error'
            })
            setIsDeleting(false)
        }
    }

    if (isDeleting) return null // Hide card immediately on delete start/success for better UX

    return (
        <Card className="hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] overflow-hidden flex flex-col h-full bg-white group/card relative border border-primary/5">

            {/* Owner Actions Overlay */}
            {isOwner && (
                <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                    <Link
                        href={`/edit-brewspot/${brewSpot.id}`}
                        className="p-1.5 bg-white rounded-full shadow-sm text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit Spot"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="p-1.5 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete Spot"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Image Placeholder or Actual Image */}
            <div className="h-48 bg-gray-100 flex items-center justify-center relative group-hover/card:scale-[1.02] transition-transform duration-500 overflow-hidden">
                {/* Scale effect on image wrapper or image itself */}
                {displayImage ? (
                    <img src={displayImage} alt={brewSpot.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-400 text-3xl font-heading opacity-50">☕</span>
                )}
                {brewSpot.status === 'pending' && (
                    <span className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium z-10">Pending Approval</span>
                )}

                {/* Author Badge Overlay */}
                {brewSpot.authorName && (
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent flex items-center gap-2">
                        {brewSpot.authorAvatar ? (
                            <img src={brewSpot.authorAvatar} alt={brewSpot.authorName} className="w-6 h-6 rounded-full border border-white/50 object-cover" />
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-white flex items-center justify-center text-[10px] font-bold border border-white/50 backdrop-blur-sm">
                                {brewSpot.authorName.charAt(0)}
                            </div>
                        )}
                        <span className="text-white text-xs font-medium truncate flex items-center gap-1">
                            {brewSpot.authorName}
                            {brewSpot.authorIsContributor && (
                                <SparklesIcon className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20 animate-pulse" title="Top Contributor" />
                            )}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col flex-1 relative bg-white">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0 pr-2">
                        <Link href={`/brewspot/${brewSpot.id}`}>
                            <h3 className="font-heading font-bold text-lg text-primary line-clamp-1 hover:text-primary/80 transition-colors">{brewSpot.name}</h3>
                        </Link>
                        {/* Tags */}
                        {/* Tags or AI Highlights */}
                        <div className="flex flex-wrap gap-1 mt-1">
                            {/* Priority: AI Highlights */}
                            {brewSpot.aiMeta?.tags && brewSpot.aiMeta.tags.length > 0 ? (
                                brewSpot.aiMeta.tags.slice(0, 2).map((tag, i) => (
                                    <span key={`ai-${i}`} className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full whitespace-nowrap border border-blue-100 flex items-center gap-0.5">
                                        ✨ {tag}
                                    </span>
                                ))
                            ) : (
                                /* Fallback: Manual Tags */
                                brewSpot.tags?.slice(0, 2).map((tag, i) => (
                                    <span key={i} className="text-[10px] bg-primary/5 text-primary px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                        {tag}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2 flex-col items-end">
                        {brewSpot.totalCheckIns && brewSpot.totalCheckIns > 0 && (
                            <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-100" title="Total Check-ins">
                                🔥 {brewSpot.totalCheckIns}
                            </div>
                        )}
                        {brewSpot.rating !== undefined && (
                            <div className="flex items-center gap-1 text-sm bg-accent/10 text-accent-content px-1.5 py-0.5 rounded" title={`${brewSpot.reviews_count || 0} reviews`}>
                                <StarIcon className="w-3.5 h-3.5 fill-current" />
                                <span className="font-medium">{brewSpot.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-1.5 text-neutral/70 text-sm mb-4 mt-1">
                    <MapPinIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{brewSpot.address}, {brewSpot.city}</span>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-xs text-neutral/50 font-medium px-2 py-1 bg-gray-50 rounded-md capitalize">
                        {brewSpot.price_range}
                    </div>
                    <Link
                        href={`/brewspot/${brewSpot.id}`}
                        className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                    >
                        View Details
                        <LinkIcon className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </Card>
    )
}
