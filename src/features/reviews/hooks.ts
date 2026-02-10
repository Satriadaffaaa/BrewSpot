import { useState, useEffect } from 'react';
import { Review, ReviewInput } from '@/features/brewspot/types';
import { getReviews, addReview, updateReview } from './api';

export function useReviews(brewspotId: string) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await getReviews(brewspotId);
            setReviews(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (brewspotId) {
            fetchReviews();
        }
    }, [brewspotId]);

    return { reviews, loading, error, refreshReviews: fetchReviews };
}

export function useAddReview(brewspotId: string) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitReview = async (input: ReviewInput, brewspotName?: string) => {
        try {
            setLoading(true);
            setError(null);
            await addReview(brewspotId, input, brewspotName);
            return true;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to submit review');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { submitReview, loading, error };
}

export function useUpdateReview() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const editReview = async (reviewId: string, input: { rating: number, opinion: string, newPhotos: File[], existingPhotoUrls: string[], videoUrl?: string }, brewspotName?: string) => {
        try {
            setLoading(true);
            setError(null);
            await updateReview(reviewId, input, brewspotName);
            return true;
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to update review');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { editReview, loading, error };
}
