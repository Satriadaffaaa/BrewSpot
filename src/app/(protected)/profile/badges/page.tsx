'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { BadgeList } from '@/components/gamification/BadgeList'
import { getUserProfile } from '@/features/gamification/api'
import { UserProfile } from '@/features/gamification/types'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

export default function BadgesPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login')
            return;
        }

        if (user) {
            getUserProfile(user.uid).then(profile => {
                setUserProfile(profile)
                setLoading(false)
            })
        }
    }, [user, authLoading, router])

    if (authLoading || loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <Container className="py-12">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="mb-4 pl-0 hover:bg-transparent hover:text-primary"
                >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Profile
                </Button>

                <h1 className="text-3xl font-heading font-bold text-neutral mb-2">
                    Your Achievements
                </h1>
                <p className="text-neutral/60">
                    Track your progress towards becoming a BrewSpot legend.
                </p>
            </div>

            <Card className="p-6">
                <BadgeList
                    badgeIds={userProfile?.badges || []}
                    userStats={userProfile?.stats}
                    variant="full"
                />
            </Card>
        </Container>
    )
}
