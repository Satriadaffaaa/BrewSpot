'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { ReportReason } from '@/features/admin/types'
import { createReport } from '@/features/reports/api'
import { Button } from '@/components/common/Button'
import Swal from 'sweetalert2'

interface ReportDialogProps {
    isOpen: boolean
    onClose: () => void
    targetType: 'brewspot' | 'review' | 'photo' | 'user'
    targetId: string
    targetName?: string // e.g. "Space Coffee" or "User123"
}

export function ReportDialog({ isOpen, onClose, targetType, targetId, targetName }: ReportDialogProps) {
    const [reason, setReason] = useState<ReportReason | ''>('')
    const [description, setDescription] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!reason) return

        setIsSubmitting(true)
        try {
            await createReport({
                targetType,
                targetId,
                reason: reason as ReportReason,
                description: description
            })

            onClose()
            Swal.fire({
                title: 'Report Submitted',
                text: 'Thank you. Our team will review your report shortly.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            })
        } catch (error: any) {
            console.error("Report failed", error)

            // Check for duplicate error specifically
            if (error.message?.includes("already reported")) {
                Swal.fire('Already Reported', 'You have already reported this content.', 'info')
                onClose()
            } else {
                Swal.fire('Error', 'Failed to submit report. Please try again.', 'error')
            }
        } finally {
            setIsSubmitting(false)
            setReason('')
            setDescription('')
        }
    }

    // Map enum validation to readable labels
    const REASONS = [
        { value: ReportReason.SPAM, label: 'Spam or Advertising' },
        { value: ReportReason.FAKE_INFORMATION, label: 'Fake Information' },
        { value: ReportReason.INAPPROPRIATE_CONTENT, label: 'Inappropriate Content (NSFW, Violence)' },
        { value: ReportReason.HARASSMENT, label: 'Harassment or Hate Speech' },
        { value: ReportReason.DUPLICATE, label: 'Duplicate Entry' },
        { value: ReportReason.OTHER, label: 'Other Issue' },
    ]

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            {/* The backdrop, rendered as a fixed sibling to the panel container */}
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            {/* Full-screen container to center the panel */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-full text-red-600">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                        <Dialog.Title as="h3" className="text-lg font-bold font-heading text-gray-900">
                            Report {targetType === 'brewspot' ? 'Place' : targetType === 'user' ? 'User' : 'Content'}
                        </Dialog.Title>
                    </div>

                    <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-4">
                            You are reporting <span className="font-semibold text-gray-700">{targetName || 'this content'}</span>.
                            Reports are anonymous and help keep our community safe.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <select
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value as ReportReason)}
                                    required
                                >
                                    <option value="" disabled>Select a reason...</option>
                                    {REASONS.map((r) => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details (Optional)</label>
                                <textarea
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                                    rows={3}
                                    placeholder="Please provide more context..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="danger" isLoading={isSubmitting} disabled={!reason}>
                                    Submit Report
                                </Button>
                            </div>
                        </form>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    )
}
