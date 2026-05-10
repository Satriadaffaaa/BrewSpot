'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase/client'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Modal } from '@/components/common/Modal'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { CameraIcon, CheckBadgeIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

interface ClaimSpotModalProps {
    isOpen: boolean
    onClose: () => void
    spotId: string
    spotName: string
    userId: string
}

export function ClaimSpotModal({ isOpen, onClose, spotId, spotName, userId }: ClaimSpotModalProps) {
    const [loading, setLoading] = useState(false)
    const [description, setDescription] = useState('')
    const [proofPhoto, setProofPhoto] = useState<File | null>(null)

    const handleSubmit = async () => {
        if (!proofPhoto) {
            AdminSwal.fire('Error', 'Harap unggah foto bukti kepemilikan', 'error')
            return
        }

        setLoading(true)
        try {
            // Check for existing pending claim
            const q = query(
                collection(db, 'spot_claim_requests'),
                where('spotId', '==', spotId),
                where('userId', '==', userId),
                where('status', '==', 'pending')
            )
            const existing = await getDocs(q)
            if (!existing.empty) {
                AdminSwal.fire('Info', 'Spot ini sudah memiliki pengajuan klaim yang sedang diproses', 'info')
                onClose()
                return
            }

            // Upload proof photo via Cloudinary
            const proofUrl = await uploadToCloudinary(proofPhoto, 'lokali/claims')

            // Create Claim Request
            await addDoc(collection(db, 'spot_claim_requests'), {
                spotId,
                spotName,
                userId,
                proofUrl,
                description,
                status: 'pending',
                createdAt: serverTimestamp()
            })

            await AdminSwal.fire({
                title: 'Pengajuan Terkirim!',
                text: 'Admin akan meninjau bukti kontrol lokasi Anda dalam 1-3 hari kerja.',
                icon: 'success'
            })
            onClose()
        } catch (error) {
            console.error("Claim error:", error)
            AdminSwal.fire('Error', 'Gagal mengirim pengajuan klaim.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Klaim Hak Kelola: ${spotName}`} size="md">
            <div className="space-y-6 py-4">
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-amber-800">
                    <InformationCircleIcon className="w-6 h-6 shrink-0" />
                    <p className="text-sm">
                        Anda akan mengajukan klaim sebagai pemilik sah tempat ini. Admin memerlukan bukti bahwa Anda memiliki kontrol fisik atas lokasi ini.
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral">Bukti Kontrol Lokasi</label>
                    <div className="relative border-2 border-dashed border-border rounded-2xl p-8 text-center bg-gray-50 hover:border-primary/50 transition-colors cursor-pointer group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProofPhoto(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <CameraIcon className="w-10 h-10 mx-auto mb-2 text-neutral/30 group-hover:text-primary transition-colors" />
                        <p className="text-sm font-bold text-neutral-light">
                            {proofPhoto ? proofPhoto.name : 'Unggah Foto Bukti'}
                        </p>
                        <p className="text-[10px] text-neutral/40 mt-1 uppercase tracking-widest">
                            (Foto depan toko dengan tanda kepemilikan)
                        </p>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral">Catatan Tambahan (Opsional)</label>
                    <textarea
                        className="w-full p-4 bg-gray-50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none min-h-[100px]"
                        placeholder="Berikan informasi tambahan jika diperlukan..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" onClick={onClose}>Batal</Button>
                    <Button onClick={handleSubmit} isLoading={loading} disabled={!proofPhoto}>
                        <CheckBadgeIcon className="w-5 h-5 mr-2" /> Ajukan Klaim
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

