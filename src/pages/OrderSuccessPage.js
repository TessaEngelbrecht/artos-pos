import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Mail, MapPin, Calendar } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'

const OrderSuccessPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { orderId, orderData } = location.state || {}

    if (!orderId || !orderData) {
        navigate('/')
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            <Header />

            <main className="container mx-auto px-4 py-16">
                <motion.div
                    className="max-w-2xl mx-auto text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="mb-8"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <CheckCircle size={80} className="text-green-500 mx-auto mb-4" />
                        <h1 className="text-4xl font-display font-bold text-primary mb-2">
                            Order Confirmed!
                        </h1>
                        <p className="text-xl text-gray-600">
                            Thank you for your order. We've received your payment and will prepare your fresh sourdough.
                        </p>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-lg p-8 shadow-lg mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-2xl font-semibold mb-6">Order Details</h2>

                        <div className="space-y-4 text-left">
                            <div className="flex items-start space-x-3">
                                <Mail className="text-primary mt-1" size={20} />
                                <div>
                                    <p className="font-semibold">Order ID</p>
                                    <p className="text-gray-600 text-sm">{orderId}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <MapPin className="text-primary mt-1" size={20} />
                                <div>
                                    <p className="font-semibold">Pickup Location</p>
                                    <p className="text-gray-600 text-sm">{orderData.pickup_location}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Calendar className="text-primary mt-1" size={20} />
                                <div>
                                    <p className="font-semibold">Pickup Time</p>
                                    <p className="text-gray-600 text-sm">
                                        {orderData.pickup_location.includes('Centurion') ? 'Fridays 14:00-15:00' : 'Fridays 15:30-16:30'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t mt-6 pt-6">
                            <h3 className="font-semibold mb-4">Items Ordered</h3>
                            <div className="space-y-2">
                                {orderData.items.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>R{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between text-xl font-bold text-primary">
                                    <span>Total Paid</span>
                                    <span>R{orderData.total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-amber-100 rounded-lg p-6 mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h3 className="font-semibold text-amber-800 mb-2">What's Next?</h3>
                        <ul className="text-left text-amber-700 space-y-1 text-sm">
                            <li>• We've sent a confirmation email to tessa.engelbrecht@gmail.com</li>
                            <li>• Your fresh sourdough will be prepared for Friday pickup</li>
                            <li>• Please arrive during your selected pickup time window</li>
                            <li>• Bring this confirmation or your order ID for reference</li>
                        </ul>
                    </motion.div>

                    <motion.button
                        onClick={() => navigate('/')}
                        className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Continue Shopping
                    </motion.button>
                </motion.div>
            </main>
        </div>
    )
}

export default OrderSuccessPage
