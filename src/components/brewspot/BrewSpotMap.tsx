'use client'

import Map, { Marker, NavigationControl, GeolocateControl } from 'react-map-gl/mapbox'
import * as mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { BrewSpot } from '@/features/brewspot/types'
import { MapPinIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/common/Card'

// Disable Mapbox telemetry to prevent blocked request errors
try {
    // @ts-ignore
    if (mapboxgl.config) {
        // @ts-ignore
        mapboxgl.config.EVENTS_URL = null;
    }
} catch (e) {
    // Ignore error if property is missing
}

interface BrewSpotMapProps {
    spots: BrewSpot[]
    center?: [number, number]
    zoom?: number
    className?: string
    interactive?: boolean
    selectedLocation?: [number, number] | null
    onLocationSelect?: (lat: number, lng: number) => void
}

export default function BrewSpotMap({
    spots,
    center = [-6.2088, 106.8456], // Jakarta default (Lat, Lng)
    zoom = 12,
    className = "h-[400px] w-full rounded-xl z-0 overflow-hidden",
    interactive = true,
    selectedLocation,
    onLocationSelect
}: BrewSpotMapProps) {

    // Helper ref to trigger geolocation automatically
    // Using any because generic Ref type is not exported easily
    const geoControlRef = useRef<any>(null)

    const [viewState, setViewState] = useState({
        longitude: center[1],
        latitude: center[0],
        zoom: zoom
    })

    // Attempt to auto-locate on mount if interactive
    useEffect(() => {
        if (interactive && geoControlRef.current) {
            // Short delay to ensure map is ready
            setTimeout(() => {
                geoControlRef.current?.trigger()
            }, 1000)
        }
    }, [interactive])

    // Update view state when center or zoom props change (External Control)
    useEffect(() => {
        setViewState(prev => ({
            ...prev,
            longitude: center[1],
            latitude: center[0],
            zoom: zoom
        }))
    }, [center[0], center[1], zoom])

    // Mapbox requires Lng, Lat order for coordinates in some places, 
    // but Marker uses longitude={...} and latitude={...}.
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    if (!mapboxToken) {
        return (
            <div className={`bg-gray-100 flex items-center justify-center flex-col p-4 text-center ${className}`}>
                <p className="text-red-500 font-bold mb-2">Map Configuration Missing</p>
                <p className="text-sm text-gray-500">Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file.</p>
            </div>
        )
    }

    return (
        <div className={className}>
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken={mapboxToken}
                mapLib={mapboxgl}
                scrollZoom={interactive}
                dragPan={interactive}
                dragRotate={interactive}
                doubleClickZoom={interactive}
                onClick={(e) => {
                    if (interactive && onLocationSelect) {
                        onLocationSelect(e.lngLat.lat, e.lngLat.lng)
                    }
                }}
            >
                <GeolocateControl
                    ref={geoControlRef}
                    position="top-right"
                    positionOptions={{ enableHighAccuracy: true }}
                    trackUserLocation={true}
                    showUserHeading={true}
                />
                <NavigationControl position="bottom-right" />

                {/* Existing Spots */}
                {spots.map((spot) => (
                    <Marker
                        key={spot.id}
                        longitude={spot.longitude}
                        latitude={spot.latitude}
                        anchor="bottom"
                    >
                        <Link href={`/brewspot/${spot.id}`} className="group relative">
                            <MapPinIcon className="w-8 h-8 text-primary drop-shadow-md transition-transform group-hover:scale-110" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block whitespace-nowrap z-50">
                                <Card className="px-2 py-1 text-xs font-bold shadow-lg">
                                    {spot.name}
                                </Card>
                            </div>
                        </Link>
                    </Marker>
                ))}

                {/* Selected Location (for Adding Spot) */}
                {selectedLocation && (
                    <Marker
                        longitude={selectedLocation[1]}
                        latitude={selectedLocation[0]}
                        anchor="bottom"
                    >
                        <MapPinIcon className="w-8 h-8 text-accent animate-bounce drop-shadow-md" />
                    </Marker>
                )}
            </Map>
        </div>
    )
}
