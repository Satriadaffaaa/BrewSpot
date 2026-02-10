'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase/client'
import { BrewSpotForm } from '@/components/brewspot/BrewSpotForm'
import { updateBrewSpot } from '@/features/brewspot/api'
import { AddBrewSpotInput } from '@/features/brewspot/types'
import { useAuth } from '@/providers/AuthProvider'

// Necessary to prevent static generation errors if logic relies on params
export const dynamic = 'force-dynamic'

export default function EditBrewSpotPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [initialData, setInitialData] = useState<Partial<AddBrewSpotInput> | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            router.push('/login')
            return
        }

        const fetchSpot = async () => {
            try {
                const docRef = doc(db, 'brewspots', id)
                const snap = await getDoc(docRef)

                if (!snap.exists()) {
                    setError('BrewSpot not found')
                    setLoading(false)
                    return
                }

                const data = snap.data()

                // Security check: Ensure owner
                if (data.createdBy !== user.uid) {
                    setError('Unauthorized: You can only edit your own spots.')
                    setLoading(false)
                    return
                }

                // Map Firestore data to Form Input format
                setInitialData({
                    name: data.name,
                    address: data.address,
                    city: data.city,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    price_range: data.priceRange, // Field name mapping drift
                    facilities: data.facilities,
                    photos: data.photos,
                    description: data.description,
                    tags: data.tags
                })
            } catch (err) {
                console.error('Error fetching spot:', err)
                setError('Failed to load spot data')
            } finally {
                setLoading(false)
            }
        }

        fetchSpot()
    }, [id, user, authLoading, router])

    const handleUpdate = async (data: AddBrewSpotInput) => {
        setSaving(true)
        setError(null)
        try {
            await updateBrewSpot(id, data)
            // Redirect to detail page
            router.push(`/brewspot/${id}`)
            router.refresh()
        } catch (err) {
            console.error('Update failed:', err)
            setError('Failed to update BrewSpot')
        } finally {
            setSaving(false)
        }
    }

    if (authLoading || loading) {
        return <div className="p-8 text-center">Loading...</div>
    }

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <h2 className="text-xl font-bold">Error</h2>
                <p>{error}</p>
                <button onClick={() => router.back()} className="mt-4 underline">Go Back</button>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold font-heading mb-8">Edit BrewSpot</h1>
            {initialData && (
                <BrewSpotForm
                    mode="edit"
                    initialData={initialData}
                    onSubmit={handleUpdate}
                    isLoading={saving}
                    error={error}
                />
            )}
        </div>
    )
}
