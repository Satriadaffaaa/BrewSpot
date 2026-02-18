'use client'

import { useState, useEffect } from 'react'

interface LocationState {
    latitude: number | null
    longitude: number | null
    error: string | null
    loading: boolean
}

export const useUserLocation = () => {
    const [location, setLocation] = useState<LocationState>({
        latitude: null,
        longitude: null,
        error: null,
        loading: true
    })

    useEffect(() => {
        if (!navigator.geolocation) {
            setLocation(prev => ({ ...prev, error: 'Geolocation is not supported', loading: false }))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                    loading: false
                })
            },
            (error) => {
                let errorMessage = 'Unable to retrieve location'
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Location permission denied'
                }
                setLocation(prev => ({ ...prev, error: errorMessage, loading: false }))
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        )
    }, [])

    return location
}
