import React from 'react'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'

const CartPage = () => {
    const { items, updateQuantity, removeItem, getTotal } = useCart()
    const navigate = useNavigate()

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
                <Header />
                <div className="container mx-auto px-4 py-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
                        <h2 className="text-2xl font-display font-bold text-gray-600 mb-4">
                            Your cart is empty
                        </h2>
                        <p className="text-gray-500 mb-8">
                            Add some delicious sourdough to get started!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Start Shopping
                        </button>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            <Header />

            <main className="container mx-auto px-4 py-8">
                <motion.h1
                    className="text-3xl font-display font-bold text-primary mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Your Cart
                </motion.h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    className="bg-white rounded-lg p-6 shadow-md"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold">{item.name}</h3>
                                            <p className="text-gray-600">R{item.price.toFixed(2)} each</p>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-semibold w-8 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.min(10, item.quantity + 1))}
                                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <div className="text-lg font-bold text-primary min-w-[80px] text-right">
                                                R{(item.price * item.quantity).toFixed(2)}
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 hover:text-red-700 p-1"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <motion.div
                            className="bg-white rounded-lg p-6 shadow-md sticky top-24"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-xl font-display font-bold mb-4">Order Summary</h3>

                            <div className="space-y-2 mb-4">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>R{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-xl font-bold text-primary">
                                    <span>Total</span>
                                    <span>R{getTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            <motion.button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors mt-6"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Proceed to Checkout
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default CartPage
