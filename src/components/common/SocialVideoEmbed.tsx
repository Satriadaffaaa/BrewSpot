import { PlayIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface SocialVideoEmbedProps {
    url?: string
    className?: string
}

export function SocialVideoEmbed({ url, className = "" }: SocialVideoEmbedProps) {
    const [isPlaying, setIsPlaying] = useState(false)

    if (!url) return null

    const getEmbedUrl = (videoUrl: string) => {
        try {
            const urlObj = new URL(videoUrl)

            // YouTube / YouTube Shorts
            if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                let videoId = ''
                if (urlObj.hostname.includes('youtu.be')) {
                    videoId = urlObj.pathname.slice(1)
                } else if (urlObj.pathname.includes('/shorts/')) {
                    videoId = urlObj.pathname.split('/shorts/')[1]
                } else {
                    videoId = urlObj.searchParams.get('v') || ''
                }
                if (!videoId) return null
                return {
                    type: 'youtube',
                    src: `https://www.youtube.com/embed/${videoId}?autoplay=1`,
                    label: 'YouTube',
                    vertical: false
                }
            }

            // Instagram (Reels/Posts)
            if (urlObj.hostname.includes('instagram.com')) {
                // Remove query params and trailing slash
                const cleanPath = urlObj.pathname.replace(/\/$/, "")
                // Ensure /embed is appended correctly.
                // Some URLs are like /p/ID or /reel/ID.
                // Standard embed: https://www.instagram.com/p/ID/embed
                return {
                    type: 'instagram',
                    src: `https://www.instagram.com${cleanPath}/embed/captioned/`,
                    label: 'Instagram',
                    vertical: true
                }
            }

            // TikTok (Improved detection)
            if (urlObj.hostname.includes('tiktok.com')) {
                // Format: https://www.tiktok.com/@user/video/VIDEO_ID
                const parts = urlObj.pathname.split('/')
                const videoId = parts[parts.length - 1]

                if (videoId && /^\d+$/.test(videoId)) {
                    // Use TikTok Embed Iframe
                    return {
                        type: 'tiktok',
                        src: `https://www.tiktok.com/embed/v2/${videoId}`,
                        label: 'TikTok',
                        vertical: true
                    }
                }

                // Fallback if ID parsing fails
                return { type: 'link', src: videoUrl, label: 'TikTok', vertical: false }
            }

            return { type: 'link', src: videoUrl, label: 'External Video', vertical: false }
        } catch (e) {
            return null
        }
    }

    const embed = getEmbedUrl(url)
    if (!embed) return null

    if (embed.type === 'link') {
        return (
            <a
                href={embed.src}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors text-primary font-medium w-full ${className}`}
            >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <PlayIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">Watch Video</span>
                    <span className="text-xs text-gray-500">on {embed.label}</span>
                </div>
            </a>
        )
    }

    const aspectRatioClass = embed.vertical
        ? 'aspect-[9/16] max-w-[325px] mx-auto'
        : 'aspect-video w-full'

    if (!isPlaying) {
        return (
            <div
                className={`relative bg-black/5 rounded-xl border border-gray-100 overflow-hidden cursor-pointer group flex items-center justify-center ${aspectRatioClass} ${className}`}
                onClick={() => setIsPlaying(true)}
            >
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors" />
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <PlayIcon className="w-6 h-6 text-primary ml-1" />
                </div>
                <span className="absolute bottom-3 text-xs font-medium text-gray-500 bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
                    Click to Play Video
                </span>
            </div>
        )
    }

    return (
        <div className={`rounded-xl overflow-hidden bg-black border border-gray-100 ${aspectRatioClass} ${className}`}>
            <iframe
                src={embed.src}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    )
}
