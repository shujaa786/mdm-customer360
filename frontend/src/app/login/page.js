'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api/client';
import { endpoints } from '../../lib/api/endpoints';
export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };
    useEffect(() => {
        const token =
            localStorage.getItem('token');
        if (token) {
            router.push('/');
        }
    }, []);
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await apiClient.post(
                endpoints.auth.login(),
                form
            );
            login(
                res.token,
                res.user
            );
            const ROLE_ROUTES = {
                SUPER_ADMIN: '/',
                DATA_STEWARD: '/matches',
                SOURCE_OPERATOR: '/ingest',
                BUSINESS_USER: '/customer-search',
            };
            const userRole = res.user.role;
            const targetRoute =
                ROLE_ROUTES[userRole] || '/';
            router.push(targetRoute);
        } catch (err) {
            setError(
                err.message || 'Login failed'
            );
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            < form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
            >
                <h1 className="text-3xl font-bold mb-6">
                    MDM Login
                </h1 >
                {error && (
                    <p className="text-red-500 mb-4">
                        {error}
                    </p >
                )
                }
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border p-3 rounded mb-4"
                />
                <button
                    type="submit"
                    className="w-full bg-black text-white p-3 rounded"
                >
                    Login
                </button >
            </form >
        </div >
    );
}