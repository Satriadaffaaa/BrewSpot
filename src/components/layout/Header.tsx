'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/common/Container'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/providers/AuthProvider'
import { Dropdown, DropdownItem } from '@/components/common/Dropdown'
import { UserIcon, ArrowRightOnRectangleIcon, PlusIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Dialog, DialogPanel } from '@headlessui/react'

export function Header() {
  const { user, loading: isLoading, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const userDropdownItems: DropdownItem[] = [
    {
      label: 'Profile',
      href: '/profile',
      icon: <UserIcon className="w-5 h-5" />
    },
    {
      label: 'Sign out',
      onClick: () => signOut(),
      icon: <ArrowRightOnRectangleIcon className="w-5 h-5" />,
      variant: 'danger'
    }
  ]

  const pathname = usePathname()

  if (pathname?.startsWith('/admin')) return null

  return (
    <header className="border-b border-primary/10 bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-soft">
      <Container className="flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-bold text-primary font-heading tracking-tight group-hover:text-primary-light transition-colors">
              BrewSpot
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {['Home', 'Explore', 'Leaderboard'].map((item) => (
            <Link
              key={item}
              href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="text-sm font-medium text-neutral-light hover:text-primary transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Desktop User Actions */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="w-24 h-10 bg-gray-100 rounded-full animate-pulse" />
          ) : user ? (
            <>
              <Link href="/add-brewspot">
                <Button variant="ghost" size="sm" className="rounded-full">
                  <PlusIcon className="w-5 h-5 mr-1" /> Add Spot
                </Button>
              </Link>
              <Dropdown
                trigger={
                  <Button variant="ghost" size="sm" aria-label="User Menu" className="rounded-full px-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <UserIcon className="w-4 h-4" />
                      )}
                    </div>
                  </Button>
                }
                items={userDropdownItems}
              />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="font-medium">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="px-6 shadow-md hover:shadow-lg">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-primary"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon className="h-7 w-7" aria-hidden="true" />
          </button>
        </div>
      </Container>

      {/* Mobile Menu Dialog */}
      <Dialog as="div" className="md:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background px-6 py-6 sm:max-w-sm ring-1 ring-gray-900/10 shadow-xl">
          <div className="flex items-center justify-between">
            <Link href="/" className="-m-1.5 p-1.5">
              <span className="text-2xl font-bold text-primary font-heading tracking-tight">BrewSpot</span>
            </Link>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-neutral"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-8 flow-root">
            <div className="-my-6 divide-y divide-gray-100">
              <div className="space-y-2 py-6">
                {['Home', 'Explore', 'Leaderboard'].map((item) => (
                  <Link
                    key={item}
                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="-mx-3 block rounded-lg px-3 py-3 text-lg font-medium leading-7 text-neutral hover:bg-secondary/50 hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </Link>
                ))}
              </div>
              <div className="py-6">
                {user ? (
                  <>
                    <div className="flex items-center gap-4 mb-6 px-3 bg-secondary/30 p-4 rounded-xl">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-neutral">{user.displayName}</span>
                        <span className="text-sm text-neutral/60">{user.email}</span>
                      </div>
                    </div>
                    <Link
                      href="/add-brewspot"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-neutral hover:bg-gray-50 group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-colors">
                          <PlusIcon className="w-5 h-5" />
                        </div>
                        Add BrewSpot
                      </span>
                    </Link>
                    <Link
                      href="/profile"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-neutral hover:bg-gray-50 group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-white transition-colors">
                          <UserIcon className="w-5 h-5" />
                        </div>
                        My Profile
                      </span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-medium leading-7 text-red-600 hover:bg-red-50 mt-4"
                    >
                      <span className="flex items-center">
                        <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                        Sign out
                      </span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-4">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-center">Log in</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-center shadow-md">Sign up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
