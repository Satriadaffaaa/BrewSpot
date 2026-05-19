
'use client'

import { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase/client'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import Link from 'next/link'

export function ForgotPasswordForm() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            await sendPasswordResetEmail(auth, email)
            setSuccess('Password reset email sent! Check your inbox.')
        } catch (err: any) {
            console.error(err)
            if (err.code === 'auth/user-not-found') {
                // Don't reveal user existence? Or maybe do for now.
                setError('No account found with this email.')
            } else {
                setError(err.message || 'Failed to send reset email')
            }
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md p-8 shadow-lg text-center">
                <h1 className="text-2xl font-bold font-heading text-primary mb-4">Check Your Email</h1>
                <p className="text-neutral mb-6">{success}</p>
                <Link href="/login">
                    <Button className="w-full">Back to Login</Button>
                </Link>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md p-8 shadow-lg">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold font-heading text-primary">Reset Password</h1>
                <p className="text-sm text-neutral/70 mt-2">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" isLoading={loading}>
                    Send Reset Link
                </Button>
            </form>

            <div className="mt-6 text-center text-sm">
                <Link href="/login" className="text-neutral/70 hover:text-primary transition-colors">
                    Back to Login
                </Link>
            </div>
        </Card>
    )
}
