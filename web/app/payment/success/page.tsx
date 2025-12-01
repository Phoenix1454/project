"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"

export default function PaymentSuccessPage() {
    const router = useRouter()

    useEffect(() => {
        // Redirect to home after 3 seconds
        const timer = setTimeout(() => {
            router.push("/")
        }, 3000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6">
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">Payment Successful!</h1>
                <p className="text-xl text-gray-400 mb-8">
                    🎉 You now have access to all premium content
                </p>
                <p className="text-gray-500">Redirecting you to the dashboard...</p>
            </div>
        </div>
    )
}
