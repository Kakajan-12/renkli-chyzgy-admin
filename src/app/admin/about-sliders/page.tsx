'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import { PlusCircleIcon, TrashIcon, PencilIcon } from "@heroicons/react/16/solid";
import Image from "next/image";

type GalleryItem = {
    id: number;
    image: string;
    blog_title_tk?: string;
    blog_title_en?: string;
    blog_title_ru?: string;
    created_at?: string;
};

const AboutGallery = () => {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return router.push('/');

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/about-gallery`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setGallery(response.data);
        } catch (err) {
            setError('Ошибка при получении данных');
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                router.push('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Удалить изображение?')) return;

        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/about-gallery/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setGallery(prev => prev.filter(item => item.id !== id));
        } catch (err) {
            setError('Ошибка при удалении');
        }
    };

    // Функция для исправления URL - заменяет обратные слеши на обычные
    const fixImageUrl = (url: string) => {
        return url.replace(/\\/g, '/');
    };

    return (
        <div className="flex bg-gray-50">
            <Sidebar />
            <div className="flex-1 p-6 ml-64">
                <TokenTimer />

                <div className="mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">About Gallery</h1>
                    </div>

                    <div className="mb-6 flex justify-end items-center">
                        <Link
                            href="/admin/about-sliders/add-gallery"
                            className="inline-flex items-center bg text-white font-medium py-2 px-4 rounded-lg"
                        >
                            <PlusCircleIcon className="w-5 h-5 mr-2" />
                            Add
                        </Link>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="mt-4 text-gray-600">loading...</p>
                            </div>
                        ) : gallery.length === 0 ? (
                            <div className="p-12 text-center">
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Images not found</h3>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Image Preview
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            File Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {gallery.map((item) => {
                                        // Исправляем URL изображения
                                        const fixedImageUrl = fixImageUrl(`${process.env.NEXT_PUBLIC_API_URL}/${item.image}`);

                                        return (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{item.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="relative w-16 h-16">
                                                        {/* Вариант 1: Используем обычный img тег */}
                                                        <img
                                                            src={fixedImageUrl}
                                                            alt={`Image ${item.id}`}
                                                            className="object-cover rounded w-16 h-16"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="max-w-xs truncate">
                                                        {item.image.split('\\').pop() || item.image.split('/').pop()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/admin/about-sliders/edit-gallery/${item.id}`}
                                                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="w-5 h-5" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutGallery;