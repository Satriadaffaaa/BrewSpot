'use client'

import { useState, useRef, useEffect } from 'react'
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from '@headlessui/react'
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/common/Button'
import { useAuth } from '@/providers/AuthProvider'
import { updateUserProfile } from '@/features/auth/api'
import Swal from 'sweetalert2'

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { user, profile } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const initialFocusRef = useRef<HTMLInputElement>(null);

    // Calculate days remaining for username change
    const [daysRemaining, setDaysRemaining] = useState(0);

    useEffect(() => {
        if (isOpen && user) {
            setDisplayName(user.displayName || '');
            setPreviewUrl(user.photoURL);
            setPhotoFile(null);

            // Check username change limit
            if (profile?.lastUsernameChange) {
                // Handle different Timestamp types if needed (Firestore vs Date)
                const lastChange = profile.lastUsernameChange.toDate ? profile.lastUsernameChange.toDate() : new Date(profile.lastUsernameChange as any);
                const nextAllowed = new Date(lastChange.getTime() + (3 * 24 * 60 * 60 * 1000));
                const now = new Date();

                if (now < nextAllowed) {
                    const msRemaining = nextAllowed.getTime() - now.getTime();
                    const daysLeft = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
                    setDaysRemaining(daysLeft);
                } else {
                    setDaysRemaining(0);
                }
            } else {
                setDaysRemaining(0);
            }
        }
    }, [isOpen, user, profile]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        try {
            await updateUserProfile(user.uid, {
                displayName: displayName !== user.displayName ? displayName : undefined,
                photoFile: photoFile || undefined
            });

            await Swal.fire({
                title: 'Success!',
                text: 'Your profile has been updated.',
                icon: 'success',
                confirmButtonColor: '#d97706'
            });

            onClose();
            // Optional: Trigger a reload or context update if needed, but AuthProvider generally listens to Auth changes.
            // However, Firestore snapshot listener in AuthProvider will pick up changes automatically.

        } catch (error: any) {
            console.error("Update failed", error);
            await Swal.fire({
                title: 'Error',
                text: error.message || 'Failed to update profile.',
                icon: 'error',
                confirmButtonColor: '#EF4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} initialFocus={initialFocusRef} transition className="relative z-50">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition duration-300 ease-out data-[closed]:opacity-0"
            />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel
                    transition
                    className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden transition duration-300 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 mx-4"
                >
                    <div className="flex items-center justify-between p-4 border-b">
                        <DialogTitle className="text-lg font-bold">Edit Profile</DialogTitle>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Photo Upload */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                        <CameraIcon className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CameraIcon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-primary font-medium hover:underline">
                                Change Photo
                            </button>
                        </div>

                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                            <input
                                type="text"
                                ref={initialFocusRef}
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500"
                                placeholder="Your Name"
                                disabled={daysRemaining > 0}
                            />
                            {daysRemaining > 0 && (
                                <p className="text-xs text-amber-600 mt-1">
                                    You can change your username again in {daysRemaining} day(s).
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
                            <Button variant="primary" type="submit" isLoading={isSubmitting}>
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
