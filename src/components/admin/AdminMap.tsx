'use client'

import { Map, MapMarker, MarkerContent } from '@/components/ui/map';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

interface AdminMapProps {
    latitude: number;
    longitude: number;
    className?: string;
}

export function AdminMap({ latitude, longitude, className = "h-96 w-full rounded-xl" }: AdminMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return <div className={className} />;

    return (
        <div className={className}>
            <Map
                center={[longitude, latitude]}
                zoom={14}
                className="w-full h-full"
                scrollZoom={false}
                dragPan={false}
                dragRotate={false}
                doubleClickZoom={false}
                touchZoomRotate={false}
            >
                <MapMarker latitude={latitude} longitude={longitude} anchor="bottom">
                    <MarkerContent>
                        <MapPinIcon className="w-10 h-10 text-accent drop-shadow-md" />
                    </MarkerContent>
                </MapMarker>
            </Map>
        </div>
    );
}

