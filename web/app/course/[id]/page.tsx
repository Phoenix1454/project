"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { PathMap } from "@/components/PathMap"
import { ArrowLeft } from "lucide-react"

export default function CoursePage() {
    const { user, isLoading, logout } = useAuth()
    const router = useRouter()
    const params = useParams()
    const courseId = params.id as string

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    if (isLoading || !user) {
        return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>
    }

    return (
        <main className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
            {/* Navigation */}
            <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/courses")}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm border border-gray-700 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    All Courses
                </button>

                {/* User Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/profile")}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform shadow-lg"
                        title="View Profile"
                    >
                        {user.email.charAt(0).toUpperCase()}
                    </button>

                    <button
                        onClick={logout}
                        className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm border border-gray-700 transition"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Course Content */}
            <PathMap courseId={parseInt(courseId)} />
        </main>
    )
}
