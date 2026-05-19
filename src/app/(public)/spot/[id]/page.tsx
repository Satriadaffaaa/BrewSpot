'use client'

import { useParams } from 'next/navigation'
import { BrewSpot } from '@/features/brewspot/types'
import { getPriceLabel } from '@/utils/price'
import { useBrewSpot } from '@/features/brewspot/hooks'
import { deleteBrewSpot } from '@/features/brewspot/api'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { MapPinIcon, StarIcon, ArrowLeftIcon, PencilSquareIcon, TrashIcon, SparklesIcon, BanknotesIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { LikeButton } from '@/components/common/LikeButton'
import { SocialVideoEmbed } from '@/components/common/SocialVideoEmbed'
import { cn } from '@/lib/utils'

import { BrewSpotReviews } from '@/components/brewspot/BrewSpotReviews'
import { ReportDialog } from '@/components/common/ReportDialog'
import { ClaimSpotModal } from '@/components/brewspot/ClaimSpotModal'
import { FlagIcon, CheckBadgeIcon } from '@heroicons/react/24/outline'
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

    const { user, profile } = useAuth()
    const { brewSpot, loading, error } = useBrewSpot(id as string)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false)
    const [route, setRoute] = useState<[number, number][] | null>(null)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

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

    const handleFindRoute = async () => {
        if (!brewSpot) return;

        setIsCalculatingRoute(true);
        
        if (!navigator.geolocation) {
            Toast.fire({ icon: 'error', title: 'Geolocation tidak didukung browser ini' });
            setIsCalculatingRoute(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const spotLat = brewSpot.latitude;
                const spotLng = brewSpot.longitude;

                try {
                    // OSRM Public API for driving route
                    const response = await fetch(
                        `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${spotLng},${spotLat}?overview=full&geometries=geojson`
                    );
                    const data = await response.json();

                    if (data.routes && data.routes.length > 0) {
                        const coords = data.routes[0].geometry.coordinates as [number, number][];
                        setRoute(coords);
                        setUserLocation([userLat, userLng]);
                        Toast.fire({
                            icon: 'success',
                            title: 'Rute ditemukan! Lihat pada peta di bawah.'
                        });
                    } else {
                        throw new Error('No route found');
                    }
                } catch (err) {
                    console.error('Routing error:', err);
                    Toast.fire({ icon: 'error', title: 'Gagal mendapatkan rute' });
                } finally {
                    setIsCalculatingRoute(false);
                }
            },
            (err) => {
                console.error('Geolocation error:', err);
                Toast.fire({ icon: 'error', title: 'Gagal mendapatkan lokasi kamu' });
                setIsCalculatingRoute(false);
            }
        );
    };

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
                <h1 className="text-2xl font-bold text-neutral mb-4">Spot Tidak Ditemukan</h1>
                <p className="text-neutral/70 mb-6">{error || "Tempat yang kamu cari tidak ditemukan."}</p>
                <Link href="/explore">
                    <Button variant="outline">Kembali Jelajah</Button>
                </Link>
            </Container>
        )
    }

    const isVerified = brewSpot.isOfficial || brewSpot.verificationStatus === 'verified'
    const displayPhotos = (isVerified && brewSpot.officialPhotos && brewSpot.officialPhotos.length > 0)
        ? brewSpot.officialPhotos
        : (brewSpot.photos && brewSpot.photos.length > 0 ? brewSpot.photos : (brewSpot.image_url ? [brewSpot.image_url] : []))
    
    // Explicitly check for truthy strings to avoid "" or null issues
    const activeMenuUrl = (brewSpot.officialMenuUrl && brewSpot.officialMenuUrl.trim() !== "") 
        ? brewSpot.officialMenuUrl 
        : (brewSpot.menuUrl && brewSpot.menuUrl.trim() !== "" ? brewSpot.menuUrl : null);

    return (
        <Container className="pt-28 pb-8 space-y-8">
            <div>
                <Link href="/explore" className="inline-flex items-center text-sm text-neutral/50 hover:text-primary mb-4 transition-colors">
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                    Kembali Jelajah
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl md:text-4xl font-heading font-bold text-primary">{brewSpot.name}</h1>
                            {(brewSpot.isOfficial || brewSpot.verificationStatus === 'verified') && (
                                <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 animate-fade-in" title="Halaman Resmi Terverifikasi">
                                    <CheckBadgeIcon className="w-5 h-5" />
                                    <span className="text-xs font-black uppercase tracking-widest hidden md:inline">Terverifikasi</span>
                                </div>
                            )}
                        </div>
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
                        {/* Price Label */}
                        {brewSpot.price_range && (
                            <div className="flex items-center gap-3 text-neutral/80 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <BanknotesIcon className="w-5 h-5 text-green-600" />
                                <span className="font-medium">{getPriceLabel(brewSpot.price_range)}</span>
                            </div>
                        )}

                        {/* Menu Button */}
                        {activeMenuUrl && (
                            <button
                                onClick={() => {
                                    const url = activeMenuUrl || '';
                                    const isCloudinary = url.includes('cloudinary');
                                    const isPdf = url.toLowerCase().endsWith('.pdf');

                                    if (isCloudinary && !isPdf) {
                                        // Image: show in lightbox
                                        AdminSwal.fire({
                                            imageUrl: url,
                                            imageAlt: `${brewSpot.name} Menu`,
                                            showConfirmButton: false,
                                            showCloseButton: true,
                                            width: '90%',
                                            padding: '1em',
                                            background: '#fff',
                                            backdrop: 'rgba(0,0,0,0.8)'
                                        });
                                    } else {
                                        // PDF or External link: show iframe in modal
                                        AdminSwal.fire({
                                            title: `Menu - ${brewSpot.name}`,
                                            html: `
                                                <div style="width: 100%; height: 75vh; position: relative;">
                                                    <iframe src="${url}" style="width: 100%; height: 100%; border: none; border-radius: 8px;"></iframe>
                                                </div>
                                                <div style="margin-top: 1rem; font-size: 0.875rem; color: #6b7280;">
                                                    Jika menu tidak muncul, <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #4f46e5; font-weight: 500; text-decoration: underline;">klik di sini untuk membuka di tab baru</a>.
                                                </div>
                                            `,
                                            showConfirmButton: false,
                                            showCloseButton: true,
                                            width: '90%',
                                            padding: '1.5em',
                                            background: '#ffffff',
                                            backdrop: 'rgba(0,0,0,0.8)',
                                            customClass: {
                                                popup: 'rounded-2xl',
                                                title: 'text-xl font-bold font-heading mb-4 text-left'
                                            }
                                        });
                                    }
                                }}
                                className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-medium text-sm hover:bg-orange-100 transition-colors border border-orange-100"
                            >
                                <BookOpenIcon className="w-5 h-5" />
                                <span>Lihat Menu</span>
                            </button>
                        )}
                        <LikeButton brewspotId={brewSpot.id} />
                        <CheckInButton
                            brewSpotId={brewSpot.id}
                            brewSpotLocation={brewSpot ? { lat: brewSpot.latitude, lng: brewSpot.longitude } : undefined}
                        />
                        {/* Internal route button removed from header as requested to be over map */}

                        {/* Owner Actions */}
                        {user?.uid === brewSpot.user_id && (
                            <>
                                <Link href={`/edit-spot/${brewSpot.id}`}>
                                    <button className="p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-primary/10" title="Edit Spot">
                                        <PencilSquareIcon className="w-5 h-5 md:w-6 md:h-6" />
                                    </button>
                                </Link>
                                <button
                                    onClick={async () => {
                                        const result = await AdminSwal.fire({
                                            title: 'Hapus Spot?',
                                            text: "Kamu tidak akan bisa mengembalikan ini!",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonText: 'Ya, hapus!',
                                            cancelButtonText: 'Batal',
                                            reverseButtons: true
                                        })

                                        if (result.isConfirmed) {
                                            try {
                                                await deleteBrewSpot(brewSpot.id)
                                                await Toast.fire({
                                                    icon: 'success',
                                                    title: 'Spot berhasil dihapus'
                                                })
                                                window.location.href = '/explore'
                                            } catch (e) {
                                                AdminSwal.fire('Error', 'Gagal menghapus', 'error')
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

                        {/* Claim Spot Button (For Owners only, if unclaimed) */}
                        {!brewSpot.isOfficial && profile?.role === 'owner' && (
                            <Button 
                                variant="outline" 
                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold"
                                onClick={() => setIsClaimModalOpen(true)}
                            >
                                <CheckBadgeIcon className="w-5 h-5 mr-2" />
                                Klaim Tempat Ini
                            </Button>
                        )}

                        {/* Report Button */}
                        {user && (
                            <button
                                onClick={() => setIsReportOpen(true)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                                title="Laporkan tempat ini"
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
                                        <span className="text-6xl">📍</span>
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
                                <h3 className="text-xl font-bold font-heading mb-3 text-primary">Catatan Pemilik</h3>
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
                                        <SparklesIcon className="w-4 h-4 text-indigo-500" /> Sorotan Komunitas
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {brewSpot.aiMeta.tags.map(tag => (
                                            <span key={tag} className="px-4 py-1.5 bg-white text-indigo-600 border border-indigo-100 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-indigo-400 mt-3 font-medium uppercase tracking-wider">
                                        Dihasilkan AI berdasarkan ulasan pengguna
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-dashed border-neutral/10">
                            {/* Standard Highlights (Tags from Creator) */}
                            {(brewSpot.tags && brewSpot.tags.length > 0) && (
                                <div>
                                    <h3 className="text-xs font-bold font-heading text-neutral/40 mb-4 uppercase tracking-widest">Tag Suasana</h3>
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
                                <h3 className="text-xs font-bold font-heading text-neutral/40 mb-4 uppercase tracking-widest">Fasilitas</h3>
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-lg text-sm font-bold capitalize">
                                        {getPriceLabel(brewSpot.price_range)}
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
                                    Jam Operasional
                                </span>
                                {/* Add status badge in header */}
                                {mounted ? (() => {
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
                                        if (current >= start && current < end) return <span className="text-[10px] uppercase font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full tracking-wider animate-pulse">Buka Sekarang</span>
                                    }
                                    return <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full tracking-wider">Tutup</span>
                                })() : null}
                            </h3>
                            <div className="space-y-2 relative z-10 mt-4">
                                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => {
                                    const schedule = brewSpot.weekly_hours![day];
                                    const isToday = mounted && new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;

                                    return (
                                        <div key={day} className={`flex justify-between items-center text-sm ${isToday ? 'font-bold text-primary bg-primary/5 -mx-2 px-2 py-1 rounded' : 'text-neutral/70'}`}>
                                            <span className="capitalize w-24">{day.slice(0, 3)}</span>
                                            {schedule?.isOpen ? (
                                                <span className="font-mono">{schedule.openTime} - {schedule.closeTime}</span>
                                            ) : (
                                                <span className="text-red-400 font-medium text-xs">Tutup</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}

                    {/* Map Widget */}
                    <Card className="p-0 overflow-hidden h-[300px] relative z-0">
                        <BrewSpotMap
                            spots={[brewSpot]}
                            center={[brewSpot.latitude, brewSpot.longitude]}
                            zoom={15}
                            interactive={true} 
                            routeCoordinates={route || undefined}
                            userLocation={userLocation}
                            className="w-full h-full"
                        />
                        {/* Custom Route Overlay Buttons */}
                        <div className="absolute bottom-4 left-4 right-4 z-[400] flex flex-col gap-2">
                            <Button 
                                onClick={route ? () => { setRoute(null); setUserLocation(null); } : handleFindRoute} 
                                className={cn(
                                    "w-full shadow-lg font-bold text-xs h-10",
                                    route ? "bg-neutral-800 hover:bg-neutral-900 text-white" : "bg-white hover:bg-gray-50 text-neutral-800 border-none"
                                )}
                                isLoading={isCalculatingRoute}
                            >
                                <MapPinIcon className="w-4 h-4 mr-2" />
                                {route ? 'Hapus Rute' : 'Lihat Rute Di Sini'}
                            </Button>
                            
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${brewSpot.latitude},${brewSpot.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button 
                                    className="w-full shadow-lg font-bold text-xs h-10 bg-accent hover:bg-accent-dark text-white border-none"
                                >
                                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                    </svg>
                                    Buka Google Maps
                                </Button>
                            </a>
                        </div>
                    </Card>

                    {/* Top Visitors */}
                    <TopVisitorsList brewSpotId={brewSpot.id} />
                </div>
            </div>

            {/* Modals */}
            <ClaimSpotModal
                isOpen={isClaimModalOpen}
                onClose={() => setIsClaimModalOpen(false)}
                spotId={brewSpot.id}
                spotName={brewSpot.name}
                userId={user?.uid || ''}
            />
        </Container>
    )
}
