"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Mock API call
        console.log("Reset password for:", email)
        setSubmitted(true)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-100">
                    Reset Password
                </h1>

                {submitted ? (
                    <div className="text-center">
                        <div className="bg-green-500/20 text-green-200 p-4 rounded mb-6">
                            If an account exists for <strong>{email}</strong>, you will receive password reset instructions.
                        </div>
                        <Link href="/login" className="text-blue-400 hover:text-blue-300">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <p className="text-gray-400 text-sm mb-4">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-400">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition duration-200"
                        >
                            Send Reset Link
                        </button>

                        <div className="mt-4 text-center">
                            <Link href="/login" className="text-gray-400 hover:text-white text-sm">
                                Cancel
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}
