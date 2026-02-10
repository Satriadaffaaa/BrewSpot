'use client'

import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/common/Button'

export function BannedUserGuard({ children }: { children: React.ReactNode }) {
    const { profile, signOut } = useAuth()

    if (profile?.accountStatus === 'banned') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6 border-t-4 border-red-600">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Account Banned</h1>
                        <p className="text-gray-500 mt-2">
                            Your account has been permanently suspended due to rapid violations of our community guidelines.
                        </p>
                    </div>
                    <Button onClick={signOut} variant="outline" className="w-full">
                        Sign Out
                    </Button>
                </div>
            </div>
        )
    }

    if (profile?.accountStatus === 'suspended') {
        // Optionally, we could show a different screen or just a banner.
        // For now, let's treat suspension as a "Read Only" mode but with a banner?
        // Or block access entirely? 
        // Task said "handle suspended users ... gracefully".
        // Let's block access for now to be safe, or allow read-only.
        // Given the complexity of read-only logic everywhere, a block screen is safer for MVP Phase 3.
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6 border-t-4 border-orange-500">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-orange-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Account Suspended</h1>
                        <p className="text-gray-500 mt-2">
                            Your account has been temporarily suspended.
                            {profile.suspensionUntil && (
                                <span className="block mt-1 font-medium text-gray-900">
                                    Until: {new Date(profile.suspensionUntil).toLocaleString()}
                                </span>
                            )}
                        </p>
                    </div>
                    <Button onClick={signOut} variant="outline" className="w-full">
                        Sign Out
                    </Button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
