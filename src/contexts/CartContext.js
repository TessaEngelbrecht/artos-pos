import React, { createContext, useContext, useReducer, useEffect, useState } from 'react'

const CartContext = createContext()

const cartReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_ITEM':
            const existingItem = state.items.find(item => item.id === action.payload.id)
            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    )
                }
            }
            return {
                ...state,
                items: [...state.items, action.payload]
            }

        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ).filter(item => item.quantity > 0)
            }

        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload.id)
            }

        case 'CLEAR_CART':
            return {
                items: [],
                total: 0
            }

        case 'UPDATE_TOTAL':
            return {
                ...state,
                total: action.payload
            }

        default:
            return state
    }
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}

export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        total: 0
    })

    // Move useState inside the component
    const [recentlyAdded, setRecentlyAdded] = useState([])

    useEffect(() => {
        const newTotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        if (newTotal !== state.total) {
            dispatch({ type: 'UPDATE_TOTAL', payload: newTotal })
        }
    }, [state.items, state.total])

    const addItem = (product, quantity = 1) => {
        dispatch({
            type: 'ADD_ITEM',
            payload: { ...product, quantity }
        })

        // Add visual feedback
        setRecentlyAdded(prev => [...prev, product.id])
        setTimeout(() => {
            setRecentlyAdded(prev => prev.filter(id => id !== product.id))
        }, 1000)
    }

    const updateQuantity = (id, quantity) => {
        dispatch({
            type: 'UPDATE_QUANTITY',
            payload: { id, quantity }
        })
    }

    const removeItem = (id) => {
        dispatch({
            type: 'REMOVE_ITEM',
            payload: { id }
        })
    }

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' })
    }

    const getTotal = () => {
        return state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    }

    const value = {
        items: state.items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotal,
        itemCount: state.items.reduce((sum, item) => sum + item.quantity, 0),
        recentlyAdded // Include this in the context value
    }

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}
