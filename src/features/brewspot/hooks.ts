import { useEffect, useState, useCallback } from 'react'
import { BrewSpot, AddBrewSpotInput } from './types'
import { getBrewSpots, getBrewSpotById, createBrewSpot } from './api'

export function useBrewSpots() {
    const [brewSpots, setBrewSpots] = useState<BrewSpot[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSpots = useCallback(async () => {
        try {
            setLoading(true)
            const data = await getBrewSpots()
            setBrewSpots(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch BrewSpots')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSpots()
    }, [fetchSpots])

    return { brewSpots, loading, error, refetch: fetchSpots }
}

export function useBrewSpot(id: string) {
    const [brewSpot, setBrewSpot] = useState<BrewSpot | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchSpot() {
            if (!id) return
            try {
                setLoading(true)
                const data = await getBrewSpotById(id)
                setBrewSpot(data)
                setError(null)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch BrewSpot details')
            } finally {
                setLoading(false)
            }
        }

        fetchSpot()
    }, [id])

    return { brewSpot, loading, error }
}

export function useAddBrewSpot() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const addSpot = async (input: AddBrewSpotInput) => {
        try {
            setLoading(true)
            setError(null)

            // Basic validation
            if (!input.name || !input.address || !input.city) {
                throw new Error('Please fill in all required fields')
            }

            const result = await createBrewSpot(input)
            return result
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add BrewSpot'
            setError(message)
            throw new Error(message)
        } finally {
            setLoading(false)
        }
    }

    return { addSpot, loading, error }
}
