'use client'

import { PRICE_OPTIONS } from '@/utils/price'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { Card } from '@/components/common/Card'
import { AddBrewSpotInput, BrewSpot, getCategoryOrDefault } from '@/features/brewspot/types'
import { BREWSPOT_FACILITIES, CATEGORIZED_FACILITIES } from '@/features/brewspot/constants'
import { MapPinIcon, PhotoIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { SPOT_CATEGORIES } from '@/features/brewspot/types'
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
            // Using a specific User-Agent as required by Nominatim usage policy
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
                // Better city detection for Indonesian structure
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

            // Create preview URLs
            const newPreviews = files.map(file => URL.createObjectURL(file))
            setPreviewUrls(prev => [...prev, ...newPreviews])
        }
    }


    const removeFile = (index: number) => {
        const totalExisting = initialData?.photos?.length || 0;

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
                        Lokasi yang kamu tambahkan akan ditinjau admin sebelum tampil ke publik.
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
        <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Category Selection */}
                <Card className="p-6 border-b-4" style={{ borderBottomColor: SPOT_CATEGORIES[formData.category || 'cafe'].color }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-heading font-bold text-primary">
                            Langkah 1: Pilih Kategori
                        </h2>
                        <span className="text-xs font-bold px-2 py-1 bg-primary/5 text-primary rounded-full uppercase tracking-wider">Wajib</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(Object.entries(SPOT_CATEGORIES) as [any, typeof SPOT_CATEGORIES['cafe']][]).map(([key, data]) => {
                            const isSelected = formData.category === key
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: key })}
                                    className={`relative p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-3 group ${
                                        isSelected
                                            ? 'bg-primary/5 border-primary shadow-md ring-4 ring-primary/10'
                                            : 'bg-surface border-border hover:border-primary/30 hover:shadow-sm'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 ${isSelected ? 'bg-primary text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                        {data.icon}
                                    </div>
                                    <span className={`text-xs font-bold text-center leading-tight ${isSelected ? 'text-primary' : 'text-gray-500'}`}>
                                        {data.label}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </Card>

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
                                onClick={handleGeolocation}
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
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    required
                                    placeholder="misal: Jakarta Selatan"
                                />
                            </div>
                            <div className="md:col-span-8 relative">
                                <Input
                                    label="Alamat"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
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
                                onClick={handleGeolocation}
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
                                    Lat: {formData.latitude.toFixed(4)} • Lng: {formData.longitude.toFixed(4)}
                                </span>
                            </div>
                            <div className="h-[300px] relative rounded-2xl overflow-hidden border border-border shadow-sm">
                                <BrewSpotMap
                                    spots={[]}
                                    interactive={true}
                                    selectedLocation={selectedLocation}
                                    onLocationSelect={handleLocationSelect}
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

                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-heading font-bold text-primary">
                            Langkah 3: Detail & Klasifikasi
                        </h2>
                    </div>
                    <div className="space-y-6">
                        <Input
                            label="Nama Tempat / Lokasi"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="misal: Kopi Kenangan Mantan"
                        />

                        {/* Description / Founder's Note */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-neutral">Apa yang Spesial dari Tempat Ini? (Opsional)</label>
                            <textarea
                                className="w-full min-h-[120px] rounded-xl border border-gray-300 bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-gray-400"
                                placeholder="Ceritakan suasana, menu jagoan, atau alasan kenapa orang harus ke sini..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-neutral">Rentang Harga</label>
                                <span className="text-[10px] bg-neutral-100 text-neutral/60 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Estimasi per orang</span>
                            </div>
                            
                            <div className="flex p-1.5 bg-gray-50 rounded-2xl border border-border shadow-inner">
                                {PRICE_OPTIONS.map((option, idx) => {
                                    const isSelected = formData.price_range === option.value;
                                    const symbols = ["$", "$$", "$$$"];
                                    
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, price_range: option.value as any })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 ${isSelected
                                                ? 'bg-surface text-primary shadow-sm border border-border'
                                                : 'text-neutral-500 hover:text-primary hover:bg-surface/50'
                                                }`}
                                        >
                                            <span className={`text-xs font-black ${isSelected ? 'text-primary' : 'text-primary/40'}`}>
                                                {symbols[idx]}
                                            </span>
                                            <div className="flex flex-col items-start">
                                                <span className="text-xs font-bold leading-none">
                                                    {option.label.split(' (')[0]}
                                                </span>
                                                <span className="text-[9px] opacity-60 leading-tight">
                                                    {option.label.match(/\((.*?)\)/)?.[1] || ''}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Facilities */}
                        <div className="space-y-4 pt-4 border-t border-border">
                            <label className="text-sm font-bold text-neutral flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                                <span>Pilih Fasilitas yang Tersedia</span>
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Object.entries(CATEGORIZED_FACILITIES).map(([group, facilities]) => (
                                    <div key={group} className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-border">
                                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral/40 flex items-center gap-2">
                                            <span className="w-1 h-1 bg-primary/40 rounded-full" />
                                            {group}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {facilities.map(facility => {
                                                const isSelected = formData.facilities?.includes(facility)
                                                return (
                                                    <button
                                                        key={facility}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => {
                                                                const current = prev.facilities || [];
                                                                return {
                                                                    ...prev,
                                                                    facilities: current.includes(facility)
                                                                        ? current.filter(f => f !== facility)
                                                                        : [...current, facility]
                                                                };
                                                            });
                                                        }}
                                                        className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${isSelected
                                                            ? 'bg-primary text-white border-primary shadow-sm scale-[1.02]'
                                                            : 'bg-surface text-gray-500 border-border hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                                                            }`}
                                                    >
                                                        {isSelected ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                            </svg>
                                                        ) : (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                                                        )}
                                                        {facility}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Media Section (Photos & Video) */}
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <PhotoIcon className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-heading font-bold text-primary">Langkah 4: Media Foto & Video</h2>
                    </div>
                    <div className="space-y-6">
                        {/* Video Input */}
                        <div className="space-y-3">
                            <Input
                                label="Video Media Sosial (Opsional)"
                                value={formData.videoUrl || ''}
                                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                                placeholder="Tempel link dari TikTok, Instagram Reels, atau YouTube"
                            />
                            {formData.videoUrl && (
                                <div className="bg-gray-50 p-4 rounded-xl border border-border">
                                    <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">Preview</label>
                                    <SocialVideoEmbed url={formData.videoUrl} />
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-gray-100" />

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-neutral">Foto Lokasi</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Klik untuk unggah foto</p>
                                <p className="text-xs text-gray-400 mt-1">Mendukung format JPG, PNG</p>
                            </div>

                            {previewUrls.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {previewUrls.map((url, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(idx)}
                                                className="absolute top-1 right-1 bg-surface/90 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
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


                <Button type="submit" className="w-full py-6 text-lg shadow-xl shadow-primary/20 rounded-2xl font-bold tracking-wide" isLoading={isLoading || uploading}>
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
        </div >
    )
}

