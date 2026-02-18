'use client'

import { useParams } from 'next/navigation'
import { useBrewSpot } from '@/features/brewspot/hooks'
import { deleteBrewSpot } from '@/features/brewspot/api'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { MapPinIcon, StarIcon, ArrowLeftIcon, PencilSquareIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline'
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
                        <h1 className="text-2xl md:text-4xl font-heading font-bold text-primary">{brewSpot.name}</h1>
                        {/* Hero Tags (Top 3) */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(brewSpot.aiMeta?.tags || brewSpot.tags).slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-xs md:text-sm font-medium text-primary/80 bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10">
                                    ✨ {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-start md:self-auto mt-4 md:mt-0">
                        {/* Rating Badge */}
                        {brewSpot.rating && (
                            <div className="flex items-center gap-1.5 bg-accent/10 text-accent-content px-2 py-1 md:px-3 md:py-1.5 rounded-full">
                                <StarIcon className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                                <span className="font-bold text-base md:text-lg">{brewSpot.rating.toFixed(1)}</span>
                                <span className="text-xs md:text-sm opacity-75">({brewSpot.reviews_count})</span>
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
                                        <PencilSquareIcon className="w-5 h-5 md:w-6 md:h-6" />
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
                                    <TrashIcon className="w-5 h-5 md:w-6 md:h-6" />
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
                                <FlagIcon className="w-5 h-5 md:w-6 md:h-6" />
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
                    {/* Photo Gallery - Mosaic Layout */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 h-[300px] md:h-[450px]">
                            {/* Main Image - Takes 3/4 width on desktop */}
                            <div className="md:col-span-3 h-full relative group overflow-hidden rounded-2xl shadow-sm">
                                {displayPhotos.length > 0 ? (
                                    <img src={displayPhotos[0]} alt={brewSpot.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full bg-secondary/20 flex items-center justify-center text-neutral/30">
                                        <span className="text-6xl">☕</span>
                                    </div>
                                )}
                            </div>

                            {/* Side Images - Vertical Stack */}
                            <div className="hidden md:flex flex-col gap-2 md:gap-4 h-full">
                                <div className="flex-1 relative overflow-hidden rounded-2xl shadow-sm group">
                                    {displayPhotos[1] ? (
                                        <img src={displayPhotos[1]} alt={brewSpot.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full bg-secondary/20" />
                                    )}
                                </div>
                                <div className="flex-1 relative overflow-hidden rounded-2xl shadow-sm group">
                                    {displayPhotos[2] ? (
                                        <img src={displayPhotos[2]} alt={brewSpot.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full bg-secondary/20" />
                                    )}
                                    {displayPhotos.length > 3 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg backdrop-blur-[2px]">
                                            +{displayPhotos.length - 3}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Video */}
                    {brewSpot.videoUrl && (
                        <div className="rounded-2xl overflow-hidden border-4 border-white shadow-lg rotate-1 hover:rotate-0 transition-transform duration-300">
                            <SocialVideoEmbed url={brewSpot.videoUrl} />
                        </div>
                    )}

                    {/* About / Facilities */}
                    <Card className="p-8 space-y-8 bg-surface/50 backdrop-blur-sm border-none shadow-card">
                        {/* Description / Founder's Note */}
                        {brewSpot.description && (
                            <div className="relative pl-6 border-l-4 border-accent/30">
                                <h3 className="text-xl font-bold font-heading mb-3 text-primary">Founder's Note</h3>
                                <p className="text-neutral/80 leading-loose text-lg font-light">
                                    "{brewSpot.description}"
                                </p>
                            </div>
                        )}

                        {/* Community Insights (AI) */}
                        {brewSpot.aiMeta?.tags && brewSpot.aiMeta.tags.length > 0 && (
                            <div className="mb-8 p-6 bg-white rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-50" />
                                <div className="relative z-10">
                                    <h3 className="text-sm font-bold font-heading text-indigo-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                                        <SparklesIcon className="w-4 h-4 text-indigo-500" /> Community Highlights
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {brewSpot.aiMeta.tags.map(tag => (
                                            <span key={tag} className="px-4 py-1.5 bg-white text-indigo-600 border border-indigo-100 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-indigo-400 mt-3 font-medium uppercase tracking-wider">
                                        AI-Generated based on user reviews
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-dashed border-neutral/10">
                            {/* Standard Highlights (Tags from Creator) */}
                            {(brewSpot.tags && brewSpot.tags.length > 0) && (
                                <div>
                                    <h3 className="text-xs font-bold font-heading text-neutral/40 mb-4 uppercase tracking-widest">Vibe Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {brewSpot.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-neutral/5 text-neutral-600 border border-neutral/10 rounded-lg text-sm font-medium">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Facilities & Price */}
                            <div>
                                <h3 className="text-xs font-bold font-heading text-neutral/40 mb-4 uppercase tracking-widest">Amenities</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-sm font-bold capitalize">
                                        {brewSpot.price_range} price
                                    </span>
                                    {brewSpot.facilities?.map(facility => (
                                        <span key={facility} className="px-3 py-1 bg-secondary/30 text-primary-dark border border-secondary/50 rounded-lg text-sm font-medium capitalize flex items-center gap-1.5">
                                            <span>✓</span> {facility}
                                        </span>
                                    ))}
                                </div>
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
                    {/* Operational Hours */}
                    {brewSpot.weekly_hours && (
                        <Card className="p-5 border border-dashed border-primary/20 relative overflow-hidden bg-white/60 backdrop-blur-sm group hover:border-primary/40 transition-colors">
                            <h3 className="font-heading font-bold text-primary mb-3 flex items-center justify-between relative z-10">
                                <span className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Opening Hours
                                </span>
                                {/* Add status badge in header */}
                                {(() => {
                                    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
                                    const day = days[new Date().getDay()];
                                    const schedule = brewSpot.weekly_hours[day];
                                    if (schedule?.isOpen) {
                                        const now = new Date();
                                        const current = now.getHours() * 60 + now.getMinutes();
                                        const [h1, m1] = schedule.openTime.split(':').map(Number);
                                        const [h2, m2] = schedule.closeTime.split(':').map(Number);
                                        const start = h1 * 60 + m1;
                                        const end = h2 * 60 + m2;
                                        if (current >= start && current < end) return <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full tracking-wider animate-pulse">Open Now</span>
                                    }
                                    return <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full tracking-wider">Closed</span>
                                })()}
                            </h3>
                            <div className="space-y-2 relative z-10 mt-4">
                                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                                    const schedule = brewSpot.weekly_hours![day];
                                    const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;

                                    return (
                                        <div key={day} className={`flex justify-between items-center text-sm ${isToday ? 'font-bold text-primary bg-primary/5 -mx-2 px-2 py-1 rounded' : 'text-neutral/70'}`}>
                                            <span className="capitalize w-24">{day.slice(0, 3)}</span>
                                            {schedule?.isOpen ? (
                                                <span className="font-mono">{schedule.openTime} - {schedule.closeTime}</span>
                                            ) : (
                                                <span className="text-red-400 font-medium text-xs">Closed</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}

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
