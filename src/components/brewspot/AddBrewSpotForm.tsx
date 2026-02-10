'use client'

import { useAddBrewSpot } from '@/features/brewspot/hooks'
import { BrewSpotForm } from './BrewSpotForm'

export function AddBrewSpotForm() {
    const { addSpot, loading, error } = useAddBrewSpot()

    return (
        <BrewSpotForm
            mode="create"
            onSubmit={async (data) => { await addSpot(data) }}
            isLoading={loading}
            error={error}
        />
    )
}
