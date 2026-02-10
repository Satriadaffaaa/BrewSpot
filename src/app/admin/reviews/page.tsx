'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { getAllReviewsForAdmin, toggleReviewVisibility } from '@/features/reviews/api'
import { Review } from '@/features/brewspot/types'
import { EyeIcon, EyeSlashIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { addAdminNote } from '@/features/admin/api'

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchReviews = async () => {
        setIsLoading(true)
        try {
            const data = await getAllReviewsForAdmin(50) // Limit 50 for now
            setReviews(data)
        } catch (error) {
            console.error("Failed to fetch reviews", error)
            AdminSwal.fire('Error', 'Failed to load reviews', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [])

    const handleToggleVisibility = async (review: Review) => {
        const isHiding = !review.isHidden;

        const { value: reason } = await AdminSwal.fire({
            title: isHiding ? 'Hide Review Publicly?' : 'Restore Review?',
            text: isHiding
                ? "This review will not be visible to users. Please provide a reason (internal only)."
                : "This review will be visible to everyone again.",
            input: isHiding ? 'text' : undefined,
            inputPlaceholder: 'Reason for hiding...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: isHiding ? 'Yes, Hide it!' : 'Yes, Restore it!',
            preConfirm: (reason) => {
                if (isHiding && !reason) {
                    AdminSwal.showValidationMessage('Please provide a reason')
                }
                return reason
            }
        })

        if (reason !== undefined || !isHiding) { // If confirmed
            try {
                await toggleReviewVisibility(review.id, isHiding, reason as string);

                // If hiding with reason, let's also log as Admin Note explicitly for easier history
                if (isHiding && reason) {
                    await addAdminNote(review.id, 'review', `Hidden: ${reason}`);
                }

                await fetchReviews(); // Refresh list
                AdminSwal.fire({
                    icon: 'success',
                    title: isHiding ? 'Hidden!' : 'Restored!',
                    text: `The review has been ${isHiding ? 'hidden' : 'restored'}.`,
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error("Failed to toggle visibility", error);
                AdminSwal.fire('Error', 'Failed to update status', 'error');
            }
        }
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-neutral-800">Review Moderation</h1>
                    <p className="text-neutral-500 mt-1">Manage public perception and hide inappropriate content</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-neutral-100/50 border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-100">
                        <thead className="bg-neutral-50/50">
                            <tr>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Author</th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">BrewSpot</th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Rating</th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Content</th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="relative px-6 py-5"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-100">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-8 py-6 whitespace-nowrap">
                                            <div className="h-4 bg-gray-100 rounded animate-pulse w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-24 text-center text-neutral-400">
                                        No reviews found to moderate.
                                    </td>
                                </tr>
                            ) : (
                                reviews.map((review) => (
                                    <tr key={review.id} className={review.isHidden ? 'bg-red-50/30' : 'group hover:bg-neutral-50/50 transition-colors'}>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-neutral-500">
                                            {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 border border-white shadow-sm flex items-center justify-center text-xs font-bold text-neutral-600 overflow-hidden">
                                                    {review.userAvatar ? <img src={review.userAvatar} className="w-full h-full object-cover" /> : (review.userName?.[0] || 'U')}
                                                </div>
                                                <div className="ml-3">
                                                    <div className="text-sm font-bold text-neutral-800">{review.userName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-neutral-600 font-medium max-w-xs truncate">
                                            {review.brewspotName || review.brewspotId}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg w-fit border border-amber-100">
                                                <span className="text-sm font-bold text-amber-600">{review.rating}</span>
                                                <span className="text-amber-400 text-xs">★</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-neutral-500 max-w-md">
                                            <div className="truncate max-w-[200px] font-medium" title={review.opinion}>
                                                "{review.opinion}"
                                            </div>
                                            {review.photos && review.photos.length > 0 && (
                                                <div className="flex gap-1 mt-1.5">
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-600 border border-blue-100">
                                                        {review.photos.length} photos
                                                    </span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            {review.isHidden ? (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-red-50 text-red-600 border border-red-100 items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                    Hidden
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-green-50 text-green-600 border border-green-100 items-center gap-1.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Visible
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleToggleVisibility(review)}
                                                className={`transition-colors flex items-center gap-2 ml-auto px-3 py-1.5 rounded-lg border shadow-sm ${review.isHidden
                                                    ? 'bg-white border-neutral-200 text-neutral-600 hover:text-green-600 hover:border-green-200 hover:bg-green-50'
                                                    : 'bg-white border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
                                                    }`}
                                            >
                                                {review.isHidden ? (
                                                    <>
                                                        <EyeIcon className="h-4 w-4" />
                                                        <span className="font-bold">Restore</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeSlashIcon className="h-4 w-4" />
                                                        <span className="font-bold">Hide</span>
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
