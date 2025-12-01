"use client"

import { useState, useRef, useEffect } from "react"
import YouTube, { YouTubeEvent, YouTubePlayer } from "react-youtube"
import { X, Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface VideoModalProps {
    isOpen: boolean
    videoUrl: string
    title: string
    onClose: () => void
    onComplete: () => void
}

const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function VideoModal({ isOpen, videoUrl, title, onClose, onComplete }: VideoModalProps) {
    const [player, setPlayer] = useState<YouTubePlayer | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(100)
    const [isMuted, setIsMuted] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const videoId = getYouTubeID(videoUrl)

    // Poll for progress
    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isPlaying && player) {
            interval = setInterval(() => {
                setCurrentTime(player.getCurrentTime())
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [isPlaying, player])

    const handleReady = (event: YouTubeEvent) => {
        const p = event.target
        setPlayer(p)
        setDuration(p.getDuration())
        p.playVideo() // Auto-play
    }

    const handleStateChange = (event: YouTubeEvent) => {
        setIsPlaying(event.data === 1) // 1 is playing
        if (event.data === 0) { // 0 is ended
            onComplete()
        }
    }

    const togglePlay = () => {
        if (!player) return
        if (isPlaying) {
            player.pauseVideo()
        } else {
            player.playVideo()
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!player) return
        const time = parseFloat(e.target.value)
        player.seekTo(time, true)
        setCurrentTime(time)
    }

    const toggleMute = () => {
        if (!player) return
        if (isMuted) {
            player.unMute()
            player.setVolume(volume)
            setIsMuted(false)
        } else {
            player.mute()
            setIsMuted(true)
        }
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!player) return
        const newVolume = parseInt(e.target.value)
        setVolume(newVolume)
        player.setVolume(newVolume)
        if (newVolume === 0) {
            setIsMuted(true)
        } else if (isMuted) {
            setIsMuted(false)
            player.unMute()
        }
    }

    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false)
        }, 3000)
    }

    if (!isOpen) return null

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0, // Hide default controls
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            disablekb: 1,
            fs: 0,
            playsinline: 1
        },
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group"
                    onClick={(e) => e.stopPropagation()}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => isPlaying && setShowControls(false)}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={cn(
                            "absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 text-white hover:bg-white/20 transition-all duration-300",
                            showControls ? "opacity-100" : "opacity-0"
                        )}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* YouTube Player */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                        {videoId ? (
                            <div className="w-full h-full scale-[1.35]">
                                <YouTube
                                    videoId={videoId}
                                    opts={opts}
                                    onReady={handleReady}
                                    onStateChange={handleStateChange}
                                    className="w-full h-full"
                                    iframeClassName="w-full h-full pointer-events-none"
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-white">
                                Invalid Video URL
                            </div>
                        )}
                    </div>

                    {/* Click Overlay for Play/Pause */}
                    <div
                        className="absolute inset-0 z-10"
                        onClick={togglePlay}
                    />

                    {/* Custom Controls */}
                    <div
                        className={cn(
                            "absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-6 pt-12 transition-opacity duration-300",
                            showControls ? "opacity-100" : "opacity-0"
                        )}
                    >
                        {/* Progress Bar */}
                        <div className="relative group/progress mb-4 cursor-pointer">
                            <input
                                type="range"
                                min={0}
                                max={duration}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                            />
                            <div
                                className="absolute top-0 left-0 h-1 bg-blue-500 rounded-full pointer-events-none"
                                style={{ width: `${(currentTime / duration) * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Play/Pause */}
                                <button onClick={togglePlay} className="text-white hover:text-blue-400 transition-colors">
                                    {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                                </button>

                                {/* Volume */}
                                <div className="flex items-center gap-2 group/volume">
                                    <button onClick={toggleMute} className="text-white hover:text-blue-400 transition-colors">
                                        {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                                    </button>
                                    <input
                                        type="range"
                                        min={0}
                                        max={100}
                                        value={isMuted ? 0 : volume}
                                        onChange={handleVolumeChange}
                                        className="w-24 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                                    />
                                </div>

                                {/* Time */}
                                <div className="text-sm font-medium text-white/90">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <h3 className="text-white/90 font-medium hidden sm:block">{title}</h3>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
