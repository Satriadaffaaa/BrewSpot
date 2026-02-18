import { Review } from '@/features/brewspot/types'
import { TrashIcon, PencilSquareIcon, FlagIcon } from '@heroicons/react/24/outline'
import { Card } from '@/components/common/Card'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { deleteReview } from '@/features/reviews/api'
import { useState } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { CoffeeBeanCustom } from '@/components/common/CoffeeBeanIcon'
import { ReportDialog } from '@/components/common/ReportDialog'
import { SocialVideoEmbed } from '@/components/common/SocialVideoEmbed'

const MySwal = withReactContent(Swal)

interface ReviewListProps {
    reviews: Review[]
    isLoading: boolean
    onReviewDeleted?: () => void
    onEdit?: (review: Review) => void
    variant?: 'spot' | 'user'
}

export function ReviewList({ reviews, isLoading, onReviewDeleted, onEdit, variant = 'spot' }: ReviewListProps) {
    const { user } = useAuth()
    const router = useRouter()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    // Reporting state
    const [reportReview, setReportReview] = useState<Review | null>(null)

    const handleDelete = async (reviewId: string) => {
        const result = await MySwal.fire({
            title: 'Hapus Review?',
            text: "Review yang dihapus tidak dapat dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#cbd5e1',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        })

        if (!result.isConfirmed) return

        try {
            setDeletingId(reviewId)
            await deleteReview(reviewId)

            await MySwal.fire(
                'Terhapus!',
                'Review kamu telah dihapus.',
                'success'
            )

            if (onReviewDeleted) onReviewDeleted()
        } catch (error) {
            console.error("Failed to delete review", error)
            MySwal.fire(
                'Gagal!',
                'Terjadi kesalahan saat menghapus review.',
                'error'
            )
        } finally {
            setDeletingId(null)
        }
    }

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}
        </div>
    }

    if (reviews.length === 0) {
        return (
            <div className="text-center py-10 bg-neutral/5 rounded-xl border border-dashed border-neutral/20">
                <p className="text-neutral/50">Belum ada review. Jadilah yang pertama!</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {reviews.map(review => (
                <Card
                    key={review.id}
                    className={`p-4 sm:p-6 transition-all hover:shadow-md relative group ${variant === 'user' ? 'cursor-pointer hover:border-primary/50' : ''}`}
                    onClick={() => {
                        if (variant === 'user') {
                            router.push(`/brewspot/${review.brewspotId}`)
                        }
                    }}
                >
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden shadow-sm">
                                {variant === 'user' ? (
                                    <span className="text-xl">☕</span>
                                ) : (
                                    review.userAvatar ? (
                                        <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                                    ) : (
                                        review.userName?.charAt(0).toUpperCase() || 'U'
                                    )
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-neutral truncate max-w-[120px] sm:max-w-none">
                                    {variant === 'user'
                                        ? (review.brewspotName || 'Unknown Spot')
                                        : (review.userName || 'Pengguna BrewSpot')
                                    }
                                </h4>
                                <div className="flex items-center gap-1 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <CoffeeBeanCustom
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? 'text-amber-700' : 'text-neutral/20'}`}
                                            filled={i < review.rating}
                                        />
                                    ))}
                                    <span className="ml-2 text-neutral/40 text-xs text-medium">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions for Owner */}
                        {user && user.uid === review.userId && (
                            <div className="flex gap-1">
                                {onEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onEdit && onEdit(review)
                                        }}
                                        className="text-gray-300 hover:text-blue-500 transition-colors p-2"
                                        title="Edit Review"
                                    >
                                        <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(review.id)
                                    }}
                                    disabled={deletingId === review.id}
                                    className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                    title="Hapus Review"
                                >
                                    {deletingId === review.id ? (
                                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <TrashIcon className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Report Action (Non-Owner) */}
                        {user && user.uid !== review.userId && variant === 'spot' && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setReportReview(review)
                                }}
                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                title="Report Review"
                            >
                                <FlagIcon className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="mt-4 text-neutral/80 leading-relaxed break-words">
                        {review.opinion}
                    </div>

                    {review.videoUrl && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 max-w-md">
                            <SocialVideoEmbed url={review.videoUrl} />
                        </div>
                    )}

                    {review.photos && review.photos.length > 0 && (
                        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                            {review.photos.map((photo, idx) => (
                                <img
                                    key={idx}
                                    src={photo}
                                    alt={`Review by ${review.userName}`}
                                    className="h-24 w-24 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                                />
                            ))}
                        </div>
                    )}
                </Card>
            ))}

            {/* Report Dialog */}
            {reportReview && (
                <ReportDialog
                    isOpen={!!reportReview}
                    onClose={() => setReportReview(null)}
                    targetType="review"
                    targetId={reportReview.id}
                    targetName={`Review by ${reportReview.userName}`}
                />
            )}
        </div>
    )
}
