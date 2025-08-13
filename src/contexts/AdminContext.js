import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const AdminContext = createContext()

export const useAdmin = () => {
    const context = useContext(AdminContext)
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider')
    }
    return context
}

export const AdminProvider = ({ children }) => {
    const { user } = useAuth()
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    // Memoize admin emails to prevent recreation on every render
    const adminEmails = useMemo(() => [
        'tessa.engelbrecht@gmail.com',
        'reubenkruger278@gmail.com',
        'engelb.lara@gmail.com'
    ], [])

    const checkAdminStatus = useCallback(() => {
        if (user && adminEmails.includes(user.email)) {
            setIsAdmin(true)
        } else {
            setIsAdmin(false)
        }
        setLoading(false)
    }, [user, adminEmails])

    useEffect(() => {
        checkAdminStatus()
    }, [checkAdminStatus])

    // Get all orders with user info and items
    const getAllOrders = async () => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        users(name, surname, email, contact_number),
        order_items(
          *,
          products(name, price, cost_price)
        )
      `)
            .order('order_date', { ascending: false })

        if (error) throw error
        return data
    }

    // Get orders for specific week (Wednesday 16:01 to next Wednesday 16:00)
    const getWeeklyOrders = async (weekStart) => {
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)
        // Week ends at exactly 16:00:00 on the following Wednesday
        weekEnd.setHours(16, 0, 0, 0)

        const { data, error } = await supabase
            .from('orders')
            .select(`
        *,
        users(name, surname, email, contact_number),
        order_items(
          *,
          products(name, price, cost_price)
        )
      `)
            .gt('order_date', weekStart.toISOString()) // After 16:00 previous Wednesday
            .lte('order_date', weekEnd.toISOString()) // Up to and including 16:00 current Wednesday
            .order('order_date', { ascending: false })

        if (error) throw error
        return data
    }

    // Mark order as completed
    const markOrderCompleted = async (orderId) => {
        const { data, error } = await supabase
            .from('orders')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select()

        if (error) throw error
        return data[0]
    }

    // Delete order
    const deleteOrder = async (orderId) => {
        // First delete order items
        const { error: itemsError } = await supabase
            .from('order_items')
            .delete()
            .eq('order_id', orderId)

        if (itemsError) throw itemsError

        // Then delete order
        const { error: orderError } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId)

        if (orderError) throw orderError
    }

    // Add notes to order
    const addOrderNotes = async (orderId, notes) => {
        const { data, error } = await supabase
            .from('orders')
            .update({ notes })
            .eq('id', orderId)
            .select()

        if (error) throw error
        return data[0]
    }

    // Calculate weekly summary (unchanged)
    const calculateWeeklySummary = (orders) => {
        const summary = {
            totalOrders: orders.length,
            totalRevenue: 0,
            totalProfit: 0,
            totalCost: 0,
            productSummary: {},
            locationSummary: {},
            completedOrders: 0,
            pendingOrders: 0,
            breadQuantities: {},
            locationBreakdown: {}
        }

        orders.forEach(order => {
            summary.totalRevenue += parseFloat(order.total_amount)

            if (order.status === 'completed') {
                summary.completedOrders++
            } else {
                summary.pendingOrders++
            }

            // Location summary
            if (!summary.locationSummary[order.pickup_location]) {
                summary.locationSummary[order.pickup_location] = {
                    count: 0,
                    revenue: 0,
                    orders: []
                }
            }
            summary.locationSummary[order.pickup_location].count++
            summary.locationSummary[order.pickup_location].revenue += parseFloat(order.total_amount)
            summary.locationSummary[order.pickup_location].orders.push(order)

            // Initialize location breakdown for this location
            if (!summary.locationBreakdown[order.pickup_location]) {
                summary.locationBreakdown[order.pickup_location] = {}
            }

            // Product summary and profit calculation
            order.order_items.forEach(item => {
                const productName = item.products.name
                const quantity = item.quantity
                const revenue = parseFloat(item.price) * quantity
                const cost = parseFloat(item.products.cost_price) * quantity
                const profit = revenue - cost

                summary.totalProfit += profit
                summary.totalCost += cost

                // Overall bread quantities to order
                if (!summary.breadQuantities[productName]) {
                    summary.breadQuantities[productName] = 0
                }
                summary.breadQuantities[productName] += quantity

                // Bread quantities per location
                if (!summary.locationBreakdown[order.pickup_location][productName]) {
                    summary.locationBreakdown[order.pickup_location][productName] = 0
                }
                summary.locationBreakdown[order.pickup_location][productName] += quantity

                // Product summary
                if (!summary.productSummary[productName]) {
                    summary.productSummary[productName] = {
                        quantity: 0,
                        revenue: 0,
                        profit: 0,
                        cost: 0
                    }
                }

                summary.productSummary[productName].quantity += quantity
                summary.productSummary[productName].revenue += revenue
                summary.productSummary[productName].profit += profit
                summary.productSummary[productName].cost += cost
            })
        })

        return summary
    }

    // Get next Wednesday 16:01 (start of next week)
    const getNextWednesday = (date = new Date()) => {
        const nextWednesday = new Date(date)
        const day = nextWednesday.getDay()
        const hour = nextWednesday.getHours()

        // Calculate days until next Wednesday
        let daysUntilWednesday = (3 - day + 7) % 7

        // If it's Wednesday and before or exactly 16:00, we want this Wednesday at 16:01
        // If it's Wednesday and after 16:00, we want next Wednesday at 16:01
        if (day === 3) { // It's Wednesday
            if (hour < 16 || (hour === 16 && nextWednesday.getMinutes() === 0 && nextWednesday.getSeconds() === 0)) {
                // Before or exactly 16:00 - use today
                daysUntilWednesday = 0
            } else {
                // After 16:00 - use next Wednesday
                daysUntilWednesday = 7
            }
        } else if (daysUntilWednesday === 0) {
            // Not Wednesday but calculation gave 0, means we want next Wednesday
            daysUntilWednesday = 7
        }

        nextWednesday.setDate(nextWednesday.getDate() + daysUntilWednesday)
        nextWednesday.setHours(16, 1, 0, 0) // 16:01
        return nextWednesday
    }

    // Get current week start (last Wednesday 16:01)
    const getCurrentWeekStart = () => {
        const now = new Date()
        const dayOfWeek = now.getDay()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()

        let daysToLastWednesday

        if (dayOfWeek === 3) { // Today is Wednesday
            if (currentHour < 16 || (currentHour === 16 && currentMinute === 0)) {
                // Before or exactly 16:00 - current week started last Wednesday
                daysToLastWednesday = 7
            } else {
                // After 16:00 - current week started today
                daysToLastWednesday = 0
            }
        } else if (dayOfWeek > 3) {
            // Thursday to Saturday - days since Wednesday
            daysToLastWednesday = dayOfWeek - 3
        } else {
            // Sunday to Tuesday - days since last Wednesday
            daysToLastWednesday = dayOfWeek + 4
        }

        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - daysToLastWednesday)
        weekStart.setHours(16, 1, 0, 0) // 16:01
        return weekStart
    }

    const value = {
        isAdmin,
        loading,
        getAllOrders,
        getWeeklyOrders,
        markOrderCompleted,
        deleteOrder,
        addOrderNotes,
        calculateWeeklySummary,
        getCurrentWeekStart,
        getNextWednesday
    }

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    )
}

export default AdminProvider
