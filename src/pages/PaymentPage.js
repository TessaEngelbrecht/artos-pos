import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, CreditCard, CheckCircle } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../lib/supabase'
import { sendOrderEmail } from '../lib/emailjs'
import Header from '../components/Layout/Header'

const PaymentPage = () => {
    const [paymentProof, setPaymentProof] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { clearCart } = useCart()

    const { orderData } = location.state || {}

    if (!orderData) {
        navigate('/cart')
        return null
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                alert('File size must be less than 100MB')
                return
            }
            if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
                alert('Please upload a PDF or image file')
                return
            }
            setPaymentProof(file)
        }
    }

    const uploadPaymentProof = async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}_${Date.now()}.${fileExt}`

        const { data, error } = await supabase.storage
            .from('payment-proofs')
            .upload(fileName, file)

        if (error) throw error
        return data.path
    }

    const handleFinalizeOrder = async () => {
        if (!paymentProof) {
            alert('Please upload proof of payment')
            return
        }

        setProcessing(true)

        try {
            setUploading(true)
            const proofPath = await uploadPaymentProof(paymentProof)
            setUploading(false)

            // Create order in database
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: orderData.total,
                    pickup_location: orderData.pickup_location,
                    payment_proof_url: proofPath,
                    status: 'pending'
                })
                .select()
                .single()

            if (orderError) throw orderError

            // Create order items
            const orderItems = orderData.items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }))

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)

            if (itemsError) throw itemsError

            // Get user info for email
            const { data: userInfo, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single()

            if (userError) throw userError

            // Send email notification
            await sendOrderEmail(orderData, userInfo)

            // Clear cart and navigate to success
            clearCart()
            navigate('/order-success', {
                state: {
                    orderId: order.id,
                    orderData: orderData
                }
            })

        } catch (error) {
            console.error('Error processing order:', error)
            alert('There was an error processing your order. Please try again.')
        } finally {
            setProcessing(false)
            setUploading(false)
        }
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
                    Payment Details
                </motion.h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* Payment Instructions */}
                        <motion.div
                            className="bg-white rounded-lg p-6 shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center mb-4">
                                <CreditCard className="text-primary mr-2" size={24} />
                                <h2 className="text-xl font-semibold">Payment Instructions</h2>
                            </div>

                            <div className="bg-primary/5 p-6 rounded-lg">
                                <h3 className="font-semibold text-lg mb-4 text-primary">
                                    Please transfer R{orderData.total.toFixed(2)} to:
                                </h3>

                                <div className="space-y-2 text-gray-700">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Account holder:</span>
                                        <span>Lara Engelbrecht</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Account number:</span>
                                        <span>2131999461</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Account type:</span>
                                        <span>SA</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Bank name:</span>
                                        <span>Nedbank</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Branch code:</span>
                                        <span>198765</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Reference:</span>
                                        <span>Your name and surname</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Upload Proof */}
                        <motion.div
                            className="bg-white rounded-lg p-6 shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center mb-4">
                                <Upload className="text-primary mr-2" size={24} />
                                <h2 className="text-xl font-semibold">Upload Proof of Payment</h2>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <input
                                    type="file"
                                    id="payment-proof"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <label htmlFor="payment-proof" className="cursor-pointer">
                                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600 mb-2">
                                        Click to upload proof of payment
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        PDF or image files (max 100MB)
                                    </p>
                                </label>
                            </div>

                            {paymentProof && (
                                <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center">
                                    <CheckCircle className="text-green-500 mr-2" size={20} />
                                    <span className="text-green-700">
                                        File selected: {paymentProof.name}
                                    </span>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    <div>
                        {/* Order Summary */}
                        <motion.div
                            className="bg-white rounded-lg p-6 shadow-md sticky top-24"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

                            <div className="space-y-3 mb-4">
                                {orderData.items.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span>R{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4 mb-4">
                                <div className="flex justify-between text-xl font-bold text-primary">
                                    <span>Total</span>
                                    <span>R{orderData.total.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm text-gray-600">
                                    <strong>Pickup Location:</strong><br />
                                    {orderData.pickup_location}
                                </p>
                            </div>

                            <motion.button
                                onClick={handleFinalizeOrder}
                                disabled={!paymentProof || processing || uploading}
                                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: (!paymentProof || processing || uploading) ? 1 : 1.02 }}
                                whileTap={{ scale: (!paymentProof || processing || uploading) ? 1 : 0.98 }}
                            >
                                {uploading ? 'Uploading...' : processing ? 'Processing Order...' : 'Finalize Order'}
                            </motion.button>

                            <p className="text-xs text-gray-500 mt-4 text-center">
                                By finalizing this order, you confirm that you have made the payment and uploaded valid proof of payment.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default PaymentPage
