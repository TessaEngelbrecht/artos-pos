import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, User, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {
    const { user, signOut } = useAuth()
    const { itemCount } = useCart()
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    return (
        <motion.header
            className="bg-primary text-white shadow-lg sticky top-0 z-50"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <motion.div
                    className="flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                >
                    <h1 className="text-2xl font-display font-bold">Artos Sourdough</h1>
                    <span className="text-sm opacity-75">by Lara</span>
                </motion.div>

                <div className="flex items-center space-x-4">
                    <motion.button
                        className="relative p-2 hover:bg-primary-dark rounded-full transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/cart')}
                    >
                        <ShoppingCart size={24} />
                        {itemCount > 0 && (
                            <motion.span
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                            >
                                {itemCount}
                            </motion.span>
                        )}
                    </motion.button>

                    {user && (
                        <div className="flex items-center space-x-2">
                            <User size={20} />
                            <span className="text-sm">{user.email}</span>
                            <motion.button
                                onClick={handleSignOut}
                                className="p-2 hover:bg-primary-dark rounded-full transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <LogOut size={20} />
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>
        </motion.header>
    )
}

export default Header
