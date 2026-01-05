'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

interface CounterItem {
    id: number;
    years: number;
    projects: number;
}

interface ApiError {
    error?: string;
    message?: string;
}

const EditCounter = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [formData, setFormData] = useState<CounterItem>({
        id: 0,
        years: 0,
        projects: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            const response = await axios.get<CounterItem>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/counter/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setFormData(response.data);
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            setError(axiosError.response?.data?.error || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseInt(value) || 0
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                router.push('/');
                return;
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/counter/${id}`,
                {
                    years: formData.years,
                    projects: formData.projects
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            router.push('/admin/counter');
        } catch (err) {
            const axiosError = err as AxiosError<ApiError>;
            setError(axiosError.response?.data?.error || 'Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-100 min-h-screen">
                <Sidebar />
                <div className="flex-1 p-6 ml-64 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-6 ml-64">
                <TokenTimer />

                <div className="mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Edit Counter #{formData.id}</h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Years Experience
                                </label>
                                <input
                                    type="number"
                                    name="years"
                                    value={formData.years}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">Количество лет опыта</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Projects Completed
                                </label>
                                <input
                                    type="number"
                                    name="projects"
                                    value={formData.projects}
                                    onChange={handleChange}
                                    min="0"
                                    max="1000"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">Количество завершенных проектов</p>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/counter')}
                                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditCounter;