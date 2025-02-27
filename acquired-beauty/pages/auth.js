// pages/auth.js
import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useRouter } from 'next/router';

export default function Auth() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [isResetPassword, setIsResetPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const router = useRouter();

    // Clear messages when switching forms
    useEffect(() => {
        setErrorMsg('');
        setSuccessMsg('');
    }, [isSignUp, isResetPassword]);

    const validatePassword = (pass) => {
        if (pass.length < 6) {
            setErrorMsg('Password must be at least 6 characters long');
            return false;
        }
        return true;
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        try {
            if (isResetPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/auth/reset-password?email=${email}`,
                });
                if (error) throw error;
                setSuccessMsg('Password reset instructions sent to your email!');
                return;
            }

            if (isSignUp) {
                if (!validatePassword(password)) return;

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth`
                    }
                });

                if (error) throw error;
                setSuccessMsg('Success! Please check your email to confirm your account.');
                setIsSignUp(false);
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
                setSuccessMsg('Login successful!');
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('Auth error:', err);
            setErrorMsg(err.message || 'An error occurred during authentication');
        }
    };

    // Helper to render messages
    const renderMessage = () => {
        if (errorMsg) {
            return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                {errorMsg}
            </div>;
        }
        if (successMsg) {
            return <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                {successMsg}
            </div>;
        }
        return null;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="p-6 bg-white rounded shadow-md w-96">
                {renderMessage()}
                
                {isResetPassword ? (
                    <form onSubmit={handleAuth}>
                        <h1 className="text-xl font-bold mb-4">Reset Password</h1>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 mb-4 w-full rounded"
                            required
                        />
                        <button 
                            type="submit" 
                            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors mb-4"
                        >
                            Send Reset Instructions
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsResetPassword(false)}
                            className="w-full text-rose-500 hover:underline"
                        >
                            Back to Login
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleAuth}>
                        <h1 className="text-xl font-bold mb-4">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h1>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="border p-2 mb-2 w-full rounded"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="border p-2 mb-1 w-full rounded"
                            required
                        />
                        {isSignUp && (
                            <p className="text-xs text-gray-500 mb-4">
                                Password must be at least 6 characters long
                            </p>
                        )}
                        <button 
                            type="submit" 
                            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors mb-4"
                        >
                            {isSignUp ? 'Sign Up' : 'Login'}
                        </button>

                        <div className="text-center text-sm">
                            {isSignUp ? (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        type="button"
                                        onClick={() => setIsSignUp(false)}
                                        className="text-rose-500 hover:underline"
                                    >
                                        Login
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <div>
                                        Don&apos;t have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => setIsSignUp(true)}
                                            className="text-rose-500 hover:underline"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => setIsResetPassword(true)}
                                            className="text-rose-500 hover:underline"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
