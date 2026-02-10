'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { getUserProfile } from '@/features/gamification/api'
import { overrideContributorStatus, getXPLogsForUser, addAdminNote, getAdminNotes, updateUserRole } from '@/features/admin/api'
import { enforceUserAction } from '@/features/reports/api'
import { UserProfile, GlobalXPLog } from '@/features/gamification/types'
import { AdminNote, EnforcementType } from '@/features/admin/types'
import { Card } from '@/components/common/Card'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { Button } from '@/components/common/Button'
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon, HandThumbUpIcon, PhotoIcon, ChatBubbleBottomCenterTextIcon, StarIcon, SparklesIcon, UserCircleIcon } from '@heroicons/react/24/solid'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export default function AdminUserDetailPage() {
    const params = useParams()
    const userId = params.id as string

    const [user, setUser] = useState<UserProfile | null>(null)
    const [xpLogs, setXpLogs] = useState<GlobalXPLog[]>([])
    const [notes, setNotes] = useState<AdminNote[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const [userData, logsData, notesData] = await Promise.all([
                getUserProfile(userId),
                getXPLogsForUser(userId),
                getAdminNotes(userId)
            ])
            setUser(userData)
            setXpLogs(logsData)
            setNotes(notesData)
        } catch (error) {
            console.error("Failed to fetch user details", error)
            MySwal.fire('Error', 'Failed to load user data', 'error')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (userId) fetchData()
    }, [userId])

    const handleOverrideContributor = async () => {
        if (!user) return;

        const newStatus = !user.isContributor;
        const { value: reason } = await MySwal.fire({
            title: newStatus ? 'Grant Contributor Status?' : 'Revoke Contributor Status?',
            text: newStatus
                ? "This user will be able to auto-approve BrewSpots. Please provide a reason."
                : "This user will no longer be able to auto-approve BrewSpots.",
            input: 'text',
            inputPlaceholder: 'Reason for override...',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatus ? '#10b981' : '#d33',
            confirmButtonText: newStatus ? 'Grant Status' : 'Revoke Status',
            preConfirm: (reason) => {
                if (!reason) Swal.showValidationMessage('Reason is required for audit trail')
                return reason
            }
        });

        if (reason) {
            try {
                await overrideContributorStatus(userId, newStatus, reason);
                await fetchData(); // Refresh
                MySwal.fire('Success', `Contributor status ${newStatus ? 'granted' : 'revoked'}.`, 'success');
            } catch (error) {
                console.error("Failed to override", error);
                MySwal.fire('Error', 'Failed to update status', 'error');
            }
        }
    }

    const handleAddNote = async () => {
        const { value: content } = await MySwal.fire({
            title: 'Add Admin Note',
            input: 'textarea',
            inputPlaceholder: 'Internal note about this user...',
            showCancelButton: true,
            confirmButtonText: 'Save Note'
        });

        if (content) {
            try {
                await addAdminNote(userId, 'user', content);
                await fetchData();
            } catch (error) {
                console.error("Failed to add note", error);
            }
        }
    }

    const handleEnforcement = async (action: EnforcementType) => {
        let durationHours = undefined

        if (action === 'suspension') {
            const { value: duration } = await MySwal.fire({
                title: 'Suspension Duration',
                input: 'number',
                inputLabel: 'Hours (leave empty for 24h)',
                inputValue: 24,
                showCancelButton: true
            })
            if (duration === null) return // Cancelled
            durationHours = duration ? parseInt(duration) : 24
        }

        const { value: reason } = await MySwal.fire({
            title: `Confirm ${action.toUpperCase()}`,
            input: 'text',
            inputPlaceholder: 'Reason for enforcement...',
            inputValidator: (value) => {
                if (!value) return 'You need to write a reason!'
            },
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: `Yes, ${action} user`
        })

        if (reason) {
            try {
                await enforceUserAction(userId, action, reason, durationHours)
                await fetchData()
                MySwal.fire('Enforced', `User has been ${action}ed.`, 'success')
            } catch (error) {
                console.error("Enforcement failed", error)
                MySwal.fire('Error', 'Failed to enforce action', 'error')
            }
        }
    }

    const handleRoleChange = async (newRole: 'user' | 'admin') => {
        if (!user) return
        if (user.role === newRole) return

        const isPromoting = newRole === 'admin'

        const { value: reason } = await MySwal.fire({
            title: isPromoting ? 'Promote to Admin?' : 'Demote to User?',
            text: isPromoting
                ? "WARNING: This user will have full access to the admin dashboard!"
                : "This user will lose all admin privileges.",
            icon: isPromoting ? 'warning' : 'info',
            input: 'text',
            inputPlaceholder: 'Reason for role change...',
            showCancelButton: true,
            confirmButtonText: isPromoting ? 'Promote to Admin' : 'Demote User',
            confirmButtonColor: isPromoting ? '#7c3aed' : '#6b7280',
        })

        if (reason) {
            try {
                await updateUserRole(userId, newRole, reason)
                await fetchData()
                await Toast.fire({
                    icon: 'success',
                    title: `User role updated to ${newRole}`
                })
            } catch (error) {
                console.error("Failed to update role", error)
                MySwal.fire('Error', 'Failed to update role', 'error')
            }
        }
    }

    if (!user && !isLoading) return <div>User not found</div>

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold font-heading text-neutral">User Detail: {user?.displayName || 'Loading...'}</h1>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 border-l-4 border-primary">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Trust & Level</h3>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">Lvl {user?.level || 1}</span>
                        <span className="text-sm text-gray-500">({user?.xp || 0} XP)</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">Trust Level: {user?.trustLevel || 0}</div>
                    <div className={`mt-2 inline-flex px-2 py-1 rounded text-xs font-bold uppercase ${user?.accountStatus === 'banned' ? 'bg-red-100 text-red-800' :
                        user?.accountStatus === 'suspended' ? 'bg-orange-100 text-orange-800' :
                            user?.accountStatus === 'warned' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                        }`}>
                        {user?.accountStatus || 'active'}
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-blue-500">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">Contribution Stats</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1"><ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-gray-400" /> {user?.stats?.totalReviews || 0} Reviews</div>
                        <div className="flex items-center gap-1"><PhotoIcon className="w-4 h-4 text-gray-400" /> {user?.stats?.totalReviewPhotos || 0} Photos</div>
                        <div className="flex items-center gap-1"><HandThumbUpIcon className="w-4 h-4 text-gray-400" /> {user?.stats?.totalLikesGiven || 0} Likes</div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-purple-500">
                    <h3 className="text-sm font-medium text-gray-500 uppercase">BrewSpot Approvals</h3>
                    <div className="mt-2 text-3xl font-bold text-gray-900">{user?.stats?.brewspotApproved || 0}</div>
                    <div className="text-sm text-red-500">Rejected: {user?.stats?.brewspotRejected || 0}</div>
                </Card>
            </div>

            {/* Role & Permissions Card */}
            <Card className="p-0 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <ShieldCheckIcon className="w-5 h-5 text-neutral-400" />
                        Role & Permissions
                    </h3>

                    {/* Role Badge */}
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${user?.role === 'admin'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                        {user?.role === 'admin' && <StarIcon className="w-3.5 h-3.5" />}
                        {user?.role || 'user'}
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Role Selection */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">System Role</label>
                        <div className="flex flex-col gap-3">
                            <div
                                onClick={() => handleRoleChange('user')}
                                className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${user?.role === 'user'
                                    ? 'border-gray-900 bg-gray-50'
                                    : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${user?.role === 'user' ? 'border-gray-900' : 'border-gray-300'
                                    }`}>
                                    {user?.role === 'user' && <div className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900">Standard User</div>
                                    <div className="text-xs text-gray-500">Regular access to the platform</div>
                                </div>
                            </div>

                            <div
                                onClick={() => handleRoleChange('admin')}
                                className={`flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${user?.role === 'admin'
                                    ? 'border-purple-600 bg-purple-50'
                                    : 'border-gray-100 hover:border-purple-100'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${user?.role === 'admin' ? 'border-purple-600' : 'border-gray-300'
                                    }`}>
                                    {user?.role === 'admin' && <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />}
                                </div>
                                <div>
                                    <div className="font-bold text-purple-900">Administrator</div>
                                    <div className="text-xs text-purple-700/70">Full system access & management</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Special Privileges */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">Special Privileges</label>

                        <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-amber-500" />
                                    <span className="font-bold text-gray-900">Contributor Status</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${user?.isContributor ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-500'
                                    }`}>
                                    {user?.isContributor ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                                Contributors are "Top Brewers" whose submissions are automatically approved.
                            </p>
                            <Button
                                size="sm"
                                variant={user?.isContributor ? 'danger' : 'outline'}
                                className={`w-full ${user?.isContributor ? '' : 'border-blue-200 text-blue-700 hover:bg-blue-50'}`}
                                onClick={handleOverrideContributor}
                            >
                                {user?.isContributor ? 'Revoke Privilege' : 'Grant Contributor Status'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Additional Actions Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleEnforcement('warning')}>Warn User</Button>
                    <Button variant="danger" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white border-none" onClick={() => handleEnforcement('suspension')}>Suspend</Button>
                    <Button variant="danger" size="sm" onClick={() => handleEnforcement('ban')}>Ban User</Button>
                    <div className="w-px h-8 bg-gray-200 mx-2 self-center"></div>
                    <Button variant="outline" size="sm" onClick={handleAddNote}>
                        Add Note
                    </Button>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ... Keep Notes and XP History ... */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">Admin Notes</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {notes.length === 0 ? (
                            <p className="text-gray-500 italic">No notes recorded.</p>
                        ) : (
                            notes.map(note => (
                                <div key={note.id} className="bg-yellow-50 p-3 rounded-md border border-yellow-100 text-sm">
                                    <p className="text-gray-800">{note.content}</p>
                                    <div className="mt-2 text-xs text-gray-500 flex justify-between">
                                        <span>{note.authorName}</span>
                                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* XP History */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold mb-4">XP History</h3>
                    <div className="space-y-0 divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {xpLogs.length === 0 ? (
                            <p className="text-gray-500 italic">No history available.</p>
                        ) : (
                            xpLogs.map(log => (
                                <div key={log.id} className="py-3 flex justify-between items-center text-sm">
                                    <div>
                                        <span className="font-medium text-gray-900 uppercase tracking-wide text-xs bg-gray-100 px-2 py-1 rounded mr-2">
                                            {log.action.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-green-600 font-bold">+{log.amount} XP</span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}
