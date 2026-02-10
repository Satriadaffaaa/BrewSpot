
'use client'

import Map, { Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPinIcon } from '@heroicons/react/24/solid';

interface AdminMapProps {
    latitude: number;
    longitude: number;
    className?: string;
}

export function AdminMap({ latitude, longitude, className = "h-96 w-full rounded-xl" }: AdminMapProps) {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapboxToken) {
        return <div className="p-4 bg-red-50 text-red-600">Mapbox Token Missing</div>;
    }

    return (
        <div className={className}>
            <Map
                initialViewState={{
                    latitude,
                    longitude,
                    zoom: 14 // Close enough for detail
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v11"
                mapboxAccessToken={mapboxToken}
                scrollZoom={false}
                dragPan={false}
                dragRotate={false}
                doubleClickZoom={false}
                touchZoomRotate={false}
            >
                <Marker latitude={latitude} longitude={longitude} anchor="bottom">
                    <MapPinIcon className="w-10 h-10 text-primary drop-shadow-md" />
                </Marker>
            </Map>
        </div>
    );
}
