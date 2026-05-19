'use client'

import { useBrewSpotForm } from '@/features/brewspot/hooks'
import { AddBrewSpotInput } from '@/features/brewspot/types'
import { Button } from '@/components/common/Button'
import { SuccessState } from './form/SuccessState'
import { CategoryStep } from './form/CategoryStep'
import { LocationStep } from './form/LocationStep'
import { DetailsStep } from './form/DetailsStep'
import { MediaStep } from './form/MediaStep'

interface BrewSpotFormProps {
    initialData?: Partial<AddBrewSpotInput>
    onSubmit: (data: AddBrewSpotInput) => Promise<void>
    isLoading?: boolean
    error?: string | null
    mode: 'create' | 'edit'
}

export function BrewSpotForm({ initialData, onSubmit, isLoading, error, mode }: BrewSpotFormProps) {
    const {
        formData,
        setFormData,
        uploading,
        success,
        isFetchingAddress,
        selectedLocation,
        previewUrls,
        handleLocationSelect,
        handleGeolocation,
        handleFileSelect,
        removeFile,
        handleSubmit
    } = useBrewSpotForm(mode, onSubmit, initialData)

    if (success && mode === 'create') {
        return <SuccessState />
    }

    return (
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                <CategoryStep
                    value={formData.category}
                    onChange={(category) => setFormData({ ...formData, category })}
                />

                <LocationStep
                    city={formData.city}
                    address={formData.address}
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    selectedLocation={selectedLocation}
                    isFetchingAddress={isFetchingAddress}
                    onCityChange={(city) => setFormData({ ...formData, city })}
                    onAddressChange={(address) => setFormData({ ...formData, address })}
                    onLocationSelect={handleLocationSelect}
                    onGeolocation={handleGeolocation}
                />

                <DetailsStep
                    name={formData.name}
                    description={formData.description}
                    priceRange={formData.price_range}
                    facilities={formData.facilities || []}
                    onNameChange={(name) => setFormData({ ...formData, name })}
                    onDescriptionChange={(description) => setFormData({ ...formData, description })}
                    onPriceRangeChange={(price_range) => setFormData({ ...formData, price_range })}
                    onFacilitiesChange={(facilities) => setFormData({ ...formData, facilities })}
                />

                <MediaStep
                    videoUrl={formData.videoUrl || ''}
                    menuUrl={formData.menuUrl || ''}
                    previewUrls={previewUrls}
                    onVideoUrlChange={(url) => setFormData(prev => ({ ...prev, videoUrl: url }))}
                    onMenuUrlChange={(url) => setFormData(prev => ({ ...prev, menuUrl: url }))}
                    onFileSelect={handleFileSelect}
                    onRemoveFile={removeFile}
                />


                <Button 
                    type="submit" 
                    className="w-full py-6 text-lg shadow-xl shadow-primary/20 rounded-2xl font-bold tracking-wide" 
                    isLoading={isLoading || uploading}
                >
                    {uploading ? 'Sedang Mengunggah...' : (mode === 'create' ? 'Ajukan Lokasi Baru' : 'Simpan Perubahan')}
                </Button>

                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        {error}
                    </div>
                )}
            </form>
        </div>
    )
}
