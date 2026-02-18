'use client'

import { useEffect, useRef, useState } from 'react'

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onError?: () => void;
    onExpire?: () => void;
    siteKey?: string;
}

declare global {
    interface Window {
        turnstile?: {
            render: (element: HTMLElement | string, options: any) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        }
    }
}

export const TurnstileWidget = ({
    onVerify,
    onError,
    onExpire,
    siteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY || '1x00000000000000000000AA' // Default to test key if not set
}: TurnstileWidgetProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    // Store callbacks in refs to avoid re-initializing the widget when they change
    const callbacksRef = useRef({ onVerify, onError, onExpire });
    useEffect(() => {
        callbacksRef.current = { onVerify, onError, onExpire };
    }, [onVerify, onError, onExpire]);

    useEffect(() => {
        // Function to initialize the widget
        const renderWidget = () => {
            if (window.turnstile && containerRef.current && !widgetIdRef.current) {
                const id = window.turnstile.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token: string) => {
                        if (callbacksRef.current.onVerify) callbacksRef.current.onVerify(token);
                    },
                    'error-callback': () => {
                        if (callbacksRef.current.onError) callbacksRef.current.onError();
                    },
                    'expired-callback': () => {
                        if (callbacksRef.current.onExpire) callbacksRef.current.onExpire();
                    },
                    theme: 'auto',
                });
                widgetIdRef.current = id;
            }
        };

        // If script is already loaded
        if (window.turnstile) {
            renderWidget();
        } else {
            // Load script if not present
            if (!document.getElementById('cf-turnstile-script')) {
                const script = document.createElement('script');
                script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
                script.id = 'cf-turnstile-script';
                script.async = true;
                script.defer = true;
                script.onload = renderWidget;
                document.head.appendChild(script);
            } else {
                // If script tag exists but window.turnstile isn't ready
                const script = document.getElementById('cf-turnstile-script');
                if (script) {
                    const prevOnLoad = script.onload;
                    script.onload = (e) => {
                        if (typeof prevOnLoad === 'function') prevOnLoad(e as Event);
                        renderWidget();
                    }
                }
            }
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [siteKey]); // Only re-run if siteKey changes, ignore callbacks

    return <div ref={containerRef} className="my-4 min-h-[65px]" />;
}
