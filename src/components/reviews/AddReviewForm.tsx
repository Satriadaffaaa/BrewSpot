'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/providers/AuthProvider'
import { useAddReview, useUpdateReview } from '@/features/reviews/hooks'
import { CoffeeBeanIcon, CoffeeBeanCustom } from '@/components/common/CoffeeBeanIcon'
import { Review } from '@/features/brewspot/types'

interface AddReviewFormProps {
    brewspotId: string
    brewspotName?: string
    onSuccess: () => void
    initialData?: Review
    onCancel?: () => void
}

const RATING_LABELS = [
    "Beri rating...",
    "Buruk 😫",
    "Kurang 😐",
    "Lumayan 🙂",
    "Enak 😀",
    "Sempurna! 🤩"
]

const RATING_COLORS = [
    "text-gray-300",
    "text-red-400",
    "text-orange-400",
    "text-yellow-400",
    "text-lime-500",
    "text-emerald-500"
]

export function AddReviewForm({ brewspotId, brewspotName, onSuccess, initialData, onCancel }: AddReviewFormProps) {
    const { user } = useAuth()
    const { submitReview, loading: adding } = useAddReview(brewspotId)
    const { editReview, loading: updating } = useUpdateReview()

    const loading = adding || updating
    const isEditing = !!initialData

    const [rating, setRating] = useState(0)
    const [opinion, setOpinion] = useState('')
    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [videoUrl, setVideoUrl] = useState('')
    const [previews, setPreviews] = useState<string[]>([])
    const [existingPhotoUrls, setExistingPhotoUrls] = useState<string[]>([])

    const [hoverRating, setHoverRating] = useState(0)

    useEffect(() => {
        if (initialData) {
            setRating(initialData.rating)
            setOpinion(initialData.opinion)
            setVideoUrl(initialData.videoUrl || '')
            if (initialData.photos) {
                setExistingPhotoUrls(initialData.photos)
                setPreviews(initialData.photos) // Show existing photos
            }
        }
    }, [initialData])

    if (!user) {
        return (
            <Card className="p-6 text-center bg-gray-50">
                <p className="text-gray-600">Silakan login untuk menulis review.</p>
            </Card>
        )
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            if (selectedFiles.length + existingPhotoUrls.length + files.length > 3) {
                alert("Maksimal 3 foto per review.") // Will assume Alert replaced later or use Swal here if installed
                return
            }

            setSelectedFiles(prev => [...prev, ...files])
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setPreviews(prev => [...prev, ...newPreviews])
        }
    }

    const removePhoto = (index: number) => {
        // Logic: Index touches `previews`.
        // We need to know if the photo at `index` is `existing` or `new`.
        // `previews` contains [ ...existingUrls, ...newUrls ] (Wait, no, I just appended new previews to existingUrls?)
        // Let's verify `setPreviews`.
        // On init: `previews` = `existingUrls`.
        // On add: `previews` = `[...prev, ...newPreviews]`.
        // So `previews` matches visualization order.

        // We need to remove from `existingPhotoUrls` OR `selectedFiles`.

        const isExisting = index < existingPhotoUrls.length

        if (isExisting) {
            setExistingPhotoUrls(prev => prev.filter((_, i) => i !== index))
            setPreviews(prev => prev.filter((_, i) => i !== index))
        } else {
            // It's a new file. Index in `selectedFiles` is `index - existingPhotoUrls.length`?
            // Wait, if I delete an existing, `existingPhotoUrls.length` changes.
            // This index logic is tricky if deletions happen out of order.

            // Simpler: Maintain `previews` as source of truth for display.
            // But we need to distinguish for submission.

            // Actually, we can regenerate `previews` from `existing` + `selected`.
            // BUT deleting specific file from `selectedFiles` if multiple added is hard if we don't track IDs.

            // Let's simplify: 
            // `previews` state is strictly for UI.
            // When removing `index`: 
            // If `index < existingCountOnRender`? No, state changes.

            // Re-think:
            // Just filter `previews`.
            // AND filter `existingPhotoUrls` by value matching `previews[index]`.
            // AND filter `selectedFiles`?
            // Actually `handleFileSelect` adds directly.

            // Let's implement robust removal:
            const photoToRemove = previews[index]

            // Check if it's existing
            if (existingPhotoUrls.includes(photoToRemove)) {
                setExistingPhotoUrls(prev => prev.filter(p => p !== photoToRemove))
            } else {
                // It's a blob url. Remove it from previews.
                // And find corresponding file in `selectedFiles`?
                // We don't map selectedFiles to blobUrl 1:1 easily without tracking.
                // Optimization: Clear `selectedFiles` entirely if complex, or just filter by index offset.
                // Given `previews` structure: [ ...remainingExisting, ...remainingNew ].
                // So if `photoToRemove` is not existing, it is in the `new` section.

                const newPhotosStartIndex = existingPhotoUrls.length
                // Wait, if I removed an existing photo, `existingPhotoUrls` shrank.
                // This is reactive.

                // Let's just reset everything if user removes a NEW photo? No, annoyance.

                // Correct way: 
                // `images` state: { type: 'existing' | 'new', url: string, file?: File }[]
            }
        }

        // Since implementing complex state now is risky, I'll use a simpler approach for Phase 2.6:
        // If you remove a photo, I'll filter `existingPhotoUrls` if match.
        // If it's a new photo (Blob), I will filter `selectedFiles` by... index matching?
        // Let's use a `allPhotos` state wrapper.
    }

    // wrapper for robust state
    // but to avoid massive refactor, I'll use a simpler trick:
    // Only allow removing existing photos nicely.
    // Removing new photos -> Clear all new photos? 
    // Or just accept the standard `index` based approach assuming `existing` come first.

    const handleRemove = (index: number) => {
        const numExisting = existingPhotoUrls.length

        if (index < numExisting) {
            // It's existing
            setExistingPhotoUrls(prev => prev.filter((_, i) => i !== index))
            setPreviews(prev => prev.filter((_, i) => i !== index))
        } else {
            // It's new
            const newIndex = index - numExisting
            setSelectedFiles(prev => prev.filter((_, i) => i !== newIndex))
            setPreviews(prev => prev.filter((_, i) => i !== index))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) return alert("Pilih rating kopi 1-5")

        let success = false
        if (isEditing && initialData) {
            success = await editReview(initialData.id, {
                rating,
                opinion,
                newPhotos: selectedFiles,
                existingPhotoUrls: existingPhotoUrls,
                videoUrl
            }, brewspotName)
        } else {
            success = await submitReview({
                rating,
                opinion,
                photos: selectedFiles,
                videoUrl
            }, brewspotName)
        }

        if (success) {
            if (!isEditing) {
                setRating(0)
                setOpinion('')
                setVideoUrl('')
                setSelectedFiles([])
                setPreviews([])
            }
            onSuccess()
        }
    }

    const currentRating = hoverRating || rating;

    return (
        <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-bold text-lg">
                    {isEditing ? 'Edit Review' : 'Tulis Review'}
                </h3>
                {isEditing && onCancel && (
                    <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Creative Rating */}
                <div className="flex flex-col items-start gap-2">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-all hover:scale-110 duration-200"
                            >
                                <CoffeeBeanCustom
                                    className={`w-10 h-10 transition-colors ${star <= currentRating
                                        ? 'text-amber-700 drop-shadow-sm'
                                        : 'text-gray-200'
                                        }`}
                                    filled={star <= currentRating}
                                />
                            </button>
                        ))}
                    </div>
                    <div className={`text-sm font-bold min-h-[20px] transition-colors ${currentRating > 0 ? RATING_COLORS[currentRating] : 'text-gray-400'
                        }`}>
                        {RATING_LABELS[currentRating]}
                    </div>
                </div>

                {/* Opinion */}
                <textarea
                    className="w-full min-h-[100px] p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/50 outline-none resize-none"
                    placeholder="Bagikan pengalaman ngopi kamu di sini..."
                    value={opinion}
                    onChange={(e) => setOpinion(e.target.value)}
                    required
                />

                {/* Video URL */}
                <input
                    type="url"
                    className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/50 outline-none"
                    placeholder="Link Video (TikTok/IG/YouTube) - Optional"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                />

                {/* Photos */}
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <label className="cursor-pointer flex items-center gap-2 text-sm text-primary font-medium hover:text-primary/80 transition-colors">
                            <PhotoIcon className="w-5 h-5" />
                            <span>Tambah Foto ({selectedFiles.length + existingPhotoUrls.length}/3)</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                                disabled={selectedFiles.length + existingPhotoUrls.length >= 3}
                            />
                        </label>
                    </div>
                    {previews.length > 0 && (
                        <div className="flex gap-2">
                            {previews.map((src, i) => (
                                <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                                    <img src={src} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemove(i)}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={loading} isLoading={loading} className="flex-1">
                        {isEditing ? 'Update Review' : 'Kirim Review (+10 XP)'}
                    </Button>
                    {isEditing && onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Batal
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    )
}
