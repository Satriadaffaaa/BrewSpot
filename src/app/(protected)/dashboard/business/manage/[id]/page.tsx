'use client'

import Link from 'next/link'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Container } from '@/components/common/Container'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { Input } from '@/components/common/Input'
import { useAuth } from '@/providers/AuthProvider'
import { getBrewSpotById, updateBrewSpot } from '@/features/brewspot/api'
import { BrewSpot, WeeklyHours } from '@/features/brewspot/types'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { AdminSwal, Toast } from '@/components/common/SweetAlert'
import { BusinessHoursInput } from '@/components/brewspot/form/BusinessHoursInput'
import { CATEGORIZED_FACILITIES } from '@/features/brewspot/constants'
import { 
    ArrowLeftIcon, 
    PhotoIcon, 
    BookOpenIcon, 
    ClockIcon, 
    ChatBubbleLeftRightIcon,
    CloudArrowUpIcon,
    CheckBadgeIcon,
    TrashIcon,
    PlusIcon,
    SparklesIcon
} from '@heroicons/react/24/outline'

export default function BusinessSpotManagerPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const unwrappedId = resolvedParams.id
    const { user, profile } = useAuth()
    const router = useRouter()
    const [spot, setSpot] = useState<BrewSpot | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Form States
    const [officialMenu, setOfficialMenu] = useState<File | null>(null)
    const [officialMenuUrl, setOfficialMenuUrl] = useState('')
    const [newPhotos, setNewPhotos] = useState<File[]>([])
    const [existingPhotos, setExistingPhotos] = useState<string[]>([])
    const [facilities, setFacilities] = useState<string[]>([])
    const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>({})

    useEffect(() => {
        async function fetchSpot() {
            try {
                const data = await getBrewSpotById(unwrappedId)
                // Security check
                if (data.ownerId !== user?.uid && profile?.role !== 'admin') {
                    router.push('/dashboard/business')
                    return
                }
                setSpot(data)
                setOfficialMenuUrl(data.officialMenuUrl || '')
                setExistingPhotos(data.officialPhotos || [])
                setFacilities(data.facilities || [])
                setWeeklyHours(data.weekly_hours || {})
                setLoading(false)
            } catch (error) {
                console.error(error)
                router.push('/dashboard/business')
            }
        }
        if (user) fetchSpot()
    }, [unwrappedId, user, profile, router])

    const handleFileUpload = async (file: File, folder: string) => {
        return await uploadToCloudinary(file, folder)
    }

    const handleUpdateOfficialData = async () => {
        if (!spot) return
        setSaving(true)
        try {
            let menuUrl = officialMenuUrl
            if (officialMenu) {
                menuUrl = await handleFileUpload(officialMenu, 'official_menus')
            }

            let uploadedPhotos: string[] = []
            if (newPhotos.length > 0) {
                uploadedPhotos = await Promise.all(
                    newPhotos.map(file => handleFileUpload(file, 'official_photos'))
                )
            }

            const updatedOfficialPhotos = [...existingPhotos, ...uploadedPhotos]

            // Note: We use updateBrewSpot but we will pass official fields
            // The API handles generic updates.
            await updateBrewSpot(spot.id, {
                officialMenuUrl: menuUrl,
                officialPhotos: updatedOfficialPhotos,
                facilities: facilities,
                weekly_hours: weeklyHours
            } as any)

            await Toast.fire({ icon: 'success', title: 'Data resmi berhasil diperbarui!' })
            setNewPhotos([])
            setOfficialMenuUrl(menuUrl)
            setExistingPhotos(updatedOfficialPhotos)
        } catch (error) {
            console.error(error)
            AdminSwal.fire('Error', 'Gagal memperbarui data resmi', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading || !spot) {
        return <div className="min-h-screen flex items-center justify-center">Memuat Manager...</div>
    }

    return (
        <Container className="py-8 md:py-12 max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <button 
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-neutral-400 hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest"
                >
                    <ArrowLeftIcon className="w-4 h-4" /> Kembali
                </button>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100 shadow-sm">
                    <CheckBadgeIcon className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Kontrol Owner Aktif</span>
                </div>
            </div>

            <div className="space-y-2">
                <h1 className="text-4xl font-black font-heading text-neutral-900 tracking-tight">{spot.name}</h1>
                <p className="text-neutral-500 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4" /> Manajemen Konten Resmi & Informasi Lokasi
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Official Content & Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Official Menu Section */}
                    <Card className="p-8 shadow-soft border-none space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <BookOpenIcon className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold font-heading text-neutral-800">Menu Resmi</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <p className="text-sm text-neutral-500">
                                    Menu resmi akan ditampilkan dengan prioritas tinggi di halaman detail. Pastikan foto menu jelas dan terbaca.
                                </p>
                                <div className="space-y-3">
                                    <Input 
                                        type="url" 
                                        placeholder="Masukkan Link Menu (Sangat Disarankan)" 
                                        value={officialMenuUrl}
                                        onChange={(e) => setOfficialMenuUrl(e.target.value)}
                                        className="w-full text-sm placeholder:text-neutral-300"
                                    />
                                    <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50 hover:border-primary/50 transition-colors cursor-pointer group">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={(e) => setOfficialMenu(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <CloudArrowUpIcon className="w-6 h-6 mx-auto mb-2 text-neutral-300 group-hover:text-primary transition-colors" />
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                            {officialMenu ? officialMenu.name : 'Atau Pilih Gambar (Opsional)'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-48 rounded-2xl bg-gray-100 overflow-hidden border border-gray-100">
                                {officialMenuUrl ? (
                                    officialMenuUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) || officialMenuUrl.includes('cloudinary') ? (
                                        <img src={officialMenuUrl} alt="Menu" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-blue-500 bg-blue-50 p-4 text-center">
                                            <BookOpenIcon className="w-10 h-10 mb-2" />
                                            <span className="text-xs font-bold uppercase tracking-widest">Link Menu Tertaut</span>
                                            <span className="text-[10px] opacity-70 mt-1 break-all truncate w-full">{officialMenuUrl}</span>
                                        </div>
                                    )
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300">
                                        <BookOpenIcon className="w-10 h-10 mb-2 opacity-50" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Belum Ada Menu</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Official Business Hours */}
                    <Card className="p-8 shadow-soft border-none space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <ClockIcon className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold font-heading text-neutral-800">Jam Operasional</h2>
                        </div>
                        <BusinessHoursInput 
                            value={weeklyHours}
                            onChange={setWeeklyHours}
                        />
                    </Card>

                    {/* Official Facilities Management */}
                    <Card className="p-8 shadow-soft border-none space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <SparklesIcon className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold font-heading text-neutral-800">Fasilitas Resmi</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(CATEGORIZED_FACILITIES).map(([group, groupFacilities]) => (
                                <div key={group} className="space-y-3 bg-gray-50/50 p-4 rounded-xl border border-border">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral/40 flex items-center gap-2">
                                        <span className="w-1 h-1 bg-primary/40 rounded-full" />
                                        {group}
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {groupFacilities.map(facility => {
                                            const isSelected = facilities.includes(facility)
                                            return (
                                                <button
                                                    key={facility}
                                                    type="button"
                                                    onClick={() => {
                                                        const newFacilities = isSelected
                                                            ? facilities.filter(f => f !== facility)
                                                            : [...facilities, facility]
                                                        setFacilities(newFacilities)
                                                    }}
                                                    className={`px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-all duration-200 flex items-center gap-1.5 ${isSelected
                                                        ? 'bg-primary text-white border-primary shadow-sm scale-[1.02]'
                                                        : 'bg-surface text-gray-500 border-border hover:border-primary/30 hover:text-primary hover:bg-primary/5'
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                    {facility}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Official Gallery Section */}
                    <Card className="p-8 shadow-soft border-none space-y-6">
                        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                            <PhotoIcon className="w-6 h-6 text-primary" />
                            <h2 className="text-xl font-bold font-heading text-neutral-800">Galeri Foto Resmi</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {existingPhotos.map((url, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                                    <img src={url} alt="Official" className="w-full h-full object-cover" />
                                    <button 
                                        onClick={() => setExistingPhotos(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <div className="aspect-square rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center relative hover:border-primary/50 cursor-pointer transition-colors group">
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={(e) => setNewPhotos(prev => [...prev, ...Array.from(e.target.files || [])])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="text-center">
                                    <PlusIcon className="w-6 h-6 mx-auto text-neutral-300 group-hover:text-primary transition-colors" />
                                    <span className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest">Tambah</span>
                                </div>
                            </div>
                        </div>
                        {newPhotos.length > 0 && (
                            <p className="text-xs font-bold text-primary italic">
                                + {newPhotos.length} foto baru siap diunggah
                            </p>
                        )}
                    </Card>

                    <div className="flex justify-end">
                        <Button 
                            size="lg" 
                            className="px-12 rounded-xl shadow-xl h-14" 
                            onClick={handleUpdateOfficialData}
                            isLoading={saving}
                        >
                            Simpan Perubahan Resmi
                        </Button>
                    </div>
                </div>

                {/* Right Column: Interaction & Quick View */}
                <div className="space-y-8">
                    <Card className="p-6 bg-neutral-900 text-white rounded-3xl border-none">
                        <h3 className="font-bold font-heading text-xl mb-4 flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary" /> Interaction Hub
                        </h3>
                        <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                            Interaksi langsung dengan pelanggan meningkatkan loyalitas hingga 60%. Balasan Anda akan ditandai sebagai <b>"Official Owner Response"</b>.
                        </p>
                        <Link href={`/spot/${spot.id}`}>
                            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 rounded-xl">
                                Balas Ulasan Terbaru
                            </Button>
                        </Link>
                    </Card>

                    <Card className="p-6 bg-primary/5 border-primary/20 rounded-3xl shadow-none">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Tips Optimasi</h4>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-sm text-neutral-600">
                                <CheckBadgeIcon className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                <span><b>Sangat Disarankan:</b> Gunakan Tautan/Link (contoh: Google Drive, PDF, dsb) untuk mengunggah menu resmi agar kualitas gambar tidak pecah saat dibaca via Ponsel.</span>
                            </li>
                            <li className="flex gap-3 text-sm text-neutral-600">
                                <CheckBadgeIcon className="w-5 h-5 text-green-500 shrink-0" />
                                Galeri foto resmi akan menggantikan foto user pada bagian teratas pencarian.
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </Container>
    )
}
