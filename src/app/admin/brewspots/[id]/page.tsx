
'use client'

import { useParams } from 'next/navigation';
import { useAdminBrewSpot } from '@/features/admin/hooks';
import { SpotReviewDetail } from '@/components/admin/SpotReviewDetail';

export default function AdminBrewSpotDetailPage() {
    const params = useParams();
    const id = (Array.isArray(params.id) ? params.id[0] : params.id) || '';
    const { spot, loading, error } = useAdminBrewSpot(id);

    if (loading) return <div>Loading detail...</div>;
    if (error || !spot) return <div>Error: {error || 'Not found'}</div>;

    return <SpotReviewDetail spot={spot} />;
}
