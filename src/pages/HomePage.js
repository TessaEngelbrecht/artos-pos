import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/Products/ProductCard'
import Header from '../components/Layout/Header'
import { Enhanced3DBread } from '../components/3D/Enhanced3DBread'

const HomePage = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name')

            if (error) throw error
            setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <motion.div
                        className="w-16 h-16 bg-primary rounded-lg shadow-lg"
                        animate={{
                            rotate: 360,
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1.5, repeat: Infinity }
                        }}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h1
                        className="text-5xl md:text-6xl font-display font-bold text-primary mb-4"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        Artos Sourdough
                    </motion.h1>

                    <motion.p
                        className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        by Lara
                    </motion.p>

                    {/* 3D Bread Showcase */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="mb-12"
                    >
                        <Enhanced3DBread />
                    </motion.div>

                    {/* <motion.p
                        className="text-lg text-gray-600 max-w-2xl mx-auto mb-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    >
                        Handcrafted with love, baked to perfection. Order your fresh sourdough bread for Friday pickup.
                    </motion.p> */}

                    {/* Order Deadline Notice - Clean Design */}
                    <motion.div
                        className="inline-flex items-center bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-amber-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        whileHover={{ scale: 1.02, boxShadow: "0 8px 25px rgba(139, 69, 19, 0.15)" }}
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
                            <div>
                                <p className="text-amber-800 font-semibold">
                                    Order Deadline: Wednesday 15:00
                                </p>
                                <p className="text-amber-600 text-sm">
                                    for Friday pickup
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Products Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.8 }}
                >
                    <h2 className="text-3xl font-display font-bold text-primary text-center mb-12">
                        Our Fresh Bakes
                    </h2>

                    <AnimatePresence>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -30 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                >
                                    <ProductCard product={product} index={index} />
                                </motion.div>
                            ))}
                        </div>
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    )
}

export default HomePage
