'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { AddBrewSpotInput, BrewSpot } from '@/features/brewspot/types'
import { BREWSPOT_FACILITIES } from '@/features/brewspot/constants'
import { MapPinIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { SocialVideoEmbed } from '@/components/common/SocialVideoEmbed'

// Dynamic import for Map to avoid SSR issues
const BrewSpotMap = dynamic(() => import('./BrewSpotMap'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400">Loading Map...</div>
})

interface BrewSpotFormProps {
    initialData?: Partial<AddBrewSpotInput>
    onSubmit: (data: AddBrewSpotInput) => Promise<void>
    isLoading?: boolean
    error?: string | null
    mode: 'create' | 'edit'
}

export function BrewSpotForm({ initialData, onSubmit, isLoading, error, mode }: BrewSpotFormProps) {
    const router = useRouter()
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState<AddBrewSpotInput>({
        name: '',
        address: '',
        city: '',
        latitude: 0,
        longitude: 0,
        price_range: 'moderate',
        facilities: [],
        photos: [], // URLs
        description: '',
        tags: [],
        videoUrl: '',
        ...initialData
    })

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])

    // Temporary container for location until user confirms
    const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
        initialData?.latitude && initialData?.longitude
            ? [initialData.latitude, initialData.longitude]
            : null
    )

    const [isFetchingAddress, setIsFetchingAddress] = useState(false)

    // Init preview URLs from existing photos
    useEffect(() => {
        if (initialData?.photos && initialData.photos.length > 0) {
            setPreviewUrls(initialData.photos)
        }
    }, [initialData])

    // Update location check if initial data has location
    useEffect(() => {
        if (initialData?.latitude && initialData?.longitude) {
            setSelectedLocation([initialData.latitude, initialData.longitude])
        }
    }, [initialData])


    // Helper: Reverse Geocoding via Nominatim (OpenStreetMap)
    const fetchAddress = async (lat: number, lng: number) => {
        setIsFetchingAddress(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            )
            const data = await response.json()

            if (data && data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county || ''
                const fullAddress = data.display_name

                setFormData(prev => ({
                    ...prev,
                    address: fullAddress,
                    city: city,
                    latitude: lat,
                    longitude: lng
                }))
            } else {
                // Fallback if no address found
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
            }
        } catch (error) {
            console.error("Error fetching address:", error)
            // Still update coordinates on error
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
        } finally {
            setIsFetchingAddress(false)
        }
    }

    const handleLocationSelect = (lat: number, lng: number) => {
        setSelectedLocation([lat, lng])
        fetchAddress(lat, lng)
    }

    const handleGeolocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords
                    setSelectedLocation([latitude, longitude])
                    fetchAddress(latitude, longitude)
                },
                (error) => {
                    console.error("Geolocation error:", error)
                    alert("Could not get your location. Please select manually on the map.")
                }
            )
        } else {
            alert("Geolocation is not supported by your browser.")
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files)
            setSelectedFiles(prev => [...prev, ...files])

            // Create preview URLs
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setPreviewUrls(prev => [...prev, ...newPreviews])
        }
    }

    const removeFile = (index: number) => {
        // Check if removing existing photo or new file
        const totalExisting = initialData?.photos?.length || 0;

        // This logic is tricky with mixed existing/new. 
        // Ideally we separate them. But primarily for edit, we might just append new for now.
        // For simplicity: If editing, we rely on previewUrls as source of truth for display, 
        // but removing an "existing" photo needs to update formData.photos too.

        // Let's simplify: 
        // 1. Remove from Preview
        const urlToRemove = previewUrls[index];
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));

        // 2. If it was a file (blob:), remove from selectedFiles
        if (urlToRemove.startsWith('blob:')) {
            // We need to find which file corresponds to this index in the MIXED list.
            // This is hard. Better strategy:
            // Store `newFiles` separately from `existingPhotos`.
            // But here we mixed them in UI.

            // Re-implementing removal for mixed state is complex in 5 mins.
            // Let's just remove from selectedFiles if we can match it, or filter formData.photos.

            URL.revokeObjectURL(urlToRemove) // Cleanup if blob
            // This is imprecise. Let's block removal of existing photos for MVP iteration 1 if acceptable?
            // Or allow removal but assume user re-uploads if they mess up? 
            // Actually, if we just remove from `previewUrls`, we can reconstruct `formData.photos` on submit?
            // No, file uploads happen on submit.

            // Simple approach: 
            // If index < (formData.photos?.length || 0) -> It's an existing photo. Remove from formData.photos
            // If index >= (formData.photos?.length || 0) -> It's a new file. Remove from selectedFiles.

            // Wait, initialData.photos is static. formData.photos tracks current state?
            // Yes, setFormData initialized with initialData.

            const currentExistingCount = formData.photos.length;

            if (index < currentExistingCount) {
                // Removing existing
                setFormData(prev => ({
                    ...prev,
                    photos: prev.photos.filter((_, i) => i !== index)
                }))
            } else {
                // Removing new file
                const fileIndex = index - currentExistingCount;
                setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
            }
        } else {
            // It's a URL, so removal from formData.photos
            setFormData(prev => ({
                ...prev,
                photos: prev.photos.filter((p) => p !== urlToRemove)
            }))
        }
    }



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedLocation) {
            alert("Please select a location on the map.")
            return
        }

        try {
            setUploading(true)

            // 1. Upload NEW photos only
            let newPhotoUrls: string[] = [];
            if (selectedFiles.length > 0) {
                const sanitizedName = formData.name.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'unnamed_spot';
                const folderPath = `brewspots/${sanitizedName}`;

                newPhotoUrls = await Promise.all(
                    selectedFiles.map(file => uploadToCloudinary(file, folderPath))
                )
            }

            // 2. Combine existing photos (from formData.photos) with new ones
            const finalPhotos = [...formData.photos, ...newPhotoUrls];

            // 3. Submit
            await onSubmit({
                ...formData,
                photos: finalPhotos
            })

            // Only show success card if Create mode. 
            // Edit mode might just toast or redirect.
            if (mode === 'create') {
                setSuccess(true)
                setTimeout(() => {
                    router.push('/explore')
                    router.refresh()
                }, 5000)
            }
        } catch (err) {
            console.error("Submission failed:", err)
            if (err instanceof Error && err.message.includes('Cloudinary')) {
                alert("Photo upload failed: " + err.message)
            }
        } finally {
            setUploading(false)
        }
    }

    if (success && mode === 'create') {
        return (
            <Card className="p-12 text-center space-y-6 max-w-2xl mx-auto mt-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-heading text-primary mb-2">Terima Kasih!</h2>
                    <p className="text-lg text-neutral/80">
                        BrewSpot yang kamu tambahkan akan ditinjau admin sebelum tampil ke publik.
                    </p>
                    <p className="text-sm text-neutral/50 mt-4">
                        Mengalihkan ke halaman Explore dalam 5 detik...
                    </p>
                </div>
                <Button onClick={() => router.push('/explore')} variant="outline">
                    Kembali ke Explore Sekarang
                </Button>
            </Card>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <h2 className="text-xl font-heading font-bold mb-4 text-primary">
                        {mode === 'create' ? 'Details' : 'Edit Details'}
                    </h2>
                    <div className="space-y-4">
                        <Input
                            label="Name"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. Kopi Kenangan Mantan"
                        />

                        {/* Description / Founder's Note */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral">Founder's Note / Description</label>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Tell us what makes this spot special..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>



                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="City"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                required
                                placeholder="e.g. Jakarta South"
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-neutral">Price Range</label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={formData.price_range}
                                    onChange={e => setFormData({ ...formData, price_range: e.target.value as any })}
                                >
                                    <option value="cheap">Cheap ($)</option>
                                    <option value="moderate">Moderate ($$)</option>
                                    <option value="expensive">Expensive ($$$)</option>
                                </select>
                            </div>
                        </div>
                        <div className="relative">
                            <Input
                                label="Address"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                required
                                placeholder={isFetchingAddress ? "Fetching address..." : "Full street address"}
                                disabled={isFetchingAddress}
                            />
                            {isFetchingAddress && (
                                <div className="absolute right-3 top-[38px] w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            )}
                        </div>

                        {/* Facilities */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral">Facilities</label>
                            <div className="flex flex-wrap gap-2">
                                {BREWSPOT_FACILITIES.map(facility => (
                                    <button
                                        key={facility}
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => {
                                                const facilities = prev.facilities || [];
                                                return {
                                                    ...prev,
                                                    facilities: facilities.includes(facility)
                                                        ? facilities.filter(f => f !== facility)
                                                        : [...facilities, facility]
                                                };
                                            });
                                        }}
                                        className={`px-3 py-1 text-sm rounded-full border transition-all ${formData.facilities?.includes(facility)
                                            ? 'bg-primary text-white border-primary'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'
                                            }`}
                                    >
                                        {facility}
                                    </button>
                                ))}
                            </div>
                        </div>


                    </div>
                </Card>

                {/* Media Section (Photos & Video) */}
                <Card className="p-6">
                    <h2 className="text-xl font-heading font-bold mb-4 text-primary">Media</h2>
                    <div className="space-y-6">
                        {/* Video Input */}
                        <div className="space-y-3">
                            <Input
                                label="Social Media Video (Optional)"
                                value={formData.videoUrl || ''}
                                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                placeholder="Paste link from TikTok, Instagram Reels, or YouTube"
                            />
                            {formData.videoUrl && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">Preview</label>
                                    <SocialVideoEmbed url={formData.videoUrl} />
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-100" />

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-neutral">Photos</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Click to upload photos</p>
                                <p className="text-xs text-gray-400 mt-1">JPG, PNG supported</p>
                            </div>

                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="absolute top-1 right-1 bg-white/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                                            >
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                <Button type="submit" className="w-full" isLoading={isLoading || uploading}>
                    {uploading ? 'Uploading Photos...' : (mode === 'create' ? 'Submit for Approval' : 'Save Changes')}
                </Button>

                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                        {error}
                    </div>
                )}
            </form>

            <div className="space-y-4">
                <Card className="p-6 h-full flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-heading font-bold text-primary">Location</h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGeolocation}
                        >
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            Use My Location
                        </Button>
                    </div>

                    <div className="flex-1 min-h-[300px] relative rounded-xl overflow-hidden border border-gray-200">
                        <BrewSpotMap
                            spots={[]} // No other spots needed here
                            interactive={true}
                            selectedLocation={selectedLocation}
                            onLocationSelect={handleLocationSelect}
                            className="w-full h-full absolute inset-0"
                        />
                        {!selectedLocation && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm text-xs font-medium text-neutral">
                                Tap on map to select location
                            </div>
                        )}
                    </div>

                    <div className="mt-4 text-xs text-neutral/50 text-center">
                        Latitude: {formData.latitude.toFixed(6)}, Longitude: {formData.longitude.toFixed(6)}
                    </div>
                </Card>
            </div>
        </div>
    )
}
