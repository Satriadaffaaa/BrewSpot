import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, ClipboardDocumentCheckIcon, ChatBubbleLeftRightIcon, UserGroupIcon, ExclamationTriangleIcon, SparklesIcon, ChartBarIcon, CpuChipIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils/cn';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Pending Reviews', href: '/admin/brewspots', icon: ClipboardDocumentCheckIcon },
    { name: 'Reviews', href: '/admin/reviews', icon: ChatBubbleLeftRightIcon },
    { name: 'Reports', href: '/admin/reports', icon: ExclamationTriangleIcon },
    { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'AI Tools', href: '/admin/ai-tools', icon: CpuChipIcon },
];

interface AdminSidebarProps {
    sidebarOpen?: boolean;
    setSidebarOpen?: (open: boolean) => void;
}

export function AdminSidebar({ sidebarOpen = false, setSidebarOpen }: AdminSidebarProps) {
    const pathname = usePathname();

    const NavContent = () => (
        <>
            {/* Logo Area */}
            <div className="flex items-center h-16 flex-shrink-0 px-6 bg-black/20 backdrop-blur-sm border-b border-white/5 mx-4 mt-4 rounded-2xl mb-4">
                <SparklesIcon className="w-8 h-8 text-secondary mr-3" />
                <div className="flex flex-col">
                    <span className="text-xl font-bold font-heading text-secondary tracking-tight">BrewSpot</span>
                    <span className="text-xs text-secondary/60 uppercase tracking-widest font-medium">Administration</span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 flex flex-col overflow-y-auto px-4">
                <nav className="flex-1 space-y-2">
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
                                        ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/20'
                                        : 'text-secondary/60 hover:bg-white/5 hover:text-white',
                                    'group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        isActive ? 'text-white' : 'text-secondary/50 group-hover:text-white',
                                        'mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-200'
                                    )}
                                    aria-hidden="true"
                                />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Footer / Version */}
            <div className="p-6 border-t border-white/5 bg-black/10 mx-4 mb-4 rounded-2xl mt-auto">
                <p className="text-xs text-secondary/40 text-center font-mono">v1.2.0 &bull; Secure Mode</p>
            </div>
        </>
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
                        <div className="fixed inset-0 bg-gray-900/80" />
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
                            <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1 flex-col bg-neutral-900/95 backdrop-blur-xl text-secondary/90 border-r border-white/10">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-in-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in-out duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                        <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen?.(false)}>
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
            <aside className="hidden md:flex md:w-72 md:flex-col fixed inset-y-0 z-50 bg-neutral-900 text-secondary/90 border-r border-white/5 shadow-2xl">
                <NavContent />
            </aside>
        </>
    );
}
