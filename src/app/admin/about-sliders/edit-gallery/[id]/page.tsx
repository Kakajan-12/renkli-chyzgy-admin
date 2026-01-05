'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError, AxiosResponse } from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { DocumentIcon } from "@heroicons/react/16/solid";

interface GalleryData {
    id: number;
    image: string;
    created_at?: string;
    updated_at?: string;
}

interface ApiError {
    error?: string;
    message?: string;
}

interface ApiResponse {
    data?: GalleryData;
    error?: string;
    message?: string;
}

const EditGallery = () => {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const [data, setData] = useState<GalleryData | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [previewURL, setPreviewURL] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response: AxiosResponse<GalleryData | ApiError> = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/about-gallery/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        signal: controller.signal
                    }
                );

                if (isMounted.current) {
                    if ('id' in response.data) {
                        setData(response.data as GalleryData);
                    } else {
                        const errorData = response.data as ApiError;
                        setError(errorData.error || 'Данные не найдены');
                    }
                    setLoading(false);
                }
            } catch (err: unknown) {
                if (isMounted.current) {
                    console.error('Ошибка при загрузке данных:', err);

                    if (axios.isAxiosError(err)) {
                        const axiosError = err as AxiosError<ApiError>;

                        if (axiosError.response?.status === 401) {
                            router.push('/');
                            return;
                        }

                        if (axiosError.code === 'ERR_CANCELED') {
                            console.log('Запрос отменен');
                            return;
                        }

                        const errorMessage = axiosError.response?.data?.error
                            || axiosError.response?.data?.message
                            || axiosError.message
                            || 'Ошибка при загрузке данных';

                        setError(errorMessage);
                    } else if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('Неизвестная ошибка');
                    }

                    setLoading(false);
                }
            }
        };

        if (id) fetchData();

        return () => {
            isMounted.current = false;
            controller.abort();
        };
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!data) return;

        setIsSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error("Токен не найден");
            }

            const formData = new FormData();

            if (imageFile) {
                formData.append('image', imageFile);
            }

            const response = await axios.put<ApiResponse>(
                `${process.env.NEXT_PUBLIC_API_URL}/api/about-gallery/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.status === 200) {
                router.push('/admin/about-sliders/');
            }
        } catch (err: unknown) {
            console.error('Ошибка при сохранении:', err);

            if (axios.isAxiosError(err)) {
                const axiosError = err as AxiosError<ApiError>;
                const errorMessage = axiosError.response?.data?.error
                    || axiosError.response?.data?.message
                    || axiosError.message
                    || 'Ошибка при сохранении данных';

                setError(errorMessage);
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Неизвестная ошибка при сохранении');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (file.size > 5 * 1024 * 1024) {
                setError('Размер файла не должен превышать 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                setError('Пожалуйста, выберите изображение');
                return;
            }

            setImageFile(file);
            setPreviewURL(URL.createObjectURL(file));
            setError('');
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

    if (error && !data) {
        return (
            <div className="flex bg-gray-100 min-h-screen">
                <Sidebar />
                <div className="flex-1 p-6 ml-64 flex items-center justify-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => router.push('/admin/about-sliders/')}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Back
                        </button>
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

                <div className=" mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Edit image #{data?.id}
                        </h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
                        {data?.image && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Current image:
                                </label>
                                <div className="relative w-48 h-48 border border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace(/\\/g, '/')}`}
                                        alt="Current gallery image"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <p className="mt-2 text-sm text-gray-500 truncate max-w-xs">
                                    {data.image.split('\\').pop() || data.image.split('/').pop()}
                                </p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-3">
                                New image:
                            </label>
                            <div className="flex items-center space-x-4">
                                <label className="flex-1 cursor-pointer">
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                        <div className="text-gray-400 mb-2">
                                            <DocumentIcon className="size-12 mx-auto" />
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            {imageFile ? imageFile.name : 'Select image'}
                                        </p>
                                        <span className="text-blue-600 text-sm font-medium">
                                            Click to select a file
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                        disabled={isSubmitting}
                                    />
                                </label>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Supported formats: JPG, PNG, GIF, WebP. Maximum size: 5MB
                            </p>
                        </div>

                        {previewURL && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Preview new image:
                                </label>
                                <div className="relative w-48 h-48 border border-gray-200 rounded-lg overflow-hidden">
                                    <img
                                        src={previewURL}
                                        alt="Preview"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.push('/admin/about-sliders/')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || (!imageFile && !data?.image)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <DocumentIcon className="size-5 mr-2"/>
                                       Save
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditGallery;