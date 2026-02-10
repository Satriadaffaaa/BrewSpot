'use client'

import { useAuth } from '@/providers/AuthProvider'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?next=/add-brewspot')
        }
    }, [user, loading, router])

    if (loading) {
        return <div className="h-64 flex items-center justify-center">Loading...</div>
    }

    if (!user) {
        return null // Will redirect
    }

    return <>{children}</>
}
