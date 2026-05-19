import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftRightIcon, UserGroupIcon, ExclamationTriangleIcon, ChartBarIcon, CpuChipIcon, XMarkIcon, KeyIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/cn';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { LokaliLogo } from '@/components/ui/LokaliLogo';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Persetujuan Spot', href: '/admin/spots', icon: ClipboardDocumentCheckIcon },
    { name: 'Klaim Hak Kelola', href: '/admin/claims', icon: KeyIcon },
    { name: 'Verifikasi Owner', href: '/admin/verifications', icon: IdentificationIcon },
    { name: 'Review', href: '/admin/reviews', icon: ChatBubbleLeftRightIcon },
    { name: 'Laporan', href: '/admin/reports', icon: ExclamationTriangleIcon },
    { name: 'Pengguna', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Analitik', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Alat AI', href: '/admin/ai-tools', icon: CpuChipIcon },
];

interface AdminSidebarProps {
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
}

export function AdminSidebar({ sidebarOpen = false, setSidebarOpen }: AdminSidebarProps) {
    const pathname = usePathname();

    const NavContent = () => (
        <div className="flex flex-col h-full bg-[#1a1a2e] overflow-hidden">
            {/* Logo Area - Refined & Branded */}
            <div className="flex items-center h-28 flex-shrink-0 px-8">
                <LokaliLogo size="md" theme="dark" />
                <div className="ml-4 flex flex-col">
                    <div className="px-2 py-0.5 bg-[#E8A87C]/20 rounded-md">
                        <span className="text-[10px] text-[#E8A87C] uppercase font-black tracking-[0.2em]">Admin</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto px-4 pb-4">
                <nav className="flex-1 space-y-1.5">
                    {navigation.map((item) => {
                        const isActive = item.href === '/admin'
                            ? pathname === '/admin'
                            : pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    isActive
                                        ? 'bg-surface/10 text-[#F5E6D3] shadow-sm ring-1 ring-white/10'
                                        : 'text-slate-400 hover:bg-surface/5 hover:text-[#F5E6D3]',
                                    'group flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 ease-in-out'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-[#E8A87C]' : 'text-slate-500 group-hover:text-[#E8A87C]',
                                        'mr-4 flex-shrink-0 h-5 w-5 transition-colors duration-300'
                                    )}
                                    aria-hidden="true"
                                />
                                <span className="tracking-wide">{item.name}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_12px_rgba(255,107,53,0.8)]" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Footer / Version - Clean & Premium */}
            <div className="p-8 border-t border-white/5 mt-auto bg-black/20">
                <div className="flex items-center justify-between opacity-40 hover:opacity-80 transition-opacity duration-300">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">v1.2.0</p>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Mode Aman</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar (Slide-over) */}
            <Transition show={sidebarOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 md:hidden" onClose={() => setSidebarOpen?.(false)}>
                    <TransitionChild
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-secondary/80 backdrop-blur-sm" />
                    </TransitionChild>

                    <div className="fixed inset-0 flex">
                        <TransitionChild
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <DialogPanel className="relative flex w-full max-w-xs flex-1 flex-col bg-secondary shadow-2xl border-r border-white/5">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute right-0 top-0 -mr-12 pt-6">
                                        <button type="button" className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setSidebarOpen?.(false)}>
                                            <span className="sr-only">Close sidebar</span>
                                            <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </button>
                                    </div>
                                </TransitionChild>
                                <NavContent />
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:w-80 md:flex-col fixed inset-y-0 z-50 shadow-2xl border-r border-white/5">
                <NavContent />
            </aside>
        </>
    );
}

