'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase/client'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { Modal } from '@/components/common/Modal'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { IdentificationIcon, BuildingOfficeIcon, DocumentCheckIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

interface BusinessVerificationModalProps {
    isOpen: boolean
    onClose: () => void
    userId: string
    userName: string
    userEmail: string
}

export function BusinessVerificationModal({ isOpen, onClose, userId, userName, userEmail }: BusinessVerificationModalProps) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    
    // Form States
    const [legalName, setLegalName] = useState('')
    const [idNumber, setIdNumber] = useState('')
    const [businessName, setBusinessName] = useState('')
    const [businessType, setBusinessType] = useState('')
    const [phone, setPhone] = useState('')
    
    // File States
    const [idPhoto, setIdPhoto] = useState<File | null>(null)
    const [licensePhoto, setLicensePhoto] = useState<File | null>(null)

    const handleFileUpload = async (file: File, path: string) => {
        // We pass 'verifications' as the folder to Cloudinary
        return await uploadToCloudinary(file, 'verifications')
    }

    const handleSubmit = async () => {
        if (!idPhoto || !licensePhoto) {
            AdminSwal.fire('Error', 'Harap unggah semua dokumen yang diperlukan', 'error')
            return
        }

        setLoading(true)
        try {
            // Check if there is already a pending request
            const q = query(
                collection(db, 'business_verification_requests'),
                where('userId', '==', userId),
                where('status', '==', 'pending')
            )
            const existing = await getDocs(q)
            if (!existing.empty) {
                AdminSwal.fire('Info', 'Anda sudah memiliki pengajuan yang sedang diproses', 'info')
                onClose()
                return
            }

            // Upload files
            const idUrl = await handleFileUpload(idPhoto, 'id_proof')
            const licenseUrl = await handleFileUpload(licensePhoto, 'business_license')

            // Create Request
            await addDoc(collection(db, 'business_verification_requests'), {
                userId,
                userName,
                userEmail,
                legalName,
                idNumber,
                businessName,
                businessType,
                phone,
                idProofUrl: idUrl,
                businessProofUrl: licenseUrl,
                status: 'pending',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            })

            Toast.fire({
                icon: 'success',
                title: 'Pengajuan akses bisnis telah dikirim!'
            })
            onClose()
        } catch (error) {
            console.error("Submission error:", error)
            AdminSwal.fire('Error', 'Gagal mengirim pengajuan. Coba lagi nanti.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Daftar Akses Business Owner" size="lg">
            <div className="space-y-6 py-4">
                {/* Stepper UI */}
                <div className="flex items-center justify-between mb-8 px-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center flex-1 last:flex-none">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s ? 'bg-primary text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`h-1 flex-1 mx-2 rounded-full transition-colors ${step > s ? 'bg-primary' : 'bg-gray-100'}`} />}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-6">
                            <p className="text-sm text-primary/80 leading-relaxed font-medium">
                                <IdentificationIcon className="w-5 h-5 inline mr-2" />
                                Langkah pertama: Berikan informasi identitas legal Anda untuk verifikasi keamanan akun.
                            </p>
                        </div>
                        <Input
                            label="Nama Lengkap Sesuai KTP"
                            placeholder="Contoh: Budi Santoso"
                            value={legalName}
                            onChange={(e) => setLegalName(e.target.value)}
                            required
                        />
                        <Input
                            label="Nomor KTP / NIK"
                            placeholder="16 digit angka"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            required
                        />
                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setStep(2)} disabled={!legalName || !idNumber}>
                                Lanjut ke Info Bisnis
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-6">
                            <p className="text-sm text-primary/80 leading-relaxed font-medium">
                                <BuildingOfficeIcon className="w-5 h-5 inline mr-2" />
                                Informasi Bisnis: Masukkan detail operasional bisnis yang akan Anda kelola.
                            </p>
                        </div>
                        <Input
                            label="Nama Bisnis (Legal/Brand)"
                            placeholder="Contoh: Kopi Senja Roastery"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                        />
                        <Input
                            label="Tipe Bisnis"
                            placeholder="Contoh: Food & Beverage, Hospitality"
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            required
                        />
                        <Input
                            label="Nomor Telepon Bisnis"
                            placeholder="Contoh: 0812xxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                        <div className="flex justify-between pt-4">
                            <Button variant="outline" onClick={() => setStep(1)}>Kembali</Button>
                            <Button onClick={() => setStep(3)} disabled={!businessName || !businessType || !phone}>
                                Lanjut ke Unggah Dokumen
                            </Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <p className="text-sm text-primary/80 leading-relaxed font-medium">
                                <DocumentCheckIcon className="w-5 h-5 inline mr-2" />
                                Terakhir: Lampirkan foto dokumen asli. Admin kami akan meninjau data ini dalam 1-3 hari kerja.
                            </p>
                        </div>

                        {/* File Upload Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral">Foto KTP/Passport</label>
                                <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${idPhoto ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-border hover:border-primary/50'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setIdPhoto(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <ArrowUpTrayIcon className={`w-8 h-8 mx-auto mb-2 ${idPhoto ? 'text-green-500' : 'text-neutral/30'}`} />
                                    <p className="text-xs font-bold text-neutral-light">
                                        {idPhoto ? idPhoto.name : 'Klik untuk Unggah KTP'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-neutral">NIB / Izin Usaha / SKU</label>
                                <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all ${licensePhoto ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-border hover:border-primary/50'}`}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setLicensePhoto(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <ArrowUpTrayIcon className={`w-8 h-8 mx-auto mb-2 ${licensePhoto ? 'text-green-500' : 'text-neutral/30'}`} />
                                    <p className="text-xs font-bold text-neutral-light">
                                        {licensePhoto ? licensePhoto.name : 'Klik untuk Unggah Bukti'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between pt-6">
                            <Button variant="outline" onClick={() => setStep(2)}>Kembali</Button>
                            <Button onClick={handleSubmit} isLoading={loading} disabled={!idPhoto || !licensePhoto}>
                                Kirim Pengajuan
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

