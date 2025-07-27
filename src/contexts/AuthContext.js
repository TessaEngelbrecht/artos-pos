import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const signUp = async (email, password, userData) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        })
        return { data, error }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        return { data, error }
    }

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) {
                console.error('Error signing out:', error)
            }
            // Clear user state immediately
            setUser(null)
            setLoading(false)

            // Clear any local storage or session storage
            localStorage.clear()
            sessionStorage.clear()

            return { error: null }
        } catch (error) {
            console.error('Unexpected error during signout:', error)
            // Even if there's an error, clear the user state
            setUser(null)
            setLoading(false)
            return { error }
        }
    }

    const value = {
        user,
        signUp,
        signIn,
        signOut,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
