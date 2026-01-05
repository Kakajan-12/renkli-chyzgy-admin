'use client';

import React, { useEffect, useState, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import Image from 'next/image';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import { Menu, Transition } from '@headlessui/react';
import {
    ChevronDownIcon,
    TrashIcon,
} from '@heroicons/react/16/solid';

interface Slider {
    slider_id: number;
    project_id: number;
    image: string;
    title: string;
    text: string;
    category: string;
}

const ViewSlider = () => {
    const { id } = useParams();
    const [slider, setSlider] = useState<Slider | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchSlider = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setSlider(response.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Error loading slider');
                setLoading(false);

                if (err instanceof AxiosError && err.response?.status === 401) {
                    router.push('/');
                }
            }
        };

        if (id) fetchSlider();
    }, [id, router]);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push('/admin/sliders');
        } catch (err) {
            console.error(err);
            setError('Error deleting slider');
        } finally {
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />

                <div className="mt-8">
                    <div className="w-full flex justify-between items-center">
                        <h2 className="text-2xl font-bold mb-4">
                            View Slider Project
                        </h2>

                        <Menu as="div" className="relative inline-block text-left">
                            <Menu.Button className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 text-sm font-semibold text-white">
                                Options
                                <ChevronDownIcon className="w-4 h-4"/>
                            </Menu.Button>

                            <Transition as={Fragment}>
                                <Menu.Items className="absolute right-0 mt-2 w-48 rounded bg-white shadow z-50">
                                    <div className="py-1">
                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => router.push(`/admin/sliders/edit-slider/${slider?.slider_id}`)}
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } flex w-full px-4 py-2 text-sm`}
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </Menu.Item>

                                        <div className="border-t border-gray-200 my-1" />

                                        <Menu.Item>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setShowModal(true)}
                                                    className={`${
                                                        active ? 'bg-gray-100' : ''
                                                    } flex w-full px-4 py-2 text-sm`}
                                                >
                                                    <TrashIcon className="w-4 h-4 mr-2"/>
                                                    Remove from slider
                                                </button>
                                            )}
                                        </Menu.Item>
                                    </div>
                                </Menu.Items>

                            </Transition>
                        </Menu>
                    </div>

                    {slider && (
                        <div className="bg-white p-6 rounded border flex gap-8">
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/${slider.image.replace('\\', '/')}`}
                                alt="Project"
                                width={500}
                                height={350}
                                className="rounded object-cover"
                            />

                            <div className="flex-1 space-y-6">
                                <div>
                                    <div className="text-sm text-gray-500">Category</div>
                                    <div className="font-semibold">{slider.category}</div>
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Title</div>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: slider.title }}
                                    />
                                </div>

                                <div>
                                    <div className="text-sm text-gray-500">Text</div>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: slider.text }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {showModal && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                        <div className="bg-white p-6 rounded shadow w-96">
                            <h2 className="font-bold mb-4">
                                Remove from slider
                            </h2>
                            <p className="mb-6">
                                Are you sure you want to remove this project from slider?
                            </p>
                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-2 bg-red-500 text-white rounded"
                                >
                                    {isDeleting ? 'Removing...' : 'Remove'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewSlider;
