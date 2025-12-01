"use client"

import { useState, useEffect } from "react"
import { LessonNode, LessonStatus } from "./LessonNode"
import { VideoModal } from "./VideoModal"
import confetti from "canvas-confetti"
import { useAuth } from "@/context/AuthContext"
import { GraduationCap } from "lucide-react"

export interface Lesson {
    id: string
    title: string
    status: LessonStatus
    x: number
    y: number
    video_url: string
}

interface PathMapProps {
    courseId?: number
}

export function PathMap({ courseId = 1 }: PathMapProps) {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [courseTitle, setCourseTitle] = useState("Loading...")
    const { user } = useAuth()

    const fetchCourseTitle = async () => {
        try {
            const res = await fetch(`http://localhost:8000/courses`)
            if (res.ok) {
                const courses = await res.json()
                const course = courses.find((c: any) => c.id === courseId)
                if (course) {
                    setCourseTitle(course.title)
                }
            }
        } catch (error) {
            console.error("Failed to fetch course title:", error)
        }
    }

    const fetchPath = async () => {
        const token = localStorage.getItem("token")
        if (!token) return

        try {
            const endpoint = courseId ? `/courses/${courseId}/path` : `/path`
            const res = await fetch(`http://localhost:8000${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (res.ok) {
                const data = await res.json()
                const mappedLessons = data.map((item: any) => ({
                    id: item.id.toString(),
                    title: item.title,
                    status: item.status,
                    x: item.x,
                    y: item.y,
                    video_url: item.video_url
                }))
                setLessons(mappedLessons)
            }
        } catch (error) {
            console.error("Failed to fetch path:", error)
        }
    }

    useEffect(() => {
        if (user) {
            fetchCourseTitle()
            fetchPath()
        }
    }, [user, courseId])

    const handleNodeClick = (lesson: Lesson) => {
        if (lesson.status === "locked") return
        setSelectedLesson(lesson)
        setIsModalOpen(true)
    }

    const handleVideoComplete = async () => {
        if (!selectedLesson) return

        try {
            const token = localStorage.getItem("token")
            await fetch("http://localhost:8000/progress/complete", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    video_id: parseInt(selectedLesson.id)
                })
            })

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })

            setIsModalOpen(false)
            await fetchPath()
        } catch (error) {
            console.error("Failed to save progress:", error)
        }
    }

    const completedCount = lessons.filter(l => l.status === "completed").length
    const progress = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold text-white">{courseTitle}</h1>
                                {user?.is_premium && (
                                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                                        PREMIUM
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400">Your learning journey</p>
                        </div>
                    </div>

                    {/* Upgrade Banner for Free Users */}
                    {!user?.is_premium && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/50 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-semibold mb-1">Unlock All Content</h3>
                                    <p className="text-sm text-gray-400">Get instant access to all videos with Premium</p>
                                </div>
                                <button
                                    onClick={() => window.location.href = '/pricing'}
                                    className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold rounded-lg transition-all duration-200"
                                >
                                    Upgrade
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        {completedCount} of {lessons.length} lessons completed
                    </p>
                </div>

                {/* Lessons Timeline */}
                <div className="space-y-6">
                    {lessons.map((lesson, index) => (
                        <LessonNode
                            key={lesson.id}
                            id={lesson.id}
                            title={lesson.title}
                            status={lesson.status}
                            onClick={() => handleNodeClick(lesson)}
                            index={index}
                        />
                    ))}
                </div>

                {/* Video Modal */}
                {selectedLesson && (
                    <VideoModal
                        isOpen={isModalOpen}
                        videoUrl={selectedLesson.video_url}
                        title={selectedLesson.title}
                        onClose={() => setIsModalOpen(false)}
                        onComplete={handleVideoComplete}
                    />
                )}
            </div>
        </div>
    )
}
