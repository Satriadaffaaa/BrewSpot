'use client'

import { useState } from 'react'
import { AddReviewForm } from '@/components/reviews/AddReviewForm'
import { ReviewList } from '@/components/reviews/ReviewList'
import { useReviews } from '@/features/reviews/hooks'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/providers/AuthProvider'
import { Review } from '@/features/brewspot/types'

interface BrewSpotReviewsProps {
    brewspotId: string
    brewspotName?: string
}

export function BrewSpotReviews({ brewspotId, brewspotName }: BrewSpotReviewsProps) {
    const { reviews, loading, error, refreshReviews } = useReviews(brewspotId)
    const { user } = useAuth()
    const [showForm, setShowForm] = useState(false)
    const [editingReview, setEditingReview] = useState<Review | null>(null)

    const userReview = user ? reviews.find(r => r.userId === user.uid) : null

    const handleEdit = (review: Review) => {
        setEditingReview(review)
        setShowForm(true)
        window.scrollTo({ top: document.getElementById('reviews')?.offsetTop || 0, behavior: 'smooth' })
    }

    const handleFormSuccess = () => {
        setShowForm(false)
        setEditingReview(null)
        refreshReviews()
    }

    const handleFormCancel = () => {
        setShowForm(false)
        setEditingReview(null)
    }

    return (
        <div className="space-y-8" id="reviews">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-heading text-primary">
                    Reviews ({reviews.length})
                </h2>
                {user && !userReview && !showForm && (
                    <Button onClick={() => setShowForm(true)} variant="outline">
                        Tulis Review
                    </Button>
                )}
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                    <p className="font-bold mb-1">Error fetching reviews</p>
                    <p className="text-sm">{error}</p>
                    <p className="text-xs mt-2 text-red-500">Ensure Firestore Index exists for 'reviews' collection.</p>
                </div>
            )}

            {showForm && (
                <div className="mb-8 animate-fade-in">
                    <AddReviewForm
                        brewspotId={brewspotId}
                        brewspotName={brewspotName}
                        initialData={editingReview || undefined}
                        onSuccess={handleFormSuccess}
                        onCancel={handleFormCancel}
                    />
                </div>
            )}

            {!showForm && userReview && !editingReview && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-sm text-primary mb-6 flex justify-between items-center">
                    <span>Kamu sudah me-review tempat ini.</span>
                    <button
                        onClick={() => handleEdit(userReview)}
                        className="text-xs underline font-bold hover:text-primary/80"
                    >
                        Edit Review Saya
                    </button>
                </div>
            )}

            <ReviewList
                reviews={reviews}
                isLoading={loading}
                onReviewDeleted={refreshReviews}
                onEdit={handleEdit}
            />
        </div>
    )
}
