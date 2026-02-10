
import { useState, useEffect, useCallback } from 'react';
import { AdminBrewSpot } from './types';
import { getPendingBrewSpots, approveBrewSpot, rejectBrewSpot, getAdminBrewSpotById } from './api';

export function usePendingBrewSpots() {
    const [spots, setSpots] = useState<AdminBrewSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSpots = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getPendingBrewSpots();
            setSpots(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch pending applications.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSpots();
    }, [fetchSpots]);

    return { spots, loading, error, refetch: fetchSpots };
}

export function useAdminBrewSpot(id: string) {
    const [spot, setSpot] = useState<AdminBrewSpot | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSpot = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await getAdminBrewSpotById(id);
            setSpot(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch detail.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchSpot();
    }, [fetchSpot]);

    return { spot, loading, error, refetch: fetchSpot };
}

export function useBrewSpotActions() {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const approve = async (id: string) => {
        setProcessing(true);
        setError(null);
        try {
            await approveBrewSpot(id);
        } catch (err: any) {
            setError(err.message || "Failed to approve.");
            throw err;
        } finally {
            setProcessing(false);
        }
    };

    const reject = async (id: string) => {
        setProcessing(true);
        setError(null);
        try {
            await rejectBrewSpot(id);
        } catch (err: any) {
            setError(err.message || "Failed to reject.");
            throw err;
        } finally {
            setProcessing(false);
        }
    };

    return { approve, reject, processing, error };
}
