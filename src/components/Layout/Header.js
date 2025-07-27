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
            className="bg-primary text-white shadow-lg sticky top-0 z-50 w-full overflow-x-hidden"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4">
                <div className="flex justify-between items-center max-w-7xl mx-auto min-w-0">
                    {/* Logo Section */}
                    <motion.div
                        className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 min-w-0"
                        whileHover={{ scale: 1.05 }}
                        onClick={() => navigate('/')}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className="flex flex-col min-w-0">
                            <h1 className="text-sm sm:text-lg lg:text-2xl font-display font-bold leading-tight truncate">
                                Artos Sourdough
                            </h1>
                            <span className="text-xs sm:text-sm opacity-75 -mt-1 truncate">by Lara</span>
                        </div>
                    </motion.div>

                    {/* Right Section */}
                    <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0 min-w-0">
                        {/* Cart Button */}
                        <motion.button
                            className="relative p-1.5 sm:p-2 hover:bg-primary-dark rounded-full transition-colors flex-shrink-0"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/cart')}
                        >
                            <ShoppingCart size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                            {itemCount > 0 && (
                                <motion.span
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex items-center justify-center text-xs font-bold"
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
                            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0 max-w-[200px] sm:max-w-none">
                                {/* Desktop User Info */}
                                <div className="hidden lg:flex items-center space-x-2 min-w-0 max-w-[150px]">
                                    <User size={16} className="flex-shrink-0" />
                                    <span className="text-sm truncate">
                                        {user.email}
                                    </span>
                                </div>

                                {/* Tablet User Info */}
                                <div className="hidden sm:flex lg:hidden items-center space-x-1 min-w-0 max-w-[120px]">
                                    <User size={14} className="flex-shrink-0" />
                                    <span className="text-xs truncate">
                                        {user.email.split('@')[0]}
                                    </span>
                                </div>

                                {/* Mobile User Icon Only */}
                                <div className="flex sm:hidden items-center">
                                    <User size={16} className="flex-shrink-0" />
                                </div>

                                <motion.button
                                    onClick={handleSignOut}
                                    className="p-1.5 sm:p-2 hover:bg-primary-dark rounded-full transition-colors flex-shrink-0"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    title="Sign Out"
                                >
                                    <LogOut size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
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
