'use client'

import { Card } from '@/components/common/Card'
import { Input } from '@/components/common/Input'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { SocialVideoEmbed } from '@/components/common/SocialVideoEmbed'

interface MediaStepProps {
    videoUrl: string
    menuUrl?: string
    previewUrls: string[]
    onVideoUrlChange: (url: string) => void
    onMenuUrlChange: (url: string) => void
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
    onRemoveFile: (index: number) => void
}

export function MediaStep({
    videoUrl,
    menuUrl,
    previewUrls,
    onVideoUrlChange,
    onMenuUrlChange,
    onFileSelect,
    onRemoveFile
}: MediaStepProps) {
    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <PhotoIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-heading font-bold text-primary">Langkah 4: Media & Informasi Tambahan</h2>
            </div>
            <div className="space-y-6">
                {/* Menu Input */}
                <div className="space-y-3">
                    <Input
                        label="Link Menu (Opsional)"
                        value={menuUrl || ''}
                        onChange={e => onMenuUrlChange(e.target.value)}
                        placeholder="Tempel link menu (Google Drive, Dropbox, atau link foto/PDF)"
                    />
                    <p className="text-xs text-neutral/50">
                        Tips: Jika menu dalam bentuk foto, kamu bisa mengunggahnya ke Google Drive atau link lainnya lalu tempelkan linknya di sini.
                    </p>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Video Input */}
                <div className="space-y-3">
                    <Input
                        label="Video Media Sosial (Opsional)"
                        value={videoUrl || ''}
                        onChange={e => onVideoUrlChange(e.target.value)}
                        placeholder="Tempel link dari TikTok, Instagram Reels, atau YouTube"
                    />
                    {videoUrl && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-border">
                            <label className="text-xs font-medium text-gray-400 mb-2 block uppercase tracking-wider">Preview</label>
                            <SocialVideoEmbed url={videoUrl} />
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
                            onChange={onFileSelect}
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
                                        onClick={() => onRemoveFile(idx)}
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
    )
}
