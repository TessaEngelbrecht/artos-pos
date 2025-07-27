import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CreditCard, CheckCircle, AlertTriangle, Loader, Eye, X } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { supabase } from '../lib/supabase'
import { sendOrderEmail } from '../lib/emailjs'
import { verifyPaymentProof, getVerificationSummary } from '../lib/paymentVerification'
import Header from '../components/Layout/Header'

const PaymentPage = () => {
    const [paymentProof, setPaymentProof] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [verification, setVerification] = useState(null)
    const [showVerificationDetails, setShowVerificationDetails] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useAuth()
    const { clearCart } = useCart()

    const { orderData } = location.state || {}
    // Add this at the top of your PaymentPage component (temporary)
    // console.log('Environment check:')
    // console.log('NODE_ENV:', process.env.NODE_ENV)
    // console.log('All REACT_APP vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP')))
    // console.log('Gemini key present:', !!process.env.REACT_APP_GEMINI_API_KEY)
    // console.log('Gemini key length:', process.env.REACT_APP_GEMINI_API_KEY?.length)

    if (!orderData) {
        navigate('/cart')
        return null
    }

    const handleFileChange = async (e) => {
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
            setVerification(null) // Reset previous verification

            // Auto-verify the payment proof
            await verifyPayment(file)
        }
    }

    const verifyPayment = async (file) => {
        setVerifying(true)

        try {
            // Create expected reference from user info
            const { data: userInfo } = await supabase
                .from('users')
                .select('name, surname')
                .eq('id', user.id)
                .single()

            const expectedReference = userInfo ? `${userInfo.name} ${userInfo.surname}` : 'Order Reference'

            // Verify with AI
            const result = await verifyPaymentProof(file, orderData.total, expectedReference)

            setVerification(result)

            if (result.success) {
               // console.log('Verification successful:', result.verification)
            } else {
                console.error('Verification failed:', result.error)
            }

        } catch (error) {
            console.error('Error during verification:', error)
            setVerification({
                success: false,
                error: 'Failed to verify payment proof'
            })
        } finally {
            setVerifying(false)
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

        // Check if verification passed
        if (verification?.success && verification?.verification?.confidence < 50) {
            const proceed = window.confirm(
                'AI verification shows low confidence in the payment proof. Do you want to proceed anyway? (Order will be marked for manual review)'
            )
            if (!proceed) return
        }

        setProcessing(true)

        try {
            setUploading(true)
            const proofPath = await uploadPaymentProof(paymentProof)
            setUploading(false)

            // Create order in database with verification info
            const orderStatus = verification?.success &&
                verification?.verification?.isValid &&
                verification?.verification?.amountMatches &&
                verification?.verification?.confidence >= 70
                ? 'verified' : 'pending'

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user.id,
                    total_amount: orderData.total,
                    pickup_location: orderData.pickup_location,
                    payment_proof_url: proofPath,
                    status: orderStatus,
                    verification_result: verification ? JSON.stringify(verification) : null,
                    verified_at: orderStatus === 'verified' ? new Date().toISOString() : null
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

            // Send enhanced email notification with verification data
            await sendOrderEmail(orderData, userInfo, order.id, verification)

            // Send customer confirmation
            //await sendCustomerConfirmationEmail(orderData, userInfo, order.id, orderStatus)

            // Clear cart and navigate to success
            clearCart()
            navigate('/order-success', {
                state: {
                    orderId: order.id,
                    orderData: orderData,
                    verificationStatus: orderStatus
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


    const getVerificationIcon = () => {
        if (verifying) return <Loader className="animate-spin" size={20} />
        if (!verification) return null

        if (verification.success && verification.verification?.isValid && verification.verification?.confidence >= 70) {
            return <CheckCircle className="text-green-500" size={20} />
        } else if (verification.success && verification.verification?.isPaymentProof) {
            return <AlertTriangle className="text-yellow-500" size={20} />
        } else {
            return <X className="text-red-500" size={20} />
        }
    }

    const getVerificationColor = () => {
        if (verifying) return 'blue'
        if (!verification) return 'gray'

        if (verification.success && verification.verification?.isValid && verification.verification?.confidence >= 70) {
            return 'green'
        } else if (verification.success && verification.verification?.isPaymentProof) {
            return 'yellow'
        } else {
            return 'red'
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

                        {/* Upload Proof with AI Verification */}
                        <motion.div
                            className="bg-white rounded-lg p-6 shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="flex items-center mb-4">
                                <Upload className="text-primary mr-2" size={24} />
                                <h2 className="text-xl font-semibold">Upload Proof of Payment</h2>
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    AI Verified
                                </span>
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
                                    <p className="text-xs text-blue-600 mt-2">
                                        AI will automatically verify your payment proof
                                    </p>
                                </label>
                            </div>

                            {/* File Selected & Verification Status */}
                            {paymentProof && (
                                <div className="mt-4 space-y-3">
                                    <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                                        <div className="flex items-center">
                                            <FileText className="text-gray-500 mr-2" size={20} />
                                            <span className="text-gray-700">
                                                {paymentProof.name}
                                            </span>
                                        </div>
                                        {getVerificationIcon()}
                                    </div>

                                    {/* Verification Results */}
                                    <motion.div
                                        className={`p-4 rounded-lg border-l-4 ${getVerificationColor() === 'green' ? 'bg-green-50 border-green-500' :
                                                getVerificationColor() === 'yellow' ? 'bg-yellow-50 border-yellow-500' :
                                                    getVerificationColor() === 'red' ? 'bg-red-50 border-red-500' :
                                                        'bg-blue-50 border-blue-500'
                                            }`}
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={`font-semibold ${getVerificationColor() === 'green' ? 'text-green-800' :
                                                        getVerificationColor() === 'yellow' ? 'text-yellow-800' :
                                                            getVerificationColor() === 'red' ? 'text-red-800' :
                                                                'text-blue-800'
                                                    }`}>
                                                    {verifying ? 'AI is verifying your payment proof...' :
                                                        verification ? getVerificationSummary(verification.verification) :
                                                            'Ready for verification'}
                                                </p>

                                                {verification?.success && verification?.verification && (
                                                    <div className="text-sm mt-2 space-y-1">
                                                        <p>Confidence: {verification.verification.confidence}%</p>
                                                        {verification.verification.detectedAmount && (
                                                            <p>Detected Amount: R{verification.verification.detectedAmount}</p>
                                                        )}
                                                        {verification.verification.bankName && (
                                                            <p>Bank: {verification.verification.bankName}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {verification && !verifying && (
                                                <button
                                                    onClick={() => setShowVerificationDetails(!showVerificationDetails)}
                                                    className="text-sm underline flex items-center"
                                                >
                                                    <Eye size={16} className="mr-1" />
                                                    Details
                                                </button>
                                            )}
                                        </div>

                                        {/* Detailed Verification Results */}
                                        <AnimatePresence>
                                            {showVerificationDetails && verification?.success && (
                                                <motion.div
                                                    className="mt-4 p-3 bg-white rounded-md text-sm"
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>Is Payment Proof: {verification.verification.isPaymentProof ? '✅' : '❌'}</div>
                                                        <div>Amount Matches: {verification.verification.amountMatches ? '✅' : '❌'}</div>
                                                        <div>Document Type: {verification.verification.documentType || 'Unknown'}</div>
                                                        <div>Confidence: {verification.verification.confidence}%</div>
                                                    </div>

                                                    {verification.verification.issues && verification.verification.issues.length > 0 && (
                                                        <div className="mt-3">
                                                            <p className="font-medium text-red-700">Issues Found:</p>
                                                            <ul className="list-disc list-inside text-red-600">
                                                                {verification.verification.issues.map((issue, index) => (
                                                                    <li key={index}>{issue}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
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
                                disabled={!paymentProof || processing || uploading || verifying}
                                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: (!paymentProof || processing || uploading || verifying) ? 1 : 1.02 }}
                                whileTap={{ scale: (!paymentProof || processing || uploading || verifying) ? 1 : 0.98 }}
                            >
                                {uploading ? 'Uploading...' :
                                    verifying ? 'AI Verifying...' :
                                        processing ? 'Processing Order...' :
                                            'Finalize Order'}
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
