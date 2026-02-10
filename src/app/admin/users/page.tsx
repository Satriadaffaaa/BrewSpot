'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { getAllUsers } from '@/features/admin/api'
import { UserProfile } from '@/features/gamification/types'
import { CheckBadgeIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { SparklesIcon as SparklesSolid } from '@heroicons/react/24/solid'
import Link from 'next/link'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers(50)
                setUsers(data)
            } catch (error) {
                console.error("Failed to fetch users", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUsers()
    }, [])

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-neutral-800">User Management</h1>
                    <p className="text-neutral-500 mt-1">Monitor user activity and enforce platform standards</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-neutral-100/50 border border-neutral-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-100">
                        <thead className="bg-neutral-50/50">
                            <tr>
                                <th scope="col" className="px-8 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">User Profile</th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Gamification</th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Role & Trust</th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-neutral-400 uppercase tracking-wider">Activity Stats</th>
                                <th scope="col" className="relative px-6 py-5"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-neutral-100">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="px-8 py-6 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-gray-100 rounded-full animate-pulse" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 bg-gray-100 w-1/3 rounded animate-pulse" />
                                                    <div className="h-3 bg-gray-50 w-1/4 rounded animate-pulse" />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-24 text-center text-neutral-400">
                                        No users found in the database.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.uid} className="group hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center text-lg font-bold text-primary overflow-hidden shadow-sm">
                                                    {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : (user.displayName?.[0] || 'U')}
                                                </div>
                                                <div className="ml-5">
                                                    <div className="text-sm font-bold text-neutral-900">{user.displayName}</div>
                                                    <div className="text-xs font-medium text-neutral-400 font-mono mt-0.5">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-neutral-800">Lvl {user.level || 1}</span>
                                                <span className="text-xs text-neutral-500">{user.xp || 0} XP</span>

                                                {/* Anomaly Indicator */}
                                                {(user.xp || 0) > 1000 && (user.level || 1) < 3 && (
                                                    <span className="flex items-center text-amber-600 text-[10px] font-bold mt-1 bg-amber-50 px-2 py-0.5 rounded-full w-fit border border-amber-100" title="Unusual XP/Level ratio">
                                                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" /> FLAGGED
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="text-xs font-medium text-neutral-500">Trust Score: <span className="font-bold text-neutral-800">{user.trustLevel || 0}</span></div>
                                                <div>
                                                    {user.isContributor ? (
                                                        <span className="px-2.5 py-0.5 inline-flex text-[10px] uppercase tracking-wide font-bold rounded-md bg-amber-50 text-amber-700 border border-amber-100 items-center gap-1">
                                                            <SparklesSolid className="w-3 h-3" /> Contributor
                                                        </span>
                                                    ) : (
                                                        <span className="px-2.5 py-0.5 inline-flex text-[10px] uppercase tracking-wide font-bold rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200">
                                                            Member
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-sm text-neutral-500">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="font-bold text-neutral-800">{user.stats?.totalReviews || 0}</div>
                                                    <div className="text-[10px] uppercase text-neutral-400 font-bold">Reviews</div>
                                                </div>
                                                <div className="w-px h-8 bg-neutral-200"></div>
                                                <div className="text-center">
                                                    <div className="font-bold text-green-600">{user.stats?.brewspotApproved || 0}</div>
                                                    <div className="text-[10px] uppercase text-neutral-400 font-bold">Approved</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/admin/users/${user.uid}`}>
                                                <button className="text-sm font-bold text-neutral-400 hover:text-primary transition-colors px-4 py-2 hover:bg-neutral-50 rounded-lg">
                                                    Inspect Profile
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
