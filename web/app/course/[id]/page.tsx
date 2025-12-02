"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { PathMap } from "@/components/PathMap"
import { API_URL } from "@/lib/config"
import { ArrowLeft, ShoppingCart } from "lucide-react"

export default function CoursePage() {
    const { user, isLoading, logout } = useAuth()
    const router = useRouter()
    const params = useParams()
    const courseId = params.id as string
    const [isPurchased, setIsPurchased] = useState(true) // Default to true for now
    const [purchasing, setPurchasing] = useState(false)

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login")
        }
    }, [user, isLoading, router])

    const handlePurchase = async () => {
        setPurchasing(true)
        try {
            const token = localStorage.getItem("token")
            const res = await fetch(`${API_URL}/payment/purchase-course/${courseId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            if (res.ok) {
                const data = await res.json()
                window.location.href = data.checkout_url
            } else {
                alert("Failed to create checkout session")
            }
        } catch (error) {
            console.error("Purchase error:", error)
            alert("Failed to purchase course")
        } finally {
            setPurchasing(false)
        }
    }

    if (isLoading || !user) {
        return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>
    }

    return (
        <main className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
            {/* Navigation */}
            <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
                <button
                    onClick={() => router.push("/courses")}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded text-sm border border-gray-700 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    All Courses
                </button>

                <div className="flex items-center gap-3">
                    {!isPurchased && (
                        <button
                            onClick={handlePurchase}
                            disabled={purchasing}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-2 rounded font-semibold transition disabled:opacity-50"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            {purchasing ? "Processing..." : "Buy for £2"}
                        </button>
                    )}

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
