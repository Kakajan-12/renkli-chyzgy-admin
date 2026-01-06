'use client';

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';
import TipTapEditor from '@/Components/TipTapEditor';

const AddProject = () => {
    const [isClient, setIsClient] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [category_id, setCategory] = useState('');
    const [director, setDirector] = useState('');
    const [designer, setDesigner] = useState('');
    const [date, setDate] = useState('');
    const [cat, setCat] = useState<
        { id: number; category: string;}[]
    >([]);

    const router = useRouter();

    useEffect(() => {
        setIsClient(true)
        const fetchData = async () => {
            try {
                const [catRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/category`),
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const token = localStorage.getItem('auth_token');
        if (!token) {
            console.error('Нет токена. Пользователь не авторизован.');
            return;
        }

        const formData = new FormData();
        if (image) formData.append('image', image);
        formData.append('title', title ?? '');
        formData.append('text', text ?? '');
        formData.append('category_id', category_id ?? '');
        formData.append('director', director ?? '');
        formData.append('designer', designer ?? '');
        formData.append('date', date ?? '');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                console.log('добавлен!', data);
                setImage(null);
                setTitle('');
                setText('');
                setCategory('');
                setDirector('');
                setDesigner('');
                setDate('');
                router.push('/admin/projects');
            } else {
                const errorText = await response.text();
                console.error('Ошибка при добавлении:', errorText);
            }
        } catch (error) {
            console.error('Ошибка запроса', error);
        }
    };

    return (
        <div className="flex bg-gray-200">
            <Sidebar/>
            <div className="flex-1 p-10 ml-62">
                <TokenTimer/>
                <div className="mt-8">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full mx-auto p-6 border border-gray-300 rounded-lg shadow-lg bg-white"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-left">Add new project</h2>

                        <div className="mb-4 flex space-x-4">
                            <div className="w-full">
                                <label htmlFor="image" className="block text-gray-700 font-semibold mb-2">
                                    Image:
                                </label>
                                <input
                                    type="file"
                                    id="image"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImage(e.target.files[0]);
                                        }
                                    }}
                                    required
                                    className="border border-gray-300 rounded p-2 w-full focus:border-blue-500 focus:ring focus:ring-blue-200 transition duration-150"
                                />
                            </div>

                            <div className="w-full">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Select Category:
                                </label>
                                <select
                                    id="category"
                                    name="category_id"
                                    value={category_id}
                                    onChange={(e) => setCategory(e.target.value)}
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
                                    value={director}
                                    onChange={(e) => setDirector(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                            <div className="mb-4 w-full">
                                <label className="block text-gray-700 font-semibold mb-2">Designer:</label>
                                <input
                                    value={designer}
                                    onChange={(e) => setDesigner(e.target.value)}
                                    type="text"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">Date:</label>
                                <input
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    type="date"
                                    required
                                    className="border border-gray-300 rounded p-2 w-full"
                                />
                            </div>
                        </div>
                        {isClient && (
                            <>
                                <div className="tabs tabs-lift">
                                    <input type="radio" name="my_tabs_3" className="tab" aria-label="Project"
                                           defaultChecked/>
                                    <div className="tab-content bg-base-100 border-base-300 p-6">
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Title:</label>
                                            <TipTapEditor
                                                content={title}
                                                onChange={(content) => setTitle(content)}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 font-semibold mb-2">Text:</label>
                                            <TipTapEditor
                                                content={text}
                                                onChange={(content) => setText(content)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full bg hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150"
                        >
                            Add tour
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProject;
