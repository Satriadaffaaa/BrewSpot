'use client'

import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import Link from 'next/link'

export function UpdatePasswordForm() {
    return (
        <Card className="w-full max-w-md p-8 shadow-lg text-center">
            <h1 className="text-2xl font-bold font-heading text-primary mb-4">Update Password</h1>
            <p className="text-neutral mb-6">
                Password updates are currently disabled.
            </p>
            <Link href="/profile">
                <Button variant="outline" className="w-full">Go to Profile</Button>
            </Link>
        </Card>
    )
}
