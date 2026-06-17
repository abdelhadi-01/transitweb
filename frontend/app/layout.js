'use client';

import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import './globals.css';

export default function RootLayout({ children }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <html lang="fr" suppressHydrationWarning>
            <body suppressHydrationWarning>
                <AuthProvider>
                    {isClient ? (
                        <>
                            {children}
                            <Toaster position="top-right" />
                        </>
                    ) : (
                        <div style={{ visibility: 'hidden' }}>{children}</div>
                    )}
                </AuthProvider>
            </body>
        </html>
    );
}