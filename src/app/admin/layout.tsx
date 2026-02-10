
'use client'

import AdminGuard from '@/components/admin/AdminGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <AdminGuard>
            <div className="min-h-screen bg-neutral-50">
                <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <div className="md:pl-72 flex flex-col flex-1 transition-all duration-300">
                    <AdminHeader setSidebarOpen={setSidebarOpen} />
                    <main className="flex-1 pt-16">
                        <div className="py-8 min-h-[calc(100vh-64px)]">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </AdminGuard>
    );
}
