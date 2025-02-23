// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard({ user }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user === undefined) return; 
        if (!user) {
            router.push('/auth'); 
        } else {
            setLoading(false); 
        }
    }, [user, router]);

    if (loading) return <p>Loading...</p>;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <h1 className="text-2xl">
                Welcome, {user ? user.email : 'Guest'}
            </h1>
        </div>
    );
}


