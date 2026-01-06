'use client';
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import axios from 'axios';
import TipTapEditor from '@/Components/TipTapEditor';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import {DocumentIcon} from "@heroicons/react/16/solid";

const EditProject = () => {
    const {id} = useParams();
    const router = useRouter();

    type ProjectData = {
        title: string;
        text: string;
        image: string;
        category_id: number;
        director: string;
        designer: string;
        date: string;
    };

    const [data, setData] = useState<ProjectData>({
        title: '',
        text: '',
        image: '',
        category_id: 0,
        director: '',
        designer: '',
        date: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cat, setCat] = useState<{ id: number, category: string }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`)
                ]);
                const [catData] = await Promise.all([
                    catRes.json(),
                ]);
                setCat(catData);
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data && response.data.id) {
                    const rawData = response.data;
                    setData({
                        ...rawData,
                    });

                    setLoading(false);
                } else {
                    throw new Error("Данные не найдены для этой новости");
                }
            } catch (err) {
                console.error('Ошибка при загрузке данных:', err);
                setError('Ошибка при загрузке');
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleEditorChange = (name: keyof typeof data, content: string) => {
        setData((prev) => ({...prev, [name]: content}));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');

            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('text', data.text);
            formData.append('category_id', String(data.category_id));
            formData.append('director', data.director);
            formData.append('designer', data.designer);
            formData.append('date', data.date);

            if (imageFile) {
                formData.append('image', imageFile);
            } else {
                formData.append('image', data.image);
            }

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            router.push(`/admin/projects/view-project/${id}`);
        } catch (err) {
            console.error(err);
            setError('Ошибка при сохранении');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <h1 className="text-2xl font-bold mb-4">Edit Project</h1>
                    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
                        {data.image && (
                            <div className="mb-4">
                                <label className="block font-semibold mb-2">Current image:</label>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API_URL}/${data.image.replace('\\', '/')}`}
                                    alt="News"
                                    width={200}
                                    height={200}
                                    className="w-64 rounded"
                                />
                            </div>
                        )}
                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <div className="mb-4">
                                    <label htmlFor="image" className="block font-semibold mb-2">New image:</label>
                                    <input
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                setImageFile(e.target.files[0]);
                                            }
                                        }}
                                        className="border border-gray-300 rounded p-2 w-full"
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Category:
                                </label>
                                <select
                                    id="category"
                                    name="category_id"
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData((prev) => ({
                                            ...prev,
                                            category_id: Number(e.target.value),
                                        }))
                                    }
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select category</option>
                                    {cat.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex w-full space-x-4">
                            <div className="mb-4 w-full">
                                <label className="block text-gray-700 font-semibold mb-2">Director:</label>
                                <input
                                    name="director"
                                    value={data.director}
                                    onChange={(e) => handleEditorChange('director', e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                            <div className="mb-4 w-full">
                                <label className="block text-gray-700 font-semibold mb-2">Designer:</label>
                                <input
                                    value={data.designer}
                                    onChange={(e) => handleEditorChange('designer', e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Date:</label>
                                <input
                                    value={data.date}
                                    onChange={(e) => handleEditorChange('date', e.target.value)}
                                    type="date"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                        </div>
                        <div className="tabs tabs-lift">
                            <input type="radio" name="my_tabs_3" className="tab" aria-label="Project" defaultChecked/>
                            <div className="tab-content bg-base-100 border-base-300 p-6">
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Title</label>
                                    <TipTapEditor
                                        content={data.title}
                                        onChange={(content) => handleEditorChange('title', content)}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block font-semibold mb-2">Text:</label>
                                    <TipTapEditor
                                        content={data.text}
                                        onChange={(content) => handleEditorChange('text', content)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                        >
                            <DocumentIcon className="size-5 mr-2"/>
                            Save
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProject;
