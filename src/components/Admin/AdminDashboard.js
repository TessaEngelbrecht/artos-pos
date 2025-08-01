import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ShoppingBag,
    DollarSign,
    TrendingUp,
    Search,
    Check,
    Edit,
    Trash2,
    MapPin,
    Phone,
    Mail,
    Clock,
    Eye,
    Download
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'

const AdminDashboard = () => {
    const {
        getAllOrders,
        markOrderCompleted,
        deleteOrder,
        addOrderNotes,
        calculateWeeklySummary,
        getCurrentWeekStart
    } = useAdmin()

    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [verificationFilter, setVerificationFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [notes, setNotes] = useState('')
    const [showNotes, setShowNotes] = useState(false)
    const [showVerificationDetails, setShowVerificationDetails] = useState(null)

    const fetchOrders = useCallback(async () => {
        try {
            const data = await getAllOrders()
            setOrders(data)
            setFilteredOrders(data)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }, [getAllOrders])

    const filterOrders = useCallback(() => {
        let filtered = orders

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter)
        }

        // Verification filter
        if (verificationFilter !== 'all') {
            filtered = filtered.filter(order => {
                const hasVerification = order.verification_result && order.verification_result !== null
                if (verificationFilter === 'verified') {
                    return hasVerification
                } else if (verificationFilter === 'not-verified') {
                    return !hasVerification
                }
                return true
            })
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(order => {
                const customerName = `${order.users.name} ${order.users.surname}`.toLowerCase()
                const email = order.users.email.toLowerCase()
                const items = order.order_items.map(item => item.products.name.toLowerCase()).join(' ')

                return customerName.includes(searchTerm.toLowerCase()) ||
                    email.includes(searchTerm.toLowerCase()) ||
                    items.includes(searchTerm.toLowerCase())
            })
        }

        setFilteredOrders(filtered)
    }, [orders, searchTerm, statusFilter, verificationFilter])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    useEffect(() => {
        filterOrders()
    }, [filterOrders])

    const handleCompleteOrder = async (orderId) => {
        try {
            await markOrderCompleted(orderId)
            fetchOrders()
        } catch (error) {
            console.error('Error completing order:', error)
        }
    }

    const handleDeleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await deleteOrder(orderId)
                fetchOrders()
            } catch (error) {
                console.error('Error deleting order:', error)
            }
        }
    }

    const handleAddNotes = async () => {
        try {
            await addOrderNotes(selectedOrder.id, notes)
            setShowNotes(false)
            setNotes('')
            fetchOrders()
        } catch (error) {
            console.error('Error adding notes:', error)
        }
    }

    const getVerificationStatus = (order) => {
        if (!order.verification_result) {
            return { status: 'Not Verified', confidence: null, color: 'gray' }
        }

        try {
            const verification = JSON.parse(order.verification_result)
            if (verification.success && verification.verification) {
                const confidence = verification.verification.confidence || 0
                const isValid = verification.verification.isValid && verification.verification.amountMatches

                if (isValid && confidence >= 70) {
                    return { status: 'AI Verified', confidence, color: 'green' }
                } else if (confidence >= 50) {
                    return { status: 'Low Confidence', confidence, color: 'yellow' }
                } else {
                    return { status: 'Failed', confidence, color: 'red' }
                }
            } else {
                return { status: 'Error', confidence: null, color: 'red' }
            }
        } catch (error) {
            return { status: 'Invalid', confidence: null, color: 'red' }
        }
    }

    const downloadPaymentProof = (order) => {
        if (order.payment_proof_url) {
            // Construct Supabase storage URL
            const storageUrl = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/payment-proofs/${order.payment_proof_url}`
            window.open(storageUrl, '_blank')
        }
    }

    // Calculate summary stats
    // const currentWeekStart = getCurrentWeekStart()
    // const currentWeekOrders = orders.filter(order => {
    //     const orderDate = new Date(order.order_date)
    //     const weekEnd = new Date(currentWeekStart)
    //     weekEnd.setDate(weekEnd.getDate() + 7)
    //     return orderDate >= currentWeekStart && orderDate < weekEnd
    // })

    const summary = calculateWeeklySummary(orders)


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <motion.div
                    className="w-16 h-16 bg-primary rounded-lg shadow-lg"
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" } }}
                />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl font-display font-bold text-primary mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Manage orders and view weekly summaries
                    </p>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <ShoppingBag className="text-blue-600" size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-600 text-sm">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.totalOrders}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <DollarSign className="text-green-600" size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-600 text-sm">Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">R{summary.totalRevenue.toFixed(2)}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-primary/10 rounded-full">
                                <TrendingUp className="text-primary" size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-600 text-sm">Profit</p>
                                <p className="text-2xl font-bold text-gray-900">R{summary.totalProfit.toFixed(2)}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Check className="text-purple-600" size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-600 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.completedOrders}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Enhanced Filters */}
                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by customer name, email, or product..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                value={verificationFilter}
                                onChange={(e) => setVerificationFilter(e.target.value)}
                            >
                                <option value="all">All Verifications</option>
                                <option value="verified">AI Verified</option>
                                <option value="not-verified">Not Verified</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Orders List */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold">Orders ({filteredOrders.length})</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Items
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Location
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        AI Verification
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filteredOrders.map((order, index) => {
                                        const verificationStatus = getVerificationStatus(order)
                                        return (
                                            <motion.tr
                                                key={order.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.users.name} {order.users.surname}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <Mail size={12} className="mr-1" />
                                                            {order.users.email}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <Phone size={12} className="mr-1" />
                                                            {order.users.contact_number}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm">
                                                        {order.order_items.map((item, idx) => (
                                                            <div key={idx} className="mb-1">
                                                                {item.products.name} × {item.quantity}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 flex items-center">
                                                        <MapPin size={12} className="mr-1" />
                                                        {order.pickup_location}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        R{parseFloat(order.total_amount).toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed'
                                                            ? 'bg-green-100 text-green-800'
                                                            : order.status === 'verified'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {order.status === 'verified' ? 'Verified' :
                                                            order.status === 'completed' ? 'Completed' : 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${verificationStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                                                                verificationStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                                                    verificationStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {verificationStatus.status}
                                                            {verificationStatus.confidence && ` (${verificationStatus.confidence}%)`}
                                                        </span>
                                                        {order.verification_result && (
                                                            <button
                                                                onClick={() => setShowVerificationDetails(
                                                                    showVerificationDetails === order.id ? null : order.id
                                                                )}
                                                                className="text-blue-600 hover:text-blue-900"
                                                                title="View verification details"
                                                            >
                                                                <Eye size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    {/* Verification Details */}
                                                    {showVerificationDetails === order.id && order.verification_result && (
                                                        <motion.div
                                                            className="mt-2 p-2 bg-gray-50 rounded text-xs"
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                        >
                                                            {(() => {
                                                                try {
                                                                    const verification = JSON.parse(order.verification_result)
                                                                    if (verification.verification) {
                                                                        return (
                                                                            <div className="space-y-1">
                                                                                <div>Valid: {verification.verification.isValid ? '✅' : '❌'}</div>
                                                                                <div>Amount Match: {verification.verification.amountMatches ? '✅' : '❌'}</div>
                                                                                <div>Detected: R{verification.verification.detectedAmount || 'N/A'}</div>
                                                                                <div>Bank: {verification.verification.bankName || 'Unknown'}</div>
                                                                            </div>
                                                                        )
                                                                    }
                                                                } catch (e) {
                                                                    return <div>Invalid verification data</div>
                                                                }
                                                            })()}
                                                        </motion.div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 flex items-center">
                                                        <Clock size={12} className="mr-1" />
                                                        {new Date(order.order_date).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        {order.payment_proof_url && (
                                                            <button
                                                                onClick={() => downloadPaymentProof(order)}
                                                                className="text-purple-600 hover:text-purple-900 p-1"
                                                                title="View payment proof"
                                                            >
                                                                <Download size={16} />
                                                            </button>
                                                        )}
                                                        {order.status !== 'completed' && (
                                                            <button
                                                                onClick={() => handleCompleteOrder(order.id)}
                                                                className="text-green-600 hover:text-green-900 p-1"
                                                                title="Mark as completed"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order)
                                                                setNotes(order.notes || '')
                                                                setShowNotes(true)
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900 p-1"
                                                            title="Add notes"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteOrder(order.id)}
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                            title="Delete order"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        )
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Notes Modal */}
                <AnimatePresence>
                    {showNotes && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-2xl p-6 max-w-md w-full"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                            >
                                <h3 className="text-lg font-semibold mb-4">
                                    Add Notes - {selectedOrder?.users.name} {selectedOrder?.users.surname}
                                </h3>
                                <textarea
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    rows="4"
                                    placeholder="Add notes about this order..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                                <div className="flex justify-end space-x-3 mt-4">
                                    <button
                                        onClick={() => setShowNotes(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddNotes}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                    >
                                        Save Notes
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default AdminDashboard
