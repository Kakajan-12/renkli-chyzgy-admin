'use client';

import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import React, { useEffect, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import {
    TrashIcon,
    PencilIcon,
    PlusCircleIcon
} from "@heroicons/react/16/solid";

interface LinkType {
    id: number;
    text: string;
    url: string;
}

const SocialLinks = () => {
    const [links, setLinks] = useState<LinkType[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const router = useRouter();

    const formatSocialName = (text: string): string => {
        const socialNames: Record<string, string> = {
            'facebook': 'Facebook',
            'instagram': 'Instagram',
            'twitter': 'Twitter / X',
            'linkedin': 'LinkedIn',
            'telegram': 'Telegram',
            'whatsapp': 'WhatsApp',
            'tiktok': 'TikTok',
            'youtube': 'YouTube',
            'pinterest': 'Pinterest',
            'snapchat': 'Snapchat',
            'vkontakte': 'VKontakte',
            'vk': 'VK',
            'odnoklassniki': 'Одноклассники',
            'ok': 'Одноклассники',
            'wechat': 'WeChat',
            'line': 'Line',
            'skype': 'Skype',
            'discord': 'Discord',
            'reddit': 'Reddit',
            'twitch': 'Twitch'
        };

        const lowerText = text.toLowerCase();
        return socialNames[lowerText] || text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    useEffect(() => {
        const fetchLinks = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/links`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setLinks(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError('Ошибка при получении данных');
                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push('/');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchLinks();
    }, [router]);

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/links/${deleteId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLinks(prev => prev.filter(link => link.id !== deleteId));
            setDeleteId(null);
            setShowModal(false);
        } catch (err) {
            console.error("Ошибка при удалении:", err);
            setError('Ошибка при удалении ссылки');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex bg-gray-100">
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

                <div className="max-w-6xl mx-auto">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Social Links</h1>
                        </div>
                        <Link
                            href="/admin/social-links/add-link"
                            className="bg text-white py-2 px-6 rounded-lg flex items-center"
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
                        {links.length === 0 ? (
                            <div className="p-12 text-center">
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No data</h3>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Social Network
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            URL / Link
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {links.map((link) => (
                                        <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${(link.text)}`}>
                                                                {formatSocialName(link.text)}
                                                            </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs lg:max-w-md xl:max-w-lg truncate">
                                                    <a
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                    >
                                                        {link.url}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <Link
                                                        href={`/admin/social-links/edit-link/${link.id}`}
                                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="w-4 h-4 mr-2" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setDeleteId(link.id);
                                                            setShowModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-4 h-4 mr-2" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Social Link</h3>
                            <p className="text-gray-600">
                                Are you sure you want to delete this social link? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => {
                                    setDeleteId(null);
                                    setShowModal(false);
                                }}
                                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <TrashIcon className="w-4 h-4 mr-2" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialLinks;