// pages/auth/reset-password.js
import { useState, useEffect } from 'react';
import supabase from '../../lib/supabase';
import { useRouter } from 'next/router';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        // ✅ Automatically set session using access_token and refresh_token
        const setSession = async () => {
            if (access_token && refresh_token) {
                const { error } = await supabase.auth.setSession({
                    access_token,
                    refresh_token,
                });

                if (error) {
                    console.error('Session error:', error.message);
                    setErrorMsg('Session expired or invalid. Please try resetting your password again.');
                }
            } else {
                setErrorMsg('Invalid or missing token. Please try resetting your password again.');
            }
        };

        setSession();
    }, []);

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (error) throw error;

            setSuccessMsg('Password reset successfully! Redirecting to login...');
            setTimeout(() => {
                router.push('/auth');
            }, 3000);
        } catch (err) {
            console.error('Password reset error:', err);
            setErrorMsg(err.message || 'An error occurred during password reset');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-6 bg-white rounded shadow-md w-96">
                {errorMsg && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{errorMsg}</div>}
                {successMsg && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{successMsg}</div>}

                <form onSubmit={handleResetPassword}>
                    <h1 className="text-xl font-bold mb-4">Set New Password</h1>
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border p-2 mb-4 w-full rounded"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}


