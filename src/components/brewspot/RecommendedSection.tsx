'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { getRecommendedSpots } from '@/features/brewspot/recommendations'
import { BrewSpot } from '@/features/brewspot/types'
import { BrewSpotCard } from './BrewSpotCard'
import { Container } from '@/components/common/Container'
import Link from 'next/link'
import { Button } from '@/components/common/Button'

export function RecommendedSection() {
    const { user, loading: authLoading } = useAuth()
    const [spots, setSpots] = useState<BrewSpot[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (authLoading) return;

        async function fetchRecommendations() {
            try {
                // If no user, we might show "Trending" only? 
                // Or just hide section? 
                // Plan said "if user is logged in".
                if (!user) {
                    setLoading(false);
                    return;
                }

                const data = await getRecommendedSpots(user.uid);
                setSpots(data);
            } catch (error) {
                console.error("Failed to load recommendations", error);
            } finally {
                setLoading(false);
            }
        }

        fetchRecommendations();
    }, [user, authLoading]);

    if (!user || loading || spots.length === 0) return null;

    return (
        <section className="py-12 bg-primary/5">
            <Container>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold font-heading text-primary">Recommended for You</h2>
                        <p className="text-neutral/60 text-sm">Picked based on your taste and location.</p>
                    </div>
                    <Link href="/explore">
                        <Button variant="ghost" size="sm">View All</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {spots.slice(0, 4).map(spot => (
                        <BrewSpotCard key={spot.id} brewSpot={spot} />
                    ))}
                </div>
            </Container>
        </section>
    )
}
