import { API_URL } from "@/lib/config"
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { BookOpen, GraduationCap, Sparkles, TrendingUp } from "lucide-react"

interface Course {
    id: number
    title: string
    description: string
    difficulty: string
    video_count: number
}

export default function CoursesPage() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        } else if (user) {
            fetchCourses()
        }
    }, [user, isLoading, router])

    const fetchCourses = async () => {
        try {
            const res = await fetch("${API_URL}/courses")
            if (res.ok) {
                const data = await res.json()
                setCourses(data)
            }
        } catch (error) {
            console.error("Failed to fetch courses:", error)
        } finally {
            setLoading(false)
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "beginner": return "text-emerald-400 bg-emerald-500/20"
            case "intermediate": return "text-blue-400 bg-blue-500/20"
            case "advanced": return "text-orange-400 bg-orange-500/20"
            default: return "text-gray-400 bg-gray-500/20"
        }
    }

    const getDifficultyIcon = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case "beginner": return <Sparkles className="w-4 h-4" />
            case "intermediate": return <TrendingUp className="w-4 h-4" />
            case "advanced": return <GraduationCap className="w-4 h-4" />
            default: return <BookOpen className="w-4 h-4" />
        }
    }

    if (isLoading || loading) {
        return <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center text-white">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-6">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4">Choose Your Path</h1>
                    <p className="text-xl text-gray-400">Select a course to begin your learning journey</p>
                </div>

                {/* Courses Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <button
                            key={course.id}
                            onClick={() => router.push(`/course/${course.id}`)}
                            className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 text-left group"
                        >
                            {/* Course Icon */}
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>

                            {/* Course Title */}
                            <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>

                            {/* Course Description */}
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{course.description}</p>

                            {/* Course Meta */}
                            <div className="flex items-center justify-between">
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(course.difficulty)}`}>
                                    {getDifficultyIcon(course.difficulty)}
                                    {course.difficulty}
                                </div>
                                <span className="text-sm text-gray-500">{course.video_count} lessons</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Profile Link */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => router.push("/profile")}
                        className="text-gray-400 hover:text-white transition"
                    >
                        View Profile →
                    </button>
                </div>
            </div>
        </div>
    )
}
