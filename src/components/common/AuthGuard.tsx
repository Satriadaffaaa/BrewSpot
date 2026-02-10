'use client'

import { useAuth } from '@/providers/AuthProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login?next=/add-brewspot')
        }
    }, [user, isLoading, router])

    if (isLoading) {
        return <div className="h-64 flex items-center justify-center">Loading...</div>
    }

    if (!user) {
        return null // Will redirect
    }

    return <>{children}</>
}
