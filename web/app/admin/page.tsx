"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
    const { user, isLoading, logout } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<any>(null)
    const [users, setUsers] = useState<any[]>([])

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login")
            } else if (!user.is_admin) {
                router.push("/")
            } else {
                fetchAdminData()
            }
        }
    }, [user, isLoading, router])

    const fetchAdminData = async () => {
        const token = localStorage.getItem("token")
        try {
            const res = await fetch("http://localhost:8000/admin/dashboard", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setStats(data.stats)
                setUsers(data.users)
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error)
        }
    }

    if (isLoading || !user || !user.is_admin) {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                        Admin Dashboard
                    </h1>
                    <button
                        onClick={logout}
                        className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Users</h3>
                        <p className="text-4xl font-bold text-blue-400">{stats?.total_users || 0}</p>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700">
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Total Videos</h3>
                        <p className="text-4xl font-bold text-green-400">{stats?.total_videos || 0}</p>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-700">
                    <div className="p-6 border-b border-gray-700">
                        <h2 className="text-xl font-semibold">User Management</h2>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-700/50 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-700/30 transition">
                                    <td className="px-6 py-4">{u.id}</td>
                                    <td className="px-6 py-4">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs ${u.is_admin ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                            {u.is_admin ? 'ADMIN' : 'USER'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        Edit
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
