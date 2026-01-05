'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/Components/Sidebar';
import TokenTimer from '@/Components/TokenTimer';

interface Project {
    id: number;
    title: string;
}

const AddSlider = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectId, setProjectId] = useState('');
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    router.push('/');
                    return;
                }

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await res.json();
                setProjects(data);
                setLoading(false);
            } catch (err) {
                console.error('Error loading projects', err);
            }
        };

        fetchProjects();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!projectId) return;

        const token = localStorage.getItem('auth_token');
        if (!token) return;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/sliders`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        project_id: Number(projectId),
                    }),
                }
            );

            if (res.ok) {
                router.push('/admin/sliders');
            } else {
                const text = await res.text();
                console.error('Error:', text);
            }
        } catch (err) {
            console.error('Request error', err);
        }
    };

    return (
        <div className="flex bg-gray-200 min-h-screen">
            <Sidebar />
            <div className="flex-1 p-10 ml-62">
                <TokenTimer />

                <div className="mt-8 max-w-xl">
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 bg-white rounded-lg shadow border"
                    >
                        <h2 className="text-2xl font-bold mb-6">
                            Add project to slider
                        </h2>

                        {loading ? (
                            <div>Loading projects...</div>
                        ) : (
                            <div className="mb-6">
                                <label className="block font-semibold mb-2">
                                    Select project
                                </label>

                                <select
                                    value={projectId}
                                    onChange={(e) => setProjectId(e.target.value)}
                                    required
                                    className="w-full border rounded p-2"
                                >
                                    <option value="">Select project</option>
                                    {projects.map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg text-white py-2 rounded font-semibold"
                        >
                            Add to slider
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddSlider;
