import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    ArrowLeft,
    ArrowRight,
    Download,
    TrendingUp,
    Users,
    MapPin,
    Package
} from 'lucide-react'
import { useAdmin } from '../../contexts/AdminContext'

const WeeklySummary = () => {
    const { getWeeklyOrders, calculateWeeklySummary, getCurrentWeekStart } = useAdmin()

    const [currentWeekStart, setCurrentWeekStart] = useState(getCurrentWeekStart())
    const [orders, setOrders] = useState([])
    const [summary, setSummary] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchWeeklyData()
    }, [currentWeekStart])

    const fetchWeeklyData = async () => {
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
    }

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

    const exportWeeklySummary = () => {
        const weekEnd = getWeekEndDate()
        const data = {
            period: `${currentWeekStart.toDateString()} - ${weekEnd.toDateString()}`,
            summary,
            orders: orders.map(order => ({
                customer: `${order.users.name} ${order.users.surname}`,
                email: order.users.email,
                contact: order.users.contact_number,
                items: order.order_items.map(item => `${item.products.name} x${item.quantity}`).join(', '),
                total: order.total_amount,
                location: order.pickup_location,
                status: order.status,
                date: new Date(order.order_date).toLocaleString()
            }))
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

                {/* Product Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <motion.div
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-semibold flex items-center">
                                <Package className="mr-2" size={20} />
                                Product Summary
                            </h3>
                        </div>
                        <div className="p-6">
                            {summary?.productSummary && Object.keys(summary.productSummary).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(summary.productSummary).map(([product, data]) => (
                                        <div key={product} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{product}</p>
                                                <p className="text-sm text-gray-600">Quantity: {data.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">R{data.revenue.toFixed(2)}</p>
                                                <p className="text-sm text-green-600">+R{data.profit.toFixed(2)} profit</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No products sold this week</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Location Summary */}
                    <motion.div
                        className="bg-white rounded-2xl shadow-lg overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="p-6 border-b">
                            <h3 className="text-xl font-semibold flex items-center">
                                <MapPin className="mr-2" size={20} />
                                Pickup Locations
                            </h3>
                        </div>
                        <div className="p-6">
                            {summary?.locationSummary && Object.keys(summary.locationSummary).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(summary.locationSummary).map(([location, data]) => (
                                        <div key={location} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{location}</p>
                                                <p className="text-sm text-gray-600">{data.count} orders</p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">R{data.revenue.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-8">No orders this week</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Weekly Orders List */}
                <motion.div
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <div className="p-6 border-b">
                        <h3 className="text-xl font-semibold">Weekly Orders ({orders.length})</h3>
                    </div>

                    {orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {order.users.name} {order.users.surname}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    {order.order_items.map((item, idx) => (
                                                        <div key={idx}>
                                                            {item.products.name} × {item.quantity}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    R{parseFloat(order.total_amount).toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {order.pickup_location}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${order.status === 'completed'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(order.order_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
