'use client'

import { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls, MapRoute } from '@/components/ui/map'
import { BrewSpot } from '@/features/brewspot/types'
import { MapPinIcon } from '@heroicons/react/24/solid'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Toast } from '@/components/common/SweetAlert'
import { cn } from '@/lib/utils'
import { useMap } from '@/components/ui/map'

interface BrewSpotMapProps {
    spots: BrewSpot[]
    center?: [number, number] // [Lat, Lng]
    zoom?: number
    className?: string
    interactive?: boolean
    selectedLocation?: [number, number] | null // [Lat, Lng]
    onLocationSelect?: (lat: number, lng: number) => void
    routeCoordinates?: [number, number][] // [[Lng, Lat], ...]
    userLocation?: [number, number] | null // [Lat, Lng]
}

export default function BrewSpotMap({
    spots,
    center = [-6.2088, 106.8456], // Jakarta default (Lat, Lng)
    zoom = 12,
    className = "h-[400px] w-full rounded-xl z-0 overflow-hidden",
    interactive = true,
    selectedLocation,
    onLocationSelect,
    routeCoordinates,
    userLocation
}: BrewSpotMapProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [mapTheme, setMapTheme] = useState<'light' | 'dark'>('dark')
    const mapRef = useRef<any>(null)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    // Effect to center map on selected location when it changes (from geolocation)
    useEffect(() => {
        if (selectedLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [selectedLocation[1], selectedLocation[0]],
                zoom: 15,
                duration: 1000
            })
        }
    }, [selectedLocation])

    // Effect to handle cursor change
    useEffect(() => {
        if (!mapRef.current) return;
        const canvas = mapRef.current.getCanvas();
        if (interactive) {
            canvas.style.cursor = 'crosshair';
        } else {
            canvas.style.cursor = '';
        }
    }, [interactive]);

    // Effect to fit map bounds when route is shown
    useEffect(() => {
        if (routeCoordinates && routeCoordinates.length > 1 && mapRef.current) {
            try {
                // Manually calculate bounds to avoid dependency on LngLatBounds class
                const minLng = Math.min(...routeCoordinates.map(c => c[0]));
                const minLat = Math.min(...routeCoordinates.map(c => c[1]));
                const maxLng = Math.max(...routeCoordinates.map(c => c[0]));
                const maxLat = Math.max(...routeCoordinates.map(c => c[1]));

                mapRef.current.fitBounds(
                    [[minLng, minLat], [maxLng, maxLat]], 
                    { padding: 50, duration: 1000 }
                );
            } catch (err) {
                console.error("Error fitting bounds:", err);
            }
        }
    }, [routeCoordinates]);



    // Pre-filter spots with valid coordinates
    const validSpots = spots.filter(spot =>
        spot &&
        typeof spot.latitude === 'number' && !isNaN(spot.latitude) && isFinite(spot.latitude) &&
        typeof spot.longitude === 'number' && !isNaN(spot.longitude) && isFinite(spot.longitude)
    )

    if (!isMounted) return <div className={className} />

    return (
        <div className={className + " relative group/map"}>
            {/* Map Theme Toggle */}
            <div className="absolute top-4 left-4 z-10">
                <button
                    onClick={() => setMapTheme(prev => prev === 'light' ? 'dark' : 'light')}
                    className="p-2 bg-surface/90 dark:bg-neutral-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-border hover:bg-surface transition-all active:scale-95 group"
                    title={`Switch to ${mapTheme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {mapTheme === 'light' ? (
                        <MoonIcon className="w-5 h-5 text-primary group-hover:text-primary" />
                    ) : (
                        <SunIcon className="w-5 h-5 text-accent group-hover:rotate-12 transition-transform" />
                    )}
                </button>
            </div>

            <Map
                ref={mapRef}
                center={[center[1], center[0]]}
                zoom={zoom}
                theme={mapTheme}
                className={cn("w-full h-full", interactive && "cursor-crosshair")}
                scrollZoom={interactive}
                dragPan={interactive}
                dragRotate={interactive}
                // Mapcn now handles onClick via props
                onClick={(e) => {
                    if (interactive && onLocationSelect) {
                        onLocationSelect(e.lngLat.lat, e.lngLat.lng)
                    }
                }}
            >
                <MapControls 
                    position="bottom-right" 
                    showLocate={interactive} 
                    showZoom={interactive} 
                    onLocate={(coords) => {
                        if (interactive && onLocationSelect) {
                            onLocationSelect(coords.latitude, coords.longitude)
                        }
                    }}
                    onError={(err) => {
                        Toast.fire({
                            icon: 'warning',
                            title: err.message
                        })
                    }}
                />

                {/* Existing Spots */}
                {validSpots.map((spot) => (
                    <MapMarker
                        key={spot.id}
                        longitude={spot.longitude}
                        latitude={spot.latitude}
                        anchor="bottom"
                    >
                        <MarkerContent>
                            <Link href={`/spot/${spot.id}`} className="group relative block" onClick={(e) => e.stopPropagation()}>
                                <MapPinIcon className="w-8 h-8 text-accent drop-shadow-md transition-all duration-300 group-hover:scale-110" />
                            </Link>
                        </MarkerContent>
                        <MarkerTooltip className="font-bold">
                            {spot.name}
                        </MarkerTooltip>
                    </MapMarker>
                ))}

                {/* Selected Location (for Adding Spot) */}
                {selectedLocation && (
                    <MapMarker
                        longitude={selectedLocation[1]}
                        latitude={selectedLocation[0]}
                        anchor="bottom"
                    >
                        <MarkerContent>
                            <div className="relative group/pin">
                                <div className="absolute -inset-4 bg-accent/20 rounded-full animate-ping pointer-events-none" />
                                <MapPinIcon className="w-10 h-10 text-accent animate-bounce drop-shadow-[0_4px_6px_rgba(0,0,0,0.3)] relative z-10" />
                            </div>
                        </MarkerContent>
                    </MapMarker>
                )}

                {/* Route Line */}
                {routeCoordinates && routeCoordinates.length > 0 && (
                    <MapRoute 
                        coordinates={routeCoordinates} 
                        color="#FF6B35" 
                        width={5} 
                        opacity={0.8}
                    />
                )}

                {/* User Location Marker (Blue Dot) */}
                {userLocation && (
                    <MapMarker
                        longitude={userLocation[1]}
                        latitude={userLocation[0]}
                        anchor="center"
                    >
                        <MarkerContent>
                            <div className="relative">
                                <div className="absolute -inset-2 bg-blue-500/30 rounded-full animate-ping" />
                                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-md relative z-10" />
                            </div>
                        </MarkerContent>
                    </MapMarker>
                )}
            </Map>
        </div>
    )
}


