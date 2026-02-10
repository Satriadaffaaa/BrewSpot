'use client'

import { useParams } from 'next/navigation'
import { useBrewSpot } from '@/features/brewspot/hooks'
import { deleteBrewSpot } from '@/features/brewspot/api'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { MapPinIcon, StarIcon, ArrowLeftIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { LikeButton } from '@/components/common/LikeButton'
import { SocialVideoEmbed } from '@/components/common/SocialVideoEmbed'

import { BrewSpotReviews } from '@/components/brewspot/BrewSpotReviews'
import { ReportDialog } from '@/components/common/ReportDialog'
import { FlagIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { VibeCheckCard } from '@/components/brewspot/VibeCheckCard'
import { CheckInButton } from '@/features/checkin/components/CheckInButton'
import { TopVisitorsList } from '@/features/checkin/components/TopVisitorsList'

const BrewSpotMap = dynamic(() => import('@/components/brewspot/BrewSpotMap'), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl" />
})

export default function BrewSpotDetailPage() {
    const params = useParams()
    // Ensure id is a string, handle array case if necessary (though dynamic route usually gives string)
    const id = Array.isArray(params.id) ? params.id[0] : params.id

    const { user } = useAuth()
    const { brewSpot, loading, error } = useBrewSpot(id as string)
    const [isReportOpen, setIsReportOpen] = useState(false)

    // Phase 8: View Tracking (Session Debounced)
    useEffect(() => {
        if (!loading && brewSpot) {
            const sessionKey = `viewed_${brewSpot.id}`;
            const lasViewed = sessionStorage.getItem(sessionKey);
            const now = Date.now();

            // Debounce: 30 minutes (1800000 ms)
            if (!lasViewed || (now - Number(lasViewed) > 1800000)) {
                // Determine creatorId: brewSpot.user_id is robust, fallback handled in action if needed.
                // We use dynamic import for action to keep client bundle clean-ish or just standard import if server action
                import('@/features/analytics/actions').then(({ incrementViewAction }) => {
                    incrementViewAction(brewSpot.id, brewSpot.user_id);
                    sessionStorage.setItem(sessionKey, String(now));
                });
            }
        }
    }, [loading, brewSpot]);

    if (loading) {
        // ...
        return (
            <Container className="py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-8 w-1/3 bg-gray-200 rounded" />
                    <div className="h-[400px] bg-gray-200 rounded-xl" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="col-span-2 h-40 bg-gray-200 rounded-xl" />
                        <div className="h-40 bg-gray-200 rounded-xl" />
                    </div>
                </div>
            </Container>
        )
    }

    if (error || !brewSpot) {
        return (
            <Container className="py-12 text-center">
                <h1 className="text-2xl font-bold text-neutral mb-4">BrewSpot Not Found</h1>
                <p className="text-neutral/70 mb-6">{error || "The coffee shop you're looking for doesn't exist."}</p>
                <Link href="/explore">
                    <Button variant="outline">Back to Explore</Button>
                </Link>
            </Container>
        )
    }

    const displayPhotos = brewSpot.photos && brewSpot.photos.length > 0 ? brewSpot.photos : (brewSpot.image_url ? [brewSpot.image_url] : [])

    return (
        <Container className="py-8 space-y-8">
            <div>
                <Link href="/explore" className="inline-flex items-center text-sm text-neutral/50 hover:text-primary mb-4 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Back to Explore
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-heading font-bold text-primary">{brewSpot.name}</h1>
                        {/* Hero Tags (Top 3) */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(brewSpot.aiMeta?.tags || brewSpot.tags).slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-sm font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                                    ✨ {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 self-start md:self-auto">
                        {/* Rating Badge */}
                        {brewSpot.rating && (
                            <div className="flex items-center gap-2 bg-accent/10 text-accent-content px-3 py-1.5 rounded-full">
                                <StarIcon className="w-5 h-5 fill-current" />
                                <span className="font-bold text-lg">{brewSpot.rating.toFixed(1)}</span>
                                <span className="text-sm opacity-75">({brewSpot.reviews_count} reviews)</span>
                            </div>
                        )}
                        <LikeButton brewspotId={brewSpot.id} />
                        <CheckInButton
                            brewSpotId={brewSpot.id}
                            brewSpotLocation={brewSpot ? { lat: brewSpot.latitude, lng: brewSpot.longitude } : undefined}
                        />

                        {/* Owner Actions */}
                        {user?.uid === brewSpot.user_id && (
                            <>
                                <Link href={`/edit-brewspot/${brewSpot.id}`}>
                                    <button className="p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-primary/10" title="Edit Spot">
                                        <PencilSquareIcon className="w-6 h-6" />
                                    </button>
                                </Link>
                                <button
                                    onClick={async () => {
                                        const result = await AdminSwal.fire({
                                            title: 'Delete BrewSpot?',
                                            text: "You won't be able to revert this!",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonText: 'Yes, delete it!',
                                            cancelButtonText: 'Cancel',
                                            reverseButtons: true
                                        })

                                        if (result.isConfirmed) {
                                            try {
                                                await deleteBrewSpot(brewSpot.id)
                                                await Toast.fire({
                                                    icon: 'success',
                                                    title: 'BrewSpot deleted successfully'
                                                })
                                                window.location.href = '/explore'
                                            } catch (e) {
                                                AdminSwal.fire('Error', 'Failed to delete', 'error')
                                            }
                                        }
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                    title="Delete Spot"
                                >
                                    <TrashIcon className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Report Button */}
                        {user && (
                            <button
                                onClick={() => setIsReportOpen(true)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                title="Report this place"
                            >
                                <FlagIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Report Dialog */}
                {brewSpot && (
                    <ReportDialog
                        isOpen={isReportOpen}
                        onClose={() => setIsReportOpen(false)}
                        targetType="brewspot"
                        targetId={brewSpot.id}
                        targetName={brewSpot.name}
                    />
                )}
                <div className="flex items-center gap-2 text-neutral/70 mt-2">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{brewSpot.address}, {brewSpot.city}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Photo Gallery */}
                    <div className="space-y-4">
                        {/* Main Hero Image */}
                        <div className="h-[400px] bg-gray-100 rounded-2xl overflow-hidden relative shadow-sm">
                            {displayPhotos.length > 0 ? (
                                <img src={displayPhotos[0]} alt={brewSpot.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    <span className="text-6xl opacity-30">☕</span>
                                </div>
                            )}
                        </div>
                        {/* Thumbnails Grid */}
                        {displayPhotos.length > 1 && (
                            <div className="grid grid-cols-4 gap-4">
                                {displayPhotos.slice(1, 5).map((photo, idx) => (
                                    <div key={idx} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                                        <img src={photo} alt={`${brewSpot.name} ${idx + 2}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Social Video */}
                    {brewSpot.videoUrl && (
                        <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                            <SocialVideoEmbed url={brewSpot.videoUrl} />
                        </div>
                    )}

                    {/* About / Facilities */}
                    <Card className="p-6 space-y-6">
                        {/* Description / Founder's Note */}
                        {brewSpot.description && (
                            <div>
                                <h3 className="text-lg font-bold font-heading mb-2">Founder's Note</h3>
                                <p className="text-neutral/80 leading-relaxed whitespace-pre-wrap">
                                    {brewSpot.description}
                                </p>
                            </div>
                        )}

                        {/* Community Insights (AI) */}
                        {brewSpot.aiMeta?.tags && brewSpot.aiMeta.tags.length > 0 && (
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-blue-100">
                                <h3 className="text-sm font-bold font-heading text-blue-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <span className="text-lg">✨</span> Community Highlights
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {brewSpot.aiMeta.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white text-blue-700 border border-blue-200 rounded-full text-sm font-medium shadow-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-blue-400 mt-2 italic">
                                    *Generated by AI based on reviews & description
                                </p>
                            </div>
                        )}

                        {/* Standard Highlights (Tags from Creator) */}
                        {(brewSpot.tags && brewSpot.tags.length > 0) && (
                            <div>
                                <h3 className="text-sm font-bold font-heading text-neutral/50 mb-3 uppercase tracking-wider">Creator Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {brewSpot.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-neutral/5 text-neutral border border-neutral/10 rounded-full text-sm font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Facilities & Price */}
                        <div>
                            <h3 className="text-sm font-bold font-heading text-neutral/50 mb-3 uppercase tracking-wider">Amenities & Price</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium capitalize text-neutral">
                                    {brewSpot.price_range} price
                                </span>
                                {brewSpot.facilities?.map(facility => (
                                    <span key={facility} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium capitalize">
                                        {facility}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Reviews Section */}
                    {brewSpot.ai_summary && (
                        <VibeCheckCard summary={brewSpot.ai_summary} />
                    )}
                    <BrewSpotReviews brewspotId={brewSpot.id} brewspotName={brewSpot.name} />
                </div>

                <div className="space-y-6">
                    {/* Map Widget */}
                    <Card className="p-0 overflow-hidden h-[300px] relative">
                        <BrewSpotMap
                            spots={[brewSpot]}
                            center={[brewSpot.latitude, brewSpot.longitude]}
                            zoom={15}
                            interactive={false} // Static map
                            className="w-full h-full"
                        />
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${brewSpot.latitude},${brewSpot.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-4 left-4 right-4 z-[400]"
                        >
                            <Button className="w-full shadow-lg" size="sm">
                                Get Directions
                            </Button>
                        </a>
                    </Card>

                    {/* Top Visitors */}
                    <TopVisitorsList brewSpotId={brewSpot.id} />
                </div>
            </div>
        </Container>
    )
}
