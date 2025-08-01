import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/Products/ProductCard'
import Header from '../components/Layout/Header'
import BreadQuizGame from '../components/Layout/BreadQuizGame'

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
                <motion.div
                    className="text-center mb-14"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <motion.h1
                        className="text-5xl md:text-6xl font-display font-bold text-primary mb-3"
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        Artos Sourdough
                    </motion.h1>
                    <motion.p
                        className="text-xl text-gray-700 mb-2 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                    >
                        by Lara
                    </motion.p>
                </motion.div>

                {/* The quiz comes right below the hero */}
                <BreadQuizGame />

                {/* Products Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.8 }}
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
