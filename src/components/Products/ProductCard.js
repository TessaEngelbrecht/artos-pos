import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'

// Elegant color palette for each product
const productStyles = {
    'Plain Sourdough Ciabatta': {
        primaryColor: '#8B4513',
        accentColor: '#D2B48C',
        gradient: 'from-amber-100 to-orange-100'
    },
    'Plain Sourdough Bread': {
        primaryColor: '#A0522D',
        accentColor: '#DEB887',
        gradient: 'from-yellow-100 to-amber-100'
    },
    'Feta & Peppadew Sourdough Bread': {
        primaryColor: '#CD853F',
        accentColor: '#F5DEB3',
        gradient: 'from-red-100 to-pink-100'
    },
    'Olive & Rosemary Sourdough Bread': {
        primaryColor: '#6B8E23',
        accentColor: '#9ACD32',
        gradient: 'from-green-100 to-emerald-100'
    },
    'Cranberry & Pecan Nut Sourdough Bread': {
        primaryColor: '#B22222',
        accentColor: '#D2691E',
        gradient: 'from-red-100 to-orange-100'
    },
    'Pizza Bases Sourdough (5-pack, 30 cm)': {
        primaryColor: '#F4A460',
        accentColor: '#FFE4B5',
        gradient: 'from-orange-100 to-yellow-100'
    }
}

const ProductCard = ({ product, index }) => {
    const [quantity, setQuantity] = useState(1)
    const [isHovered, setIsHovered] = useState(false)
    const [imageError, setImageError] = useState(false)
    const { addItem, recentlyAdded } = useCart()

    const style = productStyles[product.name] || productStyles['Plain Sourdough Bread']

    const handleAddToCart = () => {
        addItem(product, quantity)
        setQuantity(1)
    }

    return (
        <motion.div
            className="bg-white rounded-2xl shadow-lg overflow-hidden relative group h-[480px] flex flex-col" // Fixed height and flex column
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{
                y: -8,
                scale: 1.02,
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
            }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            {/* Image Section - Fixed Height */}
            <div className={`h-48 bg-gradient-to-br ${style.gradient} relative overflow-hidden flex-shrink-0`}>
                {product.image_url && !imageError ? (
                    <motion.img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <motion.div
                            className="w-24 h-16 bg-gradient-to-br from-amber-200 to-orange-300 rounded-lg shadow-md"
                            animate={{
                                rotateY: isHovered ? [0, 15, -15, 0] : 0,
                                scale: isHovered ? [1, 1.1, 1] : 1
                            }}
                            transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
                        />
                    </div>
                )}

                {/* Price Badge */}
                <motion.div
                    className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border border-white/20"
                    animate={{
                        scale: isHovered ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    <span className="text-sm font-bold" style={{ color: style.primaryColor }}>
                        R{product.price.toFixed(2)}
                    </span>
                </motion.div>

                {/* Subtle overlay on hover */}
                <motion.div
                    className="absolute inset-0 bg-black/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Content Section - Flexible Height with Spacing */}
            <div className="p-6 flex flex-col flex-grow">
                {/* Title Section - Fixed Height */}
                <div className="h-14 mb-2">
                    <motion.h3
                        className="text-lg font-semibold text-gray-800 leading-tight"
                        style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                        animate={{
                            color: isHovered ? style.primaryColor : '#1f2937'
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        {product.name}
                    </motion.h3>
                </div>

                {/* Description Section - Fixed Height */}
                <div className="h-10 mb-4">
                    {product.description && (
                        <p
                            className="text-gray-600 text-sm leading-tight"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {product.description}
                        </p>
                    )}
                </div>

                {/* Spacer to push controls to bottom */}
                <div className="flex-grow" />

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                        <motion.button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                            style={{
                                backgroundColor: quantity > 1 ? style.primaryColor : '#e5e7eb',
                                color: quantity > 1 ? 'white' : '#6b7280'
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Minus size={16} />
                        </motion.button>

                        <motion.span
                            className="font-semibold text-lg w-8 text-center"
                            style={{ color: style.primaryColor }}
                            animate={{ scale: quantity > 1 ? 1.1 : 1 }}
                            key={quantity}
                        >
                            {quantity}
                        </motion.span>

                        <motion.button
                            onClick={() => setQuantity(Math.min(10, quantity + 1))}
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all"
                            style={{ backgroundColor: style.primaryColor }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Plus size={16} />
                        </motion.button>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <motion.button
                    onClick={handleAddToCart}
                    className={`w-full py-3 rounded-xl font-semibold text-white relative overflow-hidden shadow-lg ${recentlyAdded.includes(product.id) ? 'ring-2 ring-green-400' : ''
                        }`}
                    style={{ backgroundColor: style.primaryColor }}
                    whileHover={{
                        scale: 1.02,
                        boxShadow: `0 8px 25px ${style.primaryColor}30`
                    }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                        backgroundColor: recentlyAdded.includes(product.id) ? '#10B981' : style.primaryColor
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex items-center justify-center space-x-2 relative z-10">
                        <motion.div
                            animate={{ rotate: isHovered ? 360 : 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <ShoppingCart size={18} />
                        </motion.div>
                        <span>
                            {recentlyAdded.includes(product.id) ? 'Added!' : 'Add to Cart'}
                        </span>
                        {quantity > 1 && (
                            <motion.span
                                className="bg-white/20 px-2 py-1 rounded-full text-xs"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                            >
                                ×{quantity}
                            </motion.span>
                        )}
                    </div>
                </motion.button>
            </div>
        </motion.div>
    )
}

export default ProductCard
