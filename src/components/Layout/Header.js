import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, User, LogOut, Menu } from 'lucide-react'
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
            className="bg-primary text-white shadow-lg sticky top-0 z-50 w-full"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    {/* Logo Section */}
                    <motion.div
                        className="flex items-center space-x-2 flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="flex flex-col">
                            <h1 className="text-lg sm:text-2xl font-display font-bold leading-tight">
                                Artos Sourdough
                            </h1>
                            <span className="text-xs sm:text-sm opacity-75 -mt-1">by Lara</span>
                        </div>
                    </motion.div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Cart Button */}
                        <motion.button
                            className="relative p-2 hover:bg-primary-dark rounded-full transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/cart')}
                        >
                            <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
                            {itemCount > 0 && (
                                <motion.span
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                >
                                    {itemCount > 99 ? '99+' : itemCount}
                                </motion.span>
                            )}
                        </motion.button>

                        {/* User Section */}
                        {user && (
                            <div className="flex items-center space-x-1 sm:space-x-2">
                                <div className="hidden sm:flex items-center space-x-2">
                                    <User size={16} />
                                    <span className="text-sm truncate max-w-32">
                                        {user.email}
                                    </span>
                                </div>
                                <motion.button
                                    onClick={handleSignOut}
                                    className="p-2 hover:bg-primary-dark rounded-full transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Sign Out"
                                >
                                    <LogOut size={18} />
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    )
}

export default Header
