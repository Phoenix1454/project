"use client"

import { API_URL } from "@/lib/config"
import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { User, Calendar, Award, Crown, TrendingUp, Clock } from "lucide-react"

interface ProfileData {
    user: {
        id: number
        email: string
        is_premium: boolean
        is_admin: boolean
        created_at: string
        premium_expires_at: string | null
    }
    stats: {
        total_videos: number
        completed_videos: number
        progress_percentage: number
        recent_completions: Array<{
            title: string
            completed_at: string
        }>
    }
}

export default function ProfilePage() {
    const { user, isLoading, logout } = useAuth()
    const router = useRouter()
    const [profileData, setProfileData] = useState<ProfileData | null>(null)

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        } else if (user) {
            fetchProfile()
        }
    }, [user, isLoading, router])

    const fetchProfile = async () => {
        const token = localStorage.getItem("token")
        try {
            const res = await fetch("${API_URL}/profile", {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                setProfileData(data)
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error)
        }
    }

    if (isLoading || !profileData) {
        return <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center text-white">Loading...</div>
    }

    const joinDate = new Date(profileData.user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.push("/")}
                        className="text-gray-400 hover:text-white transition"
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition"
                    >
                        Logout
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 mb-8">
                    <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <User className="w-12 h-12 text-white" />
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-white">{profileData.user.email}</h1>
                                {profileData.user.is_premium && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                        <Crown className="w-3 h-3" />
                                        PREMIUM
                                    </span>
                                )}
                                {profileData.user.is_admin && (
                                    <span className="px-3 py-1 bg-red-500/20 text-red-300 text-xs font-bold rounded-full">
                                        ADMIN
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Calendar className="w-4 h-4" />
                                Joined {joinDate}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Total Progress */}
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="text-gray-400 text-sm">Overall Progress</h3>
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{profileData.stats.progress_percentage}%</p>
                        <p className="text-sm text-gray-500">
                            {profileData.stats.completed_videos} of {profileData.stats.total_videos} lessons
                        </p>
                    </div>

                    {/* Completed */}
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Award className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="text-gray-400 text-sm">Completed</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{profileData.stats.completed_videos}</p>
                        <p className="text-sm text-gray-500">lessons finished</p>
                    </div>

                    {/* Remaining */}
                    <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-400" />
                            </div>
                            <h3 className="text-gray-400 text-sm">Remaining</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">
                            {profileData.stats.total_videos - profileData.stats.completed_videos}
                        </p>
                        <p className="text-sm text-gray-500">lessons to go</p>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Recent Completions</h2>
                    {profileData.stats.recent_completions.length > 0 ? (
                        <div className="space-y-4">
                            {profileData.stats.recent_completions.map((completion, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                            <Award className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <span className="text-white">{completion.title}</span>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(completion.completed_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No completed lessons yet. Start learning!</p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="mt-8 flex gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition"
                    >
                        Continue Learning
                    </button>
                    {!profileData.user.is_premium && (
                        <button
                            onClick={() => router.push("/pricing")}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold rounded-xl transition"
                        >
                            Upgrade to Premium
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
