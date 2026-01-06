'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import Sidebar from "@/Components/Sidebar";
import TokenTimer from "@/Components/TokenTimer";
import Link from "next/link";
import {EyeIcon, PlusCircleIcon} from "@heroicons/react/16/solid";

interface ProjectsItem {
    id: number;
    image: string;
    title: string;
    text: string;
    category: string;
}

const Projects = () => {
    const [projects, setProjects] = useState<ProjectsItem[]>([]);
    const [error, setError] = useState<string | null>(null);
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

                const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setProjects(response.data);
            } catch (err) {
                const axiosError = err as AxiosError;
                console.error(axiosError);
                setError("Ошибка при получении данных");

                if (axios.isAxiosError(axiosError) && axiosError.response?.status === 401) {
                    router.push("/");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [router]);

    const fixImageUrl = (imagePath: string) => {
        return `${process.env.NEXT_PUBLIC_API_URL}/${imagePath.replace(/\\/g, '/')}`;
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

    if (error) {
        return (
            <div className="flex bg-gray-100 min-h-screen">
                <Sidebar />
                <div className="flex-1 p-6 ml-64 flex items-center justify-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex bg-gray-100 min-h-screen">
            <Sidebar/>
            <div className="flex-1 p-6 ml-64">
                <TokenTimer/>

                <div className=" mx-auto">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                        </div>
                        <Link href="/admin/projects/add-project"
                              className="bg text-white py-2 px-6 rounded-lg flex items-center">
                            <PlusCircleIcon className="w-5 h-5 mr-2"/>
                            Add
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {projects.length === 0 ? (
                            <div className="p-12 text-center">
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">No data</h3>
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
                                            Image
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            View
                                        </th>
                                    </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                    {projects.map(project => (
                                        <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{project.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                                                    <img
                                                        src={fixImageUrl(project.image)}
                                                        alt={`Project ${project.id}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="max-w-xs truncate">
                                                    <div className="font-medium text-gray-900">
                                                        {project.title.replace(/<[^>]*>/g, '').substring(0, 50)}
                                                        {project.title.length > 50 ? '...' : ''}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {project.category}
                                                    </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/admin/projects/view-project/${project.id}`}
                                                        className="bg p-2 rounded-lg transition-colors flex items-center text-white"
                                                        title="View"
                                                    >
                                                        <EyeIcon className="w-4 h-4 mr-2"/>
                                                        View
                                                    </Link>
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
        </div>
    )
}

export default Projects;