
'use client'

import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/common/Button';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface AdminHeaderProps {
    setSidebarOpen?: (open: boolean) => void;
}

export function AdminHeader({ setSidebarOpen }: AdminHeaderProps) {
    const { signOut, user } = useAuth();
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <header className="fixed top-0 right-0 left-0 md:left-72 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 sticky-header-shadow transition-all duration-300">
            <div className="flex-1 px-4 md:px-8 flex justify-between h-16 items-center">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="-m-2.5 p-2.5 text-gray-700 md:hidden"
                        onClick={() => setSidebarOpen?.(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="flex flex-col justify-center">
                        <h2 className="text-sm font-medium text-neutral-400 uppercase tracking-widest hidden sm:block">{date}</h2>
                    </div>
                </div>

                <div className="ml-4 flex items-center md:ml-6 gap-6">
                    {/* Notifications (Mock) */}
                    <button className="relative p-2 text-neutral-400 hover:text-primary transition-colors">
                        <BellIcon className="h-6 w-6" />
                        <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    </button>

                    <div className="h-8 w-px bg-neutral-200 mx-2 hidden sm:block" />

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end hidden sm:flex">
                            <span className="text-sm font-bold text-neutral-800">{user?.displayName || 'Administrator'}</span>
                            <span className="text-xs text-neutral-500">{user?.email}</span>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                            {user?.email?.[0].toUpperCase() || 'A'}
                        </div>
                    </div>

                    <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700 ml-2 hidden sm:flex" size="sm" onClick={() => signOut()}>
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}
