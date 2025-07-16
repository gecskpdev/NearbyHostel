"use client";

import { useState } from 'react';
import { signInWithGoogle } from '@/lib/firebase/auth';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

    const handleLoginWithGoogle = async () => {
        setLoading(true);
    setError('');
        try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError('Login was cancelled. Please try again.');
            } else {
        setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="flex flex-col items-center justify-center min-h-screen">
                <button
                    onClick={handleLoginWithGoogle}
                    disabled={loading}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
        {loading ? 'Logging in...' : 'Login with Google'}
                </button>
      {error && <div className="text-red-600 mt-4">{error}</div>}
        </div>
    );
}
