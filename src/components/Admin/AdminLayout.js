import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Calendar,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const AdminLayout = ({ children, currentPage, setCurrentPage }) => {
    const { signOut } = useAuth()
    const navigate = useNavigate()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'weekly', label: 'Weekly Summary', icon: Calendar }
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-x-hidden max-w-full admin-layout">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.div
                className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg sm:text-xl font-display font-bold text-primary">
                                    Artos Admin
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600">by Lara</p>
                            </div>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-2 sm:p-4 overflow-y-auto">
                        <ul className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon
                                return (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => {
                                                setCurrentPage(item.id)
                                                setSidebarOpen(false)
                                            }}
                                            className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 text-left rounded-lg transition-colors text-sm sm:text-base ${currentPage === item.id
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon size={18} className="mr-2 sm:mr-3 flex-shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>

                    {/* Footer */}
                    <div className="p-2 sm:p-4 border-t flex-shrink-0">
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm sm:text-base"
                        >
                            <LogOut size={18} className="mr-2 sm:mr-3 flex-shrink-0" />
                            <span className="truncate">Sign Out</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
                {/* Mobile header */}
                <div className="lg:hidden bg-white shadow-sm p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md hover:bg-gray-100"
                    >
                        <Menu size={20} />
                    </button>
                    <h1 className="text-base sm:text-lg font-semibold text-primary truncate">Admin Panel</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Page content */}
                <div className="flex-1 overflow-x-hidden max-w-full">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AdminLayout
