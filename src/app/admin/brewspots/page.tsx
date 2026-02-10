
'use client'

import { usePendingBrewSpots } from '@/features/admin/hooks';
import { PendingSpotTable } from '@/components/admin/PendingSpotTable';
import { Card } from '@/components/common/Card';
import { getGlobalSettings, updateGlobalSettings } from '@/features/admin/api';
import { GlobalSettings } from '@/features/admin/types';
import { useEffect, useState } from 'react';
import { AdminSwal, Toast } from '@/components/common/SweetAlert';

export default function AdminBrewSpotsPage() {
    const { spots, loading, error } = usePendingBrewSpots();
    const [settings, setSettings] = useState<GlobalSettings | null>(null);

    useEffect(() => {
        getGlobalSettings().then(setSettings).catch(console.error);
    }, []);

    const handleToggleAutoApproval = async () => {
        if (!settings) return;
        const newValue = !settings.enableAutoApproval;

        try {
            await updateGlobalSettings({ enableAutoApproval: newValue });
            setSettings({ ...settings, enableAutoApproval: newValue });

            Toast.fire({
                icon: newValue ? 'success' : 'warning',
                title: `Auto-Approval ${newValue ? 'Enabled' : 'Disabled'}`
            });
        } catch (error) {
            console.error(error);
            AdminSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update settings',
                customClass: {
                    popup: 'rounded-3xl shadow-2xl border border-neutral-100',
                    title: 'text-2xl font-bold font-heading text-neutral-800'
                }
            });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-neutral-500 font-medium animate-pulse">Loading pending applications...</p>
        </div>
    );

    if (error) return (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-100 flex items-center text-red-600">
            <span className="font-bold mr-2">Error:</span> {error}
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-neutral-800">Pending Reviews</h1>
                    <p className="text-neutral-500 mt-1">{spots.length} applications waiting for your decision</p>
                </div>

                {/* Global Safety Switch */}
                {settings && (
                    <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-sm border border-neutral-200/60 transition-all hover:shadow-md">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-neutral-800">
                                Auto-Approval
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-green-600">
                                Active System
                            </span>
                        </div>
                        <button
                            onClick={handleToggleAutoApproval}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 ${settings.enableAutoApproval ? 'bg-green-500 shadow-inner' : 'bg-neutral-200'
                                }`}
                        >
                            <span className="sr-only">Enable Auto-Approval</span>
                            <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-spring ${settings.enableAutoApproval ? 'translate-x-[22px]' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>
                )}
            </div>

            {spots.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-neutral-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-800 mb-2">All caught up!</h2>
                    <p className="text-neutral-500 max-w-sm mx-auto">There are no pending BrewSpot applications requiring moderation at this time.</p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl shadow-neutral-100/50 border border-neutral-100 overflow-hidden">
                    <PendingSpotTable spots={spots} />
                </div>
            )}
        </div>
    );
}
