import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
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

    // Admin emails list
    const adminEmails = ['tessa.engelbrecht@gmail.com', 'reubenkruger278@gmail.com', 'engelb.lara@gmail.com']

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

    // Get orders for specific week (Wednesday to Wednesday)
    const getWeeklyOrders = async (weekStart) => {
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)

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
            .gte('order_date', weekStart.toISOString())
            .lt('order_date', weekEnd.toISOString())
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
    // Update the calculateWeeklySummary function in AdminContext.js
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
            breadQuantities: {}, // New: Total bread quantities to order
            locationBreakdown: {} // New: Bread quantities per location
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
                    orders: [] // New: Store orders for this location
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



    // Get next Wednesday (start of week)
    const getNextWednesday = (date = new Date()) => {
        const nextWednesday = new Date(date)
        const day = nextWednesday.getDay()
        const daysUntilWednesday = (3 - day + 7) % 7
        if (daysUntilWednesday === 0 && date.getDay() !== 3) {
            nextWednesday.setDate(nextWednesday.getDate() + 7)
        } else {
            nextWednesday.setDate(nextWednesday.getDate() + daysUntilWednesday)
        }
        nextWednesday.setHours(0, 0, 0, 0)
        return nextWednesday
    }

    // Get current week start (last Wednesday)
    const getCurrentWeekStart = () => {
        const today = new Date()
        const dayOfWeek = today.getDay()
        const daysToWednesday = dayOfWeek >= 3 ? dayOfWeek - 3 : dayOfWeek + 4
        const weekStart = new Date(today)
        weekStart.setDate(today.getDate() - daysToWednesday)
        weekStart.setHours(0, 0, 0, 0)
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