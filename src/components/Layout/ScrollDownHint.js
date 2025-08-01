import React, { useEffect, useState, useRef } from 'react'
import { Mouse, ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ScrollDownHint() {
    const [visible, setVisible] = useState(true)
    const timeoutRef = useRef(null)

    useEffect(() => {
        // Hide when user scrolls past 40px from top
        const onScroll = () => {
            if (window.scrollY > 40) setVisible(false)
        }
        window.addEventListener('scroll', onScroll, { passive: true })

        // Hide after 10 seconds
        timeoutRef.current = setTimeout(() => setVisible(false), 10000)

        // Cleanup
        return () => {
            window.removeEventListener('scroll', onScroll)
            clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="scrolldown"
                    className="w-full flex flex-col items-center mt-2 mb-6"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.65 }}
                >
                    <div className="flex flex-col items-center">
                        <Mouse className="text-amber-700" size={32} />
                        <ArrowDown className="animate-bounce text-amber-800" size={30} style={{ marginTop: "-6px" }} />
                        <span className="mt-2 text-amber-900 text-sm font-medium block">
                            Scroll for more ↓
                        </span>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
