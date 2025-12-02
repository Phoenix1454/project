import { API_URL } from "@/lib/config"
"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Check, Sparkles, Zap, Crown } from "lucide-react"

export default function PricingPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)

    const handleCheckout = async (plan: "one_time" | "monthly") => {
        if (!user) {
            router.push("/login")
            return
        }

        setLoading(plan)

        try {
            const token = localStorage.getItem("token")
            const res = await fetch("${API_URL}/payment/create-checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ plan })
            })

            if (res.ok) {
                const data = await res.json()
                // Redirect to Stripe Checkout
                window.location.href = data.checkout_url
            }
        } catch (error) {
            console.error("Checkout error:", error)
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-20 px-4">
            {/* Header */}
            <div className="max-w-4xl mx-auto text-center mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 mb-6">
                    <Crown className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold text-white mb-4">Unlock Your Full Potential</h1>
                <p className="text-xl text-gray-400">Get instant access to all premium content</p>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                {/* Monthly Plan */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Monthly</h3>
                    </div>
                    <div className="mb-6">
                        <span className="text-5xl font-bold text-white">$9.99</span>
                        <span className="text-gray-400">/month</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-gray-300">
                            <Check className="w-5 h-5 text-blue-400" />
                            Unlock all videos instantly
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                            <Check className="w-5 h-5 text-blue-400" />
                            New content every week
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                            <Check className="w-5 h-5 text-blue-400" />
                            Cancel anytime
                        </li>
                    </ul>
                    <button
                        onClick={() => handleCheckout("monthly")}
                        disabled={loading === "monthly"}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                    >
                        {loading === "monthly" ? "Processing..." : "Subscribe Monthly"}
                    </button>
                </div>

                {/* One-Time Plan */}
                <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl p-8 relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                        BEST VALUE
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-xl font-bold text-white">Lifetime Access</h3>
                    </div>
                    <div className="mb-6">
                        <span className="text-5xl font-bold text-white">$49.99</span>
                        <span className="text-gray-400"> one-time</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                        <li className="flex items-center gap-2 text-gray-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            Unlock all videos instantly
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            Lifetime access - pay once
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            All future content included
                        </li>
                        <li className="flex items-center gap-2 text-gray-300">
                            <Check className="w-5 h-5 text-yellow-400" />
                            Priority support
                        </li>
                    </ul>
                    <button
                        onClick={() => handleCheckout("one_time")}
                        disabled={loading === "one_time"}
                        className="w-full py-3 px-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50"
                    >
                        {loading === "one_time" ? "Processing..." : "Get Lifetime Access"}
                    </button>
                </div>
            </div>

            {/* Note */}
            <p className="text-center text-gray-500 text-sm mt-12">
                💳 Secure payment powered by Stripe • 30-day money-back guarantee
            </p>
        </div>
    )
}
