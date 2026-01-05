'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";

interface Project {
    id: number;
    title: string;
    image: string;
    category: string;
}

const EditSlider = () => {
    const { id } = useParams();
    const router = useRouter();

    const [slider, setSlider] = useState<{ project_id: string }>({ project_id: '' });
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`);
                setProjects(res.data);
            } catch (err) {
                console.error(err);
                setError('Error loading projects');
            }
        };

        const fetchSlider = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSlider({ project_id: res.data.project_id.toString() });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Error loading slider');
                setLoading(false);
            }
        };

        fetchProjects();
        fetchSlider();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('auth_token');
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/sliders/${id}`,
                { project_id: slider.project_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            router.push(`/admin/sliders/view-slider/${id}`);
        } catch (err) {
            console.error(err);
            setError('Error updating slider');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />
                <h1 className="text-2xl font-bold mb-4">Edit Slider</h1>
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
                    <label className="block font-semibold mb-2">Select Project:</label>
                    <select
                        value={slider.project_id}
                        onChange={(e) => setSlider({ project_id: e.target.value })}
                        className="border border-gray-300 rounded p-2 w-full"
                        required
                    >
                        <option value="">-- Select project --</option>
                        {projects.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.title} ({p.category})
                            </option>
                        ))}
                    </select>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Save
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditSlider;
