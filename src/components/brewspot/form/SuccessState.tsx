'use client'

import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { useRouter } from 'next/navigation'

export function SuccessState() {
    const router = useRouter()
    
    return (
        <Card className="p-12 text-center space-y-6 max-w-2xl mx-auto mt-8">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </div>
            <div>
                <h2 className="text-2xl font-bold font-heading text-primary mb-2">Terima Kasih!</h2>
                <p className="text-lg text-neutral/80">
                    Lokasi yang kamu tambahkan akan ditinjau admin sebelum tampil ke publik.
                </p>
                <p className="text-sm text-neutral/50 mt-4">
                    Mengalihkan ke halaman Explore dalam 5 detik...
                </p>
            </div>
            <Button onClick={() => router.push('/explore')} variant="outline">
                Kembali ke Explore Sekarang
            </Button>
        </Card>
    )
}
