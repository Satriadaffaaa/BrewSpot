'use client'

import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { MapPinIcon } from '@heroicons/react/24/outline'
import dynamic from 'next/dynamic'

const BrewSpotMap = dynamic(() => import('../BrewSpotMap'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>
})

interface LocationStepProps {
    city: string
    address: string
    latitude: number
    longitude: number
    selectedLocation: [number, number] | null
    isFetchingAddress: boolean
    onCityChange: (city: string) => void
    onAddressChange: (address: string) => void
    onLocationSelect: (lat: number, lng: number) => void
    onGeolocation: () => void
}

export function LocationStep({
    city,
    address,
    latitude,
    longitude,
    selectedLocation,
    isFetchingAddress,
    onCityChange,
    onAddressChange,
    onLocationSelect,
    onGeolocation
}: LocationStepProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <MapPinIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 flex items-center justify-between">
                    <h2 className="text-xl font-heading font-bold text-primary">
                        Langkah 2: Lokasi
                    </h2>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onGeolocation}
                        className="hidden sm:flex"
                    >
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        Gunakan Lokasi Saya
                    </Button>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4">
                        <Input
                            label="Kota"
                            value={city}
                            onChange={e => onCityChange(e.target.value)}
                            required
                            placeholder="misal: Jakarta Selatan"
                        />
                    </div>
                    <div className="md:col-span-8 relative">
                        <Input
                            label="Alamat"
                            value={address}
                            onChange={e => onAddressChange(e.target.value)}
                            required
                            placeholder={isFetchingAddress ? "Mengambil alamat..." : "Alamat lengkap jalan"}
                            disabled={isFetchingAddress}
                        />
                        {isFetchingAddress && (
                            <div className="absolute right-3 top-[38px] w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>
                </div>

                <div className="sm:hidden">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        size="sm"
                        onClick={onGeolocation}
                    >
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        Gunakan Lokasi Saya
                    </Button>
                </div>

                {/* Integrated Map */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-neutral">Verifikasi di Peta</label>
                        <span className="text-[10px] text-neutral/40 font-bold uppercase tracking-widest">
                            Lat: {latitude.toFixed(4)} • Lng: {longitude.toFixed(4)}
                        </span>
                    </div>
                    <div className="h-[300px] relative rounded-2xl overflow-hidden border border-border shadow-sm">
                        <BrewSpotMap
                            spots={[]}
                            interactive={true}
                            selectedLocation={selectedLocation}
                            onLocationSelect={onLocationSelect}
                            className="w-full h-full absolute inset-0"
                        />
                        {!selectedLocation && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-surface/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-xs font-bold text-primary border border-primary/10 flex items-center gap-2">
                                <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
                                Ketuk peta untuk menandai lokasi
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-neutral/50 text-center italic">
                        *Geser penanda jika lokasi kurang akurat.
                    </p>
                </div>
            </div>
        </Card>
    )
}
