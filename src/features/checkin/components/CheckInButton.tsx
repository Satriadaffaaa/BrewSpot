'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { MapPinIcon } from '@heroicons/react/24/outline'
import { checkIn } from '../service'
import { useAuth } from '@/providers/AuthProvider'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { useRouter } from 'next/navigation'

import { calculateDistance } from '@/lib/locationUtils'

export const CheckInButton = ({ brewSpotId, brewSpotLocation, className }: { brewSpotId: string, brewSpotLocation?: { lat: number, lng: number }, className?: string }) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCheckIn = async () => {
        if (!user) {
            AdminSwal.fire({
                title: 'Login Required',
                text: 'You need to be logged in to check in!',
                icon: 'info',
                confirmButtonText: 'Login'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push('/login')
                }
            })
            return
        }

        if (!brewSpotLocation) {
            Toast.fire({
                icon: 'warning',
                title: 'Location data not available for this spot.'
            })
            return;
        }

        setLoading(true)

        if (!navigator.geolocation) {
            Toast.fire({
                icon: 'error',
                title: 'Geolocation is not supported by your browser.'
            })
            setLoading(false)
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const distance = calculateDistance(userLat, userLng, brewSpotLocation.lat, brewSpotLocation.lng);

                // Check distance (50 meters tolerance - Best Scenario)
                const MAX_CHECKIN_RADIUS = 50;

                if (distance > MAX_CHECKIN_RADIUS) {
                    await AdminSwal.fire({
                        title: 'Too Far Away!',
                        text: `You are ${Math.round(distance)} meters away. You need to be within ${MAX_CHECKIN_RADIUS} meters to check in.`,
                        icon: 'warning',
                        confirmButtonText: 'OK'
                    });
                    setLoading(false);
                    return;
                }

                try {
                    const result = await checkIn(user.uid, brewSpotId)

                    if (result.success) {
                        await Toast.fire({
                            icon: 'success',
                            title: result.message
                        })
                    } else {
                        await Toast.fire({
                            icon: 'info',
                            title: result.message
                        })
                    }
                } catch (error) {
                    console.error(error)
                    Toast.fire({
                        icon: 'error',
                        title: 'An error occurred while checking in.'
                    })
                } finally {
                    setLoading(false)
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                let errorMessage = 'Unable to retrieve your location.';
                if (error.code === error.PERMISSION_DENIED) {
                    errorMessage = 'Location permission denied. Please enable location services to check in.';
                }
                Toast.fire({
                    icon: 'error',
                    title: errorMessage
                })
                setLoading(false);
            },
            {
                enableHighAccuracy: true, // Request best possible accuracy
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    return (
        <Button
            onClick={handleCheckIn}
            disabled={loading}
            variant="primary"
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 ${className}`}
            title="Check In here"
        >
            <MapPinIcon className={`w-5 h-5 ${loading ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Checking Location...' : 'Check In'}</span>
        </Button>
    )
}
