"use client"

import { motion } from "framer-motion"
import { Check, Lock, Play, Circle } from "lucide-react"

export type LessonStatus = "locked" | "active" | "completed"

interface LessonNodeProps {
    id: string
    title: string
    status: LessonStatus
    onClick: () => void
    index: number
}

export function LessonNode({ id, title, status, onClick, index }: LessonNodeProps) {
    const isLocked = status === "locked"
    const isActive = status === "active"
    const isCompleted = status === "completed"

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-center gap-6 group"
        >
            {/* Connector Line */}
            {index > 0 && (
                <div className="absolute left-6 -top-8 w-0.5 h-8 bg-gradient-to-b from-blue-500/50 to-transparent" />
            )}

            {/* Node Circle */}
            <motion.button
                onClick={onClick}
                disabled={isLocked}
                whileHover={!isLocked ? { scale: 1.05 } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                className={`
                    relative flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    transition-all duration-300 border-2
                    ${isLocked ? 'bg-gray-800 border-gray-700 cursor-not-allowed' : ''}
                    ${isActive ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/50' : ''}
                    ${isCompleted ? 'bg-emerald-600 border-emerald-400' : ''}
                `}
            >
                {isLocked && <Lock className="w-5 h-5 text-gray-500" />}
                {isActive && <Play className="w-5 h-5 text-white fill-current" />}
                {isCompleted && <Check className="w-6 h-6 text-white stroke-[3]" />}

                {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-blue-400"
                        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.button>

            {/* Content Card */}
            <div className={`
                flex-1 p-4 rounded-xl border transition-all duration-300
                ${isLocked ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-900/80 border-gray-700 hover:border-gray-600'}
                ${isActive ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : ''}
                ${isCompleted ? 'border-emerald-500/50' : ''}
            `}>
                <h3 className={`font-semibold ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                    {title}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                    {isCompleted && '✓ Completed'}
                    {isActive && 'Ready to watch'}
                    {isLocked && 'Locked'}
                </p>
            </div>
        </motion.div>
    )
}
