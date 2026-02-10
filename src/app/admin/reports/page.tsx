'use client'

import { useState, useEffect } from 'react'
import { getReports, updateReportStatus } from '@/features/reports/api'
import { Report, ReportReason } from '@/features/admin/types'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import {
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'

export default function AdminReportsPage() {
    const [reports, setReports] = useState<Report[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filter, setFilter] = useState<'open' | 'reviewed' | 'dismissed'>('open')

    const fetchReports = async () => {
        setIsLoading(true)
        try {
            const data = await getReports(filter)
            setReports(data)
        } catch (error) {
            console.error("Failed to fetch reports", error)
            AdminSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load reports',
                customClass: {
                    popup: 'rounded-3xl shadow-2xl border border-neutral-100',
                    title: 'text-2xl font-bold font-heading text-neutral-800'
                }
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchReports()
    }, [filter])

    const handleResolve = async (reportId: string, status: 'reviewed' | 'dismissed') => {
        const { value: note } = await AdminSwal.fire({
            title: status === 'reviewed' ? 'Mark as Reviewed?' : 'Dismiss Report?',
            input: 'text',
            inputPlaceholder: 'Add admin note (optional)',
            showCancelButton: true,
            confirmButtonText: status === 'reviewed' ? 'Mark Reviewed' : 'Dismiss',
            customClass: {
                confirmButton: `px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 mx-2 ${status === 'reviewed' ? 'bg-green-600 hover:bg-green-700' : 'bg-neutral-500 hover:bg-neutral-600'}`,
                cancelButton: 'px-6 py-3 rounded-xl font-bold text-neutral-500 bg-neutral-100 hover:bg-neutral-200 transition-transform active:scale-95 mx-2',
                popup: 'rounded-3xl shadow-2xl border border-neutral-100',
                title: 'text-2xl font-bold font-heading text-neutral-800',
                input: 'rounded-xl border-neutral-300 focus:ring-primary focus:border-primary mt-4'
            }
        })

        if (note !== undefined) { // Allow empty note
            try {
                await updateReportStatus(reportId, status, note)
                fetchReports()
                AdminSwal.fire({
                    icon: 'success',
                    title: `Report ${status}`,
                    timer: 2000,
                    showConfirmButton: false
                })
            } catch (error) {
                console.error("Failed to update report", error)
                AdminSwal.fire('Error', 'Action failed', 'error')
            }
        }
    }

    const getReasonLabel = (reason: ReportReason) => {
        return reason.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-neutral-800">Content Reports</h1>
                    <p className="text-neutral-500 mt-1">Review and manage user-reported content violations</p>
                </div>

                <div className="flex p-1 bg-neutral-100 rounded-xl">
                    {(['open', 'reviewed', 'dismissed'] as const).map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === status
                                ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                                : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse shadow-sm border border-neutral-100" />)}
                </div>
            ) : reports.length === 0 ? (
                <div className="rounded-3xl bg-white p-16 text-center border-2 border-dashed border-neutral-200">
                    <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800">All clear!</h3>
                    <p className="text-neutral-500 max-w-sm mx-auto mt-2">No reports found for the selected filter. The community is looking safe.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {reports.map((report) => (
                        <div key={report.id} className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-neutral-100 hover:shadow-lg transition-all duration-300">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>

                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pl-4">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border border-red-100">
                                            {report.targetType}
                                        </span>
                                        <span className="text-neutral-300">•</span>
                                        <span className="text-sm text-neutral-400 font-medium">
                                            {new Date(report.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-neutral-900 group-hover:text-primary transition-colors">
                                            {getReasonLabel(report.reason)}
                                        </h3>
                                        <p className="text-neutral-600 mt-2 text-sm leading-relaxed bg-neutral-50 p-3 rounded-lg border border-neutral-100 inline-block max-w-3xl">
                                            <span className="text-neutral-400 mr-2 font-serif italic">User Note:</span>
                                            "{report.description || 'No description provided'}"
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Link
                                        href={
                                            report.targetType === 'brewspot' ? `/brewspot/${report.targetId}` :
                                                report.targetType === 'user' ? `/admin/users/${report.targetId}` :
                                                    `/admin/reviews?id=${report.targetId}`
                                        }
                                        target="_blank"
                                    >
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto hover:bg-neutral-50">
                                            <ArrowTopRightOnSquareIcon className="w-4 h-4 mr-2 text-neutral-400" />
                                            Inspect Content
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between pl-4">
                                <span className="text-xs font-mono text-neutral-300 select-all">ID: {report.id}</span>

                                {filter === 'open' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleResolve(report.id, 'dismissed')}
                                            className="px-4 py-2 text-sm font-bold text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors flex items-center"
                                        >
                                            <XCircleIcon className="w-4 h-4 mr-2" />
                                            Dismiss
                                        </button>
                                        <button
                                            onClick={() => handleResolve(report.id, 'reviewed')}
                                            className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center"
                                        >
                                            <CheckCircleIcon className="w-4 h-4 mr-2" />
                                            Resolve
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
