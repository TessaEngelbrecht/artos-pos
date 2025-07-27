import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar,
    ArrowLeft,
    ArrowRight,
    Download,
    TrendingUp,
    Users,
    MapPin,
    Package,
    DollarSign,
    CheckCircle,
    Clock,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'

const WeeklySummary = () => {
    const { getWeeklyOrders, calculateWeeklySummary, getCurrentWeekStart, markOrderCompleted } = useAdmin()

    const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentWeekStart())
    const [orders, setOrders] = useState([])
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)
    const [expandedLocation, setExpandedLocation] = useState(null)

    const fetchWeeklyData = useCallback(async () => {
        setLoading(true)
        try {
            const weeklyOrders = await getWeeklyOrders(currentWeekStart)
            setOrders(weeklyOrders)
            setSummary(calculateWeeklySummary(weeklyOrders))
        } catch (error) {
            console.error('Error fetching weekly data:', error)
        } finally {
            setLoading(false)
        }
    }, [currentWeekStart, getWeeklyOrders, calculateWeeklySummary])

    useEffect(() => {
        fetchWeeklyData()
    }, [fetchWeeklyData])

    const navigateWeek = (direction) => {
        const newDate = new Date(currentWeekStart)
        newDate.setDate(newDate.getDate() + (direction * 7))
        setCurrentWeekStart(newDate)
    }

    const getWeekEndDate = () => {
        const weekEnd = new Date(currentWeekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        return weekEnd
    }

    const handlePickedUp = async (orderId) => {
        try {
            await markOrderCompleted(orderId)
            fetchWeeklyData() // Refresh data
        } catch (error) {
            console.error('Error marking order as picked up:', error)
        }
    }

    const exportWeeklySummary = () => {
        const weekEnd = getWeekEndDate()
        const data = {
            period: `${currentWeekStart.toDateString()} - ${weekEnd.toDateString()}`,
            summary: {
                ...summary,
                paymentToBaker: `R${summary.totalCost.toFixed(2)}`
            },
            breadToOrder: summary.breadQuantities,
            locationBreakdown: summary.locationBreakdown,
            orders: orders.map(order => ({
                customer: `${order.users.name} ${order.users.surname}`,
                email: order.users.email,
                contact: order.users.contact_number,
                items: order.order_items.map(item => `${item.products.name} x${item.quantity}`).join(', '),
                total: order.total_amount,
                location: order.pickup_location,
                status: order.status,
                date: new Date(order.order_date).toLocaleString()
            })),
            bakerPayment: {
                totalCost: summary.totalCost,
                formatted: `R${summary.totalCost.toFixed(2)}`,
                note: "This is the total amount to pay the baker for this week"
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `weekly-summary-${currentWeekStart.toISOString().split('T')[0]}.json`
        a.click()
    }

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
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-display font-bold text-primary mb-2">
                                Weekly Summary
                            </h1>
                            <p className="text-gray-600">
                                {currentWeekStart.toDateString()} - {getWeekEndDate().toDateString()}
                            </p>
                        </div>
                        <button
                            onClick={exportWeeklySummary}
                            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <Download size={20} className="mr-2" />
                            Export
                        </button>
                    </div>
                </motion.div>

                {/* Week Navigation */}
                <motion.div
                    className="bg-white rounded-2xl p-6 shadow-lg mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigateWeek(-1)}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Previous Week
                        </button>

                        <div className="flex items-center">
                            <Calendar size={20} className="mr-2 text-primary" />
                            <span className="font-semibold">
                                Week of {currentWeekStart.toLocaleDateString()}
                            </span>
                        </div>

                        <button
                            onClick={() => navigateWeek(1)}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Next Week
                            <ArrowRight size={20} className="ml-2" />
                        </button>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-600 text-sm">Total Orders</p>
                                <p className="text-2xl font-bold text-gray-900">{summary?.totalOrders || 0}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <TrendingUp className="text-green-600" size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-600 text-sm">Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">R{summary?.totalRevenue.toFixed(2) || '0.00'}</p>
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
                                <p className="text-2xl font-bold text-gray-900">R{summary?.totalProfit.toFixed(2) || '0.00'}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-orange-500"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <DollarSign className="text-orange-600" size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-600 text-sm">Baker Payment</p>
                                <p className="text-2xl font-bold text-gray-900">R{summary?.totalCost.toFixed(2) || '0.00'}</p>
                                <p className="text-xs text-orange-600">Amount to pay baker</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Package className="text-purple-600" size={24} />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-600 text-sm">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">{summary?.completedOrders || 0}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Baker Payment Summary */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="p-6 border-b bg-orange-50">
                        <h3 className="text-xl font-semibold flex items-center text-orange-800">
                            <Package className="mr-2" size={20} />
                            Baker Payment Summary - Total Bread to Order
                        </h3>
                    </div>
                    <div className="p-6">
                        {summary?.breadQuantities && Object.keys(summary.breadQuantities).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {Object.entries(summary.breadQuantities).map(([breadType, quantity]) => (
                                    <motion.div
                                        key={breadType}
                                        className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-orange-600 mb-2">{quantity}</div>
                                            <div className="text-sm font-medium text-gray-700">{breadType}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No bread orders this week</p>
                        )}

                        <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 text-center">
                            <p className="text-lg font-semibold text-orange-800">
                                Total Payment to Baker: <span className="text-2xl">R{summary?.totalCost.toFixed(2) || '0.00'}</span>
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Pickup Locations Breakdown */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold flex items-center">
                            <MapPin className="mr-2" size={20} />
                            Pickup Locations & Bread Distribution
                        </h3>
                    </div>
                    <div className="p-6">
                        {summary?.locationSummary && Object.keys(summary.locationSummary).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(summary.locationSummary).map(([location, data]) => (
                                    <motion.div
                                        key={location}
                                        className="border border-gray-200 rounded-lg overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <button
                                            onClick={() => setExpandedLocation(expandedLocation === location ? null : location)}
                                            className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                <MapPin size={16} className="mr-2 text-primary" />
                                                <span className="font-medium text-gray-900">{location}</span>
                                                <span className="ml-2 text-sm text-gray-600">({data.count} orders)</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="font-bold text-gray-900 mr-3">R{data.revenue.toFixed(2)}</span>
                                                {expandedLocation === location ?
                                                    <ChevronUp size={20} className="text-gray-500" /> :
                                                    <ChevronDown size={20} className="text-gray-500" />
                                                }
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {expandedLocation === location && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="border-t border-gray-200"
                                                >
                                                    <div className="p-4 bg-blue-50">
                                                        <h4 className="font-semibold text-blue-800 mb-3">Bread needed for {location}:</h4>
                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                            {summary.locationBreakdown[location] && Object.entries(summary.locationBreakdown[location]).map(([breadType, quantity]) => (
                                                                <div key={breadType} className="bg-white border border-blue-200 rounded-md p-2 text-center">
                                                                    <div className="text-lg font-bold text-blue-600">{quantity}</div>
                                                                    <div className="text-xs text-gray-600">{breadType}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No pickup locations this week</p>
                        )}
                    </div>
                </motion.div>

                {/* Simple Order Bubbles */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold">All Orders ({orders.length})</h3>
                    </div>

                    {orders.length > 0 ? (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {orders.map((order) => (
                                    <motion.div
                                        key={order.id}
                                        className={`border rounded-lg p-4 ${order.status === 'completed'
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-yellow-50 border-yellow-200'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="mb-3">
                                            <h4 className="font-semibold text-gray-900">
                                                {order.users.name} {order.users.surname}
                                            </h4>
                                            <p className="text-sm text-gray-600">{order.pickup_location}</p>
                                        </div>

                                        <div className="mb-3">
                                            {order.order_items.map((item, idx) => (
                                                <div key={idx} className="text-sm text-gray-700">
                                                    {item.products.name} × {item.quantity}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-lg">R{parseFloat(order.total_amount).toFixed(2)}</span>

                                            {order.status === 'completed' ? (
                                                <div className="flex items-center text-green-600">
                                                    <CheckCircle size={16} className="mr-1" />
                                                    <span className="text-sm font-medium">Picked Up</span>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handlePickedUp(order.id)}
                                                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                                >
                                                    <Clock size={14} className="mr-1" />
                                                    Mark Picked Up
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-gray-500">No orders found for this week</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default WeeklySummary
