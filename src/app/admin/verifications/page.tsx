'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { getPendingVerifications, approveBusinessVerification, rejectBusinessVerification } from '@/features/admin/api'
import { BusinessVerificationRequest } from '@/features/brewspot/types'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { 
    CheckBadgeIcon, 
    XCircleIcon, 
    DocumentMagnifyingGlassIcon, 
    UserIcon, 
    BuildingOfficeIcon,
    CalendarIcon
} from '@heroicons/react/24/outline'

export default function AdminVerificationQueuePage() {
    const [requests, setRequests] = useState<BusinessVerificationRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const data = await getPendingVerifications()
            setRequests(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleApprove = async (request: BusinessVerificationRequest) => {
        const result = await AdminSwal.fire({
            title: 'Setujui Verifikasi?',
            text: `User ${request.userName} akan diberikan peran BUSINESS OWNER.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Setujui',
            cancelButtonText: 'Batal'
        })

        if (result.isConfirmed) {
            setProcessingId(request.id)
            try {
                await approveBusinessVerification(request.id, request.userId)
                await Toast.fire({ icon: 'success', title: 'Verifikasi disetujui!' })
                fetchRequests()
            } catch (error) {
                AdminSwal.fire('Error', 'Gagal menyetujui verifikasi', 'error')
            } finally {
                setProcessingId(null)
            }
        }
    }

    const handleReject = async (requestId: string) => {
        const { value: reason } = await AdminSwal.fire({
            title: 'Tolak Verifikasi',
            input: 'textarea',
            inputLabel: 'Alasan Penolakan',
            inputPlaceholder: 'Tuliskan alasan...',
            inputAttributes: { 'aria-label': 'Alasan Penolakan' },
            showCancelButton: true
        })

        if (reason) {
            setProcessingId(requestId)
            try {
                await rejectBusinessVerification(requestId, reason)
                await Toast.fire({ icon: 'info', title: 'Verifikasi ditolak' })
                fetchRequests()
            } catch (error) {
                AdminSwal.fire('Error', 'Gagal menolak verifikasi', 'error')
            } finally {
                setProcessingId(null)
            }
        }
    }

    const viewDocument = (url: string, title: string) => {
        AdminSwal.fire({
            title: title,
            imageUrl: url,
            imageAlt: title,
            width: '80%',
            showConfirmButton: false,
            showCloseButton: true
        })
    }

    if (loading) {
        return (
            <Container className="py-12">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 w-1/4 bg-gray-200 rounded" />
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-xl" />)}
                </div>
            </Container>
        )
    }

    return (
        <Container className="py-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black font-heading text-primary">Antrean Verifikasi Owner</h1>
                    <p className="text-neutral-500">Tinjau dokumen legal dan berikan akses business owner kepada penjelajah.</p>
                </div>
                <div className="bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                    <span className="font-bold text-primary">{requests.length} Pengajuan Tertunda</span>
                </div>
            </div>

            {requests.length === 0 ? (
                <Card className="p-12 text-center bg-gray-50 border-dashed border-2 border-border">
                    <CheckBadgeIcon className="w-16 h-16 text-green-500 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-primary">Antrean Bersih!</h3>
                    <p className="text-neutral-500">Tidak ada pengajuan verifikasi yang memerlukan perhatian saat ini.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((req) => (
                        <Card key={req.id} className="p-0 overflow-hidden border-none shadow-md group hover:shadow-xl transition-shadow">
                            <div className="flex flex-col lg:flex-row">
                                {/* User Info Sidebar */}
                                <div className="lg:w-1/3 bg-gray-50/50 p-6 border-r border-border space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black">
                                            {req.userName.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-primary">{req.userName}</h3>
                                            <p className="text-xs text-neutral-500">{req.userEmail}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                                            <UserIcon className="w-4 h-4" /> <span>{req.legalName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                                            <BuildingOfficeIcon className="w-4 h-4" /> <span>{req.businessName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                                          <CalendarIcon className="w-4 h-4" />
                                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Content & Actions */}
                                <div className="flex-grow p-6 flex flex-col justify-between">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Dokumen Pendukung</h4>
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => viewDocument(req.idProofUrl, 'Bukti KTP/Passport')}
                                                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-surface border border-border rounded-xl hover:border-primary hover:text-primary transition-all text-sm font-bold shadow-sm"
                                                >
                                                    <DocumentMagnifyingGlassIcon className="w-5 h-5" /> Tinjau KTP
                                                </button>
                                                <button 
                                                    onClick={() => viewDocument(req.businessProofUrl, 'Bukti Izin Usaha/NIB')}
                                                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-surface border border-border rounded-xl hover:border-primary hover:text-primary transition-all text-sm font-bold shadow-sm"
                                                >
                                                    <DocumentMagnifyingGlassIcon className="w-5 h-5" /> Tinjau NIB
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Info Kontak</h4>
                                            <div className="p-3 bg-surface border border-border rounded-xl">
                                                <p className="text-sm font-bold text-primary">{req.phone}</p>
                                                <p className="text-xs text-neutral-500">Nomor Telepon Terdaftar</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-border">
                                        <Button 
                                            variant="outline" 
                                            className="text-red-500 border-red-200 hover:bg-red-50 rounded-xl"
                                            onClick={() => handleReject(req.id)}
                                            disabled={processingId === req.id}
                                        >
                                            <XCircleIcon className="w-5 h-5 mr-2" /> Tolak
                                        </Button>
                                        <Button 
                                            className="rounded-xl px-8"
                                            onClick={() => handleApprove(req)}
                                            isLoading={processingId === req.id}
                                        >
                                            <CheckBadgeIcon className="w-5 h-5 mr-2" /> Setujui Akses Owner
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </Container>
    )
}

