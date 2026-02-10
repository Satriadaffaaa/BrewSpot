
'use client'

import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkIsAdmin } from '@/features/admin/api';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkingRole, setCheckingRole] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            router.push('/');
            return;
        }

        async function verifyRole() {
            setCheckingRole(true);
            const admin = await checkIsAdmin(user!.uid);
            if (admin) {
                setIsAdmin(true);
            } else {
                router.push('/');
            }
            setCheckingRole(false);
        }

        verifyRole();
    }, [user, authLoading, router]);

    if (authLoading || checkingRole) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-neutral/60 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return <>{children}</>;
}
