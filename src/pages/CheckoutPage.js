import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock, CreditCard } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'

const CheckoutPage = () => {
    const [pickupLocation, setPickupLocation] = useState('')
    const { items, getTotal } = useCart()
    const navigate = useNavigate()

    const pickupLocations = [
        {
            value: 'centurion',
            label: 'Centurion Golf Estate',
            address: 'John Vorster gate',
            time: 'Fridays 14:00 - 14:30'
        },
        {
            value: 'doxa',
            label: 'Doxa Deo Midstream',
            address: 'Office',
            time: 'Fridays 15:00 - 15:30'
        }
    ]

    const handleNext = () => {
        if (!pickupLocation) {
            alert('Please select a pickup location')
            return
        }

        const orderData = {
            items,
            total: getTotal(),
            pickup_location: pickupLocations.find(loc => loc.value === pickupLocation)?.label
        }

        navigate('/payment', { state: { orderData } })
    }

    if (items.length === 0) {
        navigate('/cart')
        return null
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col min-h-screen">
            <Header />

            <main className="container mx-auto px-4 py-8 flex-grow">
                <motion.h1
                    className="text-3xl font-display font-bold text-primary mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Checkout
                </motion.h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Pickup Location */}
                        <motion.div
                            className="bg-white rounded-lg p-6 shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="flex items-center mb-4">
                                <MapPin className="text-primary mr-2" size={24} />
                                <h2 className="text-xl font-semibold">Pickup Location</h2>
                            </div>

                            <div className="space-y-4">
                                {pickupLocations.map((location) => (
                                    <label
                                        key={location.value}
                                        className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${pickupLocation === location.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 hover:border-primary/50'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="pickup"
                                            value={location.value}
                                            checked={pickupLocation === location.value}
                                            onChange={(e) => setPickupLocation(e.target.value)}
                                            className="sr-only"
                                        />
                                        <div>
                                            <div className="font-semibold">{location.label}</div>
                                            <div className="text-gray-600 text-sm">{location.address}</div>
                                            <div className="flex items-center text-sm text-primary mt-1">
                                                <Clock size={16} className="mr-1" />
                                                {location.time}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <div className="mt-4 p-4 bg-amber-100 rounded-lg">
                                <p className="text-sm text-amber-800">
                                    <strong>Order deadline:</strong> Wednesday 15:00 for Friday pickup<br />
                                    Orders made after 15:00 on Wednesdays will be available for pickup the following Friday.
                                </p>
                            </div>
                        </motion.div>

                        {/* Order Summary */}
                        <motion.div
                            className="bg-white rounded-lg p-6 shadow-md"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                            <div className="space-y-3">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span>{item.name} × {item.quantity}</span>
                                        <span className="font-semibold">R{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between text-xl font-bold text-primary">
                                    <span>Total</span>
                                    <span>R{getTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-1">
                        <motion.div
                            className="bg-white rounded-lg p-6 shadow-md sticky top-24"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center mb-4">
                                <CreditCard className="text-primary mr-2" size={24} />
                                <h3 className="text-xl font-semibold">Payment</h3>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <p className="text-sm text-gray-600 mb-2">
                                    Payments are done via EFT only
                                </p>
                                <div className="text-sm space-y-1">
                                    <div><strong>Account holder:</strong> Lara Engelbrecht</div>
                                    <div><strong>Account number:</strong> 2131999461</div>
                                    <div><strong>Bank:</strong> Nedbank</div>
                                    <div><strong>Branch code:</strong> 198765</div>
                                    <div><strong>Reference:</strong> Your name and surname</div>
                                </div>
                            </div>

                            <motion.button
                                onClick={handleNext}
                                disabled={!pickupLocation}
                                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: pickupLocation ? 1.02 : 1 }}
                                whileTap={{ scale: pickupLocation ? 0.98 : 1 }}
                            >
                                Next: Payment Details
                            </motion.button>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default CheckoutPage
