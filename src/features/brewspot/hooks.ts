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

import { useRouter } from 'next/navigation'
import { getCategoryOrDefault } from './types'
import { uploadToCloudinary } from '@/lib/cloudinary'

export function useBrewSpotForm(
    mode: 'create' | 'edit',
    onSubmit: (data: AddBrewSpotInput) => Promise<void>,
    initialData?: Partial<AddBrewSpotInput>
) {
    const router = useRouter()
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [isFetchingAddress, setIsFetchingAddress] = useState(false)

    const [formData, setFormData] = useState<AddBrewSpotInput>({
        name: initialData?.name || '',
        address: initialData?.address || '',
        city: initialData?.city || '',
        latitude: initialData?.latitude || 0,
        longitude: initialData?.longitude || 0,
        price_range: initialData?.price_range || 'moderate',
        facilities: initialData?.facilities || [],
        photos: initialData?.photos || [],
        description: initialData?.description || '',
        tags: initialData?.tags || [],
        videoUrl: initialData?.videoUrl || '',
        category: getCategoryOrDefault(initialData || { category: 'cafe' }),
        ...initialData
    })

    const [selectedFiles, setSelectedFiles] = useState<File[]>([])
    const [previewUrls, setPreviewUrls] = useState<string[]>([])
    const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(
        initialData?.latitude && initialData?.longitude
            ? [initialData.latitude, initialData.longitude]
            : null
    )

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

    const fetchAddress = async (lat: number, lng: number) => {
        setIsFetchingAddress(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                {
                    headers: {
                        'User-Agent': 'Lokali-App/1.0 (https://lokali.web.app)'
                    }
                }
            )
            const data = await response.json()

            if (data && data.address) {
                const city = data.address.city || 
                             data.address.town || 
                             data.address.village || 
                             data.address.city_district ||
                             data.address.county || 
                             ''
                
                const fullAddress = data.display_name

                setFormData(prev => ({
                    ...prev,
                    address: fullAddress,
                    city: city,
                    latitude: lat,
                    longitude: lng
                }))
            } else {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }))
            }
        } catch (error) {
            console.error("Error fetching address:", error)
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
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setPreviewUrls(prev => [...prev, ...newPreviews])
        }
    }

    const removeFile = (index: number) => {
        const urlToRemove = previewUrls[index];
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));

        if (urlToRemove.startsWith('blob:')) {
            URL.revokeObjectURL(urlToRemove)
            const currentExistingCount = formData.photos.length;
            if (index < currentExistingCount) {
                setFormData(prev => ({
                    ...prev,
                    photos: prev.photos.filter((_, i) => i !== index)
                }))
            } else {
                const fileIndex = index - currentExistingCount;
                setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
            }
        } else {
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
            let newPhotoUrls: string[] = [];
            if (selectedFiles.length > 0) {
                const sanitizedName = formData.name.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'unnamed_spot';
                const folderPath = `brewspots/${sanitizedName}`;
                newPhotoUrls = await Promise.all(
                    selectedFiles.map(file => uploadToCloudinary(file, folderPath))
                )
            }

            const finalPhotos = [...formData.photos, ...newPhotoUrls];
            await onSubmit({ ...formData, photos: finalPhotos })

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

    return {
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
    }
}
