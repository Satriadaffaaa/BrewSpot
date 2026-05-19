'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/common/Container'
import { LokaliLogo } from '@/components/ui/LokaliLogo'

export function Footer() {
    const pathname = usePathname()
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

    useEffect(() => {
        setCurrentYear(new Date().getFullYear())
    }, [])

    if (pathname?.startsWith('/admin')) return null

    return (
        <footer className="bg-primary text-[#F5E6D3] pt-24 pb-12 mt-auto border-t border-white/5">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
                    <div className="col-span-1 md:col-span-6 space-y-8">
                        <Link href="/" className="inline-block group transition-transform hover:scale-105 active:scale-95">
                            <LokaliLogo size="md" theme="light" />
                        </Link>
                        <p className="text-[#F5E6D3]/60 text-lg font-medium max-w-md leading-relaxed">
                            Lokali adalah komunitas global untuk pecinta eksplorasi lokal. Kami membantu Anda menemukan spot-spot unik dan cerita di balik setiap tempat.
                        </p>
                        <div className="flex gap-6">
                            {/* Social Media Placeholders with Premium feel */}
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent hover:text-[#1a1a2e] transition-all cursor-pointer">
                                    <div className="w-5 h-5 bg-current opacity-60" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-3">
                        <h3 className="font-heading font-black text-white text-xs uppercase tracking-[0.2em] mb-8">Navigation</h3>
                        <ul className="space-y-4 text-base font-medium">
                            <li>
                                <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/explore" className="hover:text-accent transition-colors">Explore</Link>
                            </li>
                            <li>
                                <Link href="/leaderboard" className="hover:text-accent transition-colors">Ranking</Link>
                            </li>
                        </ul>
                    </div>

                    <div className="col-span-1 md:col-span-3">
                        <h3 className="font-heading font-black text-white text-xs uppercase tracking-[0.2em] mb-8">Legal</h3>
                        <ul className="space-y-4 text-base font-medium">
                            <li>
                                <Link href="#" className="hover:text-accent transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-accent transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-accent transition-colors">Cookie Policy</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-[#F5E6D3]/40">
                    <p>&copy; {currentYear} Lokali. All rights reserved.</p>
                    <p className="mt-4 md:mt-0 italic">Dibuat dengan cinta untuk Bangga Lokal.</p>
                </div>
            </Container>
        </footer>
    )
}
