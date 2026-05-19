
'use client'

import { AdminBrewSpot } from '@/features/admin/types';
import { useBrewSpotActions } from '@/features/admin/hooks';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { AdminMap } from './AdminMap';
import { useRouter } from 'next/navigation';

export function SpotReviewDetail({ spot }: { spot: AdminBrewSpot }) {
    const { approve, reject, processing, error } = useBrewSpotActions();
    const router = useRouter();

    const handleApprove = async () => {
        if (!confirm("Are you sure you want to APPROVE this BrewSpot? It will be publicly visible.")) return;
        try {
            await approve(spot.id);
            router.push('/admin/spots');
            router.refresh();
        } catch (e) {
            // Error managed by hook
        }
    };

    const handleReject = async () => {
        if (!confirm("Are you sure you want to REJECT this BrewSpot?")) return;
        try {
            await reject(spot.id);
            router.push('/admin/spots');
            router.refresh();
        } catch (e) {
            // Error managed by hook
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-primary">{spot.name}</h1>
                    <p className="text-sm text-gray-500">Submitted by: {spot.user_id}</p>
                    <p className="text-sm text-gray-500">On: {new Date(spot.created_at).toLocaleString()}</p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        variant="outline"
                        className="border-red-600 text-red-600 hover:bg-red-50"
                        onClick={handleReject}
                        isLoading={processing}
                        disabled={processing}
                    >
                        Reject
                    </Button>
                    <Button
                        onClick={handleApprove}
                        isLoading={processing}
                        disabled={processing}
                    >
                        Approve
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md">
                    {error}
                </div>
            )}

            {/* Content Sections */}
            <div className="grid grid-cols-1 gap-6">
                {/* Description & Tags */}
                <Card className="p-5 space-y-4">
                    <h3 className="text-lg font-medium text-primary">About this Spot</h3>

                    {spot.description ? (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Founder's Note</label>
                            <p className="mt-2 text-sm text-primary whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded-xl border border-border">
                                {spot.description}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">No description provided.</p>
                    )}

                    {(spot.tags && spot.tags.length > 0) && (
                        <div>
                            <label className="text-sm font-medium text-gray-500">Highlights</label>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {spot.tags.map(tag => (
                                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Photos Gallery */}
                <Card className="p-5">
                    <h3 className="text-lg font-medium text-primary mb-4">Photo Gallery ({spot.photos?.length || 0})</h3>
                    {spot.photos && spot.photos.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {spot.photos.map((photo, index) => (
                                <div key={index} className="aspect-square relative rounded-xl overflow-hidden border border-border group">
                                    <img
                                        src={photo}
                                        alt={`${spot.name} photo ${index + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        width={400}
                                        height={400}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-border">
                            <p className="text-gray-500">No photos uploaded</p>
                        </div>
                    )}
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-5 space-y-4">
                    <h3 className="text-lg font-medium text-primary">Location & Amenities</h3>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="mt-1 text-sm text-primary">{spot.address}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="mt-1 text-sm text-primary">{spot.city}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Price Range</label>
                        <p className="mt-1 text-sm text-primary capitalize">{spot.price_range}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Facilities</label>
                        <div className="mt-1 flex flex-wrap gap-2">
                            {spot.facilities.map(f => (
                                <span key={f} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {f}
                                </span>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card className="p-0 overflow-hidden min-h-[300px]">
                    <AdminMap latitude={spot.latitude} longitude={spot.longitude} className="h-full w-full" />
                </Card>
            </div>
        </div>
    );
}

