'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/common/Container'

export function Footer() {
    const pathname = usePathname()
    const currentYear = new Date().getFullYear()

    if (pathname?.startsWith('/admin')) return null

    return (
        <footer className="bg-primary text-secondary py-12 mt-auto">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold font-heading tracking-tight text-white mb-4 block">
                                BrewSpot
                            </span>
                        </Link>
                        <p className="text-secondary/80 text-sm max-w-sm">
                            Discovering the best coffee spots in town, one check-in at a time.
                            Join our community of coffee lovers.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold text-white mb-4">Navigation</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
                            </li>
                            <li>
                                <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-heading font-semibold text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-secondary/20 mt-12 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-secondary/60">
                    <p>&copy; {currentYear} BrewSpot. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        {/* Social icons would go here */}
                    </div>
                </div>
            </Container>
        </footer>
    )
}
