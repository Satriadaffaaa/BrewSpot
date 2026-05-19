'use client'

import { useEffect, useState } from 'react'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { getPendingClaimRequests, approveSpotClaim, rejectSpotClaim } from '@/features/admin/api'
import { ClaimRequest } from '@/features/brewspot/types'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { 
    CheckBadgeIcon, 
    XCircleIcon, 
    MapPinIcon, 
    DocumentMagnifyingGlassIcon,
    CalendarIcon,
    IdentificationIcon
} from '@heroicons/react/24/outline'

export default function AdminClaimQueuePage() {
    const [requests, setRequests] = useState<ClaimRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const data = await getPendingClaimRequests()
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

    const handleApprove = async (request: ClaimRequest) => {
        const result = await AdminSwal.fire({
            title: 'Setujui Klaim Spot?',
            text: `User akan diberikan hak pengelolaan penuh atas "${request.spotName}".`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Berikan Hak Akses',
            cancelButtonText: 'Batal'
        })

        if (result.isConfirmed) {
            setProcessingId(request.id)
            try {
                await approveSpotClaim(request.id, request.spotId, request.userId)
                await Toast.fire({ icon: 'success', title: 'Klaim disetujui!' })
                fetchRequests()
            } catch (error) {
                AdminSwal.fire('Error', 'Gagal menyetujui klaim', 'error')
            } finally {
                setProcessingId(null)
            }
        }
    }

    const handleReject = async (requestId: string) => {
        const { value: reason } = await AdminSwal.fire({
            title: 'Tolak Klaim',
            input: 'textarea',
            inputLabel: 'Alasan Penolakan',
            inputPlaceholder: 'Tuliskan alasan...',
            showCancelButton: true
        })

        if (reason) {
            setProcessingId(requestId)
            try {
                await rejectSpotClaim(requestId, reason)
                await Toast.fire({ icon: 'info', title: 'Klaim ditolak' })
                fetchRequests()
            } catch (error) {
                AdminSwal.fire('Error', 'Gagal menolak klaim', 'error')
            } finally {
                setProcessingId(null)
            }
        }
    }

    const viewDocument = (url: string) => {
        AdminSwal.fire({
            title: 'Bukti Kontrol Lokasi',
            imageUrl: url,
            imageAlt: 'Proof of Control',
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
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-xl" />)}
                </div>
            </Container>
        )
    }

    return (
        <Container className="py-8 space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black font-heading text-primary">Antrean Klaim Kepemilikan</h1>
                    <p className="text-neutral-500">Verifikasi bukti fisik bahwa owner benar-benar mengontrol lokasi yang diklaim.</p>
                </div>
                <div className="bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                    <span className="font-bold text-indigo-700">{requests.length} Klaim Tertunda</span>
                </div>
            </div>

            {requests.length === 0 ? (
                <Card className="p-12 text-center bg-gray-50 border-dashed border-2 border-border">
                    <MapPinIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-primary">Tidak ada pengajuan klaim</h3>
                    <p className="text-neutral-500">Semua permintaan klaim spot telah diproses.</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {requests.map((req) => (
                        <Card key={req.id} className="p-0 overflow-hidden border-none shadow-md hover:shadow-xl transition-shadow">
                            <div className="flex flex-col lg:flex-row">
                                <div className="lg:w-1/3 bg-indigo-50/30 p-6 border-r border-indigo-50 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                                            <BuildingOfficeIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-primary leading-tight">{req.spotName}</h3>
                                            <p className="text-xs text-neutral-500">ID: {req.spotId}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                                            <IdentificationIcon className="w-4 h-4" /> 
                                            <span>Requested by {req.userId.slice(0, 8)}...</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                                            <CalendarIcon className="w-4 h-4" /> 
                                            <span>{new Date(req.createdAt).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-grow p-6 flex flex-col justify-between">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Bukti Fisik</h4>
                                            <button 
                                                onClick={() => viewDocument(req.proofUrl)}
                                                className="w-full h-32 relative overflow-hidden rounded-2xl border-2 border-dashed border-border group hover:border-indigo-400 transition-colors bg-surface shadow-sm"
                                            >
                                                <img src={req.proofUrl} alt="Proof" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 transition-colors">
                                                    <DocumentMagnifyingGlassIcon className="w-10 h-10 text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-neutral-400">Pesan dari Owner</h4>
                                            <div className="p-4 bg-gray-50 rounded-2xl text-sm text-neutral/70 italic border border-border min-h-[100px]">
                                                {req.description || "Tidak ada pesan tambahan."}
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
                                            <XCircleIcon className="w-5 h-5 mr-2" /> Tolak Klaim
                                        </Button>
                                        <Button 
                                            className="rounded-xl px-10 bg-indigo-600 hover:bg-indigo-700"
                                            onClick={() => handleApprove(req)}
                                            isLoading={processingId === req.id}
                                        >
                                            <CheckBadgeIcon className="w-5 h-5 mr-2" /> Sahkan Kepemilikan
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

function BuildingOfficeIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
    )
}

