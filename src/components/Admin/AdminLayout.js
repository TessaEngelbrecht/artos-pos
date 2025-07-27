import React, { useState, useEffect } from 'react'
import UserToggle from './UserToggle'
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

    // Close sidebar when screen size changes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setSidebarOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleSignOut = async (e) => {
        e.preventDefault()
        try {
            await signOut()
            navigate('/login', { replace: true })
        } catch (error) {
            console.error('Error signing out:', error)
            navigate('/login', { replace: true })
        }
    }

    const closeSidebar = () => {
        setSidebarOpen(false)
    }

    const openSidebar = () => {
        setSidebarOpen(true)
    }

    const handleMenuItemClick = (itemId) => {
        setCurrentPage(itemId)
        setSidebarOpen(false) // Always close sidebar when menu item is clicked
    }

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'weekly', label: 'Weekly Summary', icon: Calendar }
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-x-hidden max-w-full admin-layout">
            {/* Mobile sidebar overlay */}
            <div
                className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 lg:hidden ${sidebarOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={closeSidebar}
                style={{
                    visibility: sidebarOpen ? 'visible' : 'hidden',
                    zIndex: 40
                }}
            />

            {/* Sidebar */}
            <div
                className={`fixed lg:static inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out flex-shrink-0 z-50 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{ zIndex: 50 }}
            >
                <div className="flex flex-col h-full overflow-y-auto">
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl font-display font-bold text-primary truncate">
                                    Artos Admin
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-600">by Lara</p>
                            </div>
                            {/* Close button - only visible on mobile */}
                            <button
                                onClick={closeSidebar}
                                className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0 ml-2"
                                style={{ zIndex: 60 }}
                                type="button"
                                aria-label="Close sidebar"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>
                        <div className="mt-4">
                            <UserToggle />
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
                                            onClick={() => handleMenuItemClick(item.id)}
                                            className={`w-full flex items-center px-3 sm:px-4 py-2 sm:py-3 text-left rounded-lg transition-colors text-sm sm:text-base ${currentPage === item.id
                                                    ? 'bg-primary text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                            type="button"
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
                            type="button"
                        >
                            <LogOut size={18} className="mr-2 sm:mr-3 flex-shrink-0" />
                            <span className="truncate">Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
                {/* Mobile header */}
                <div className="lg:hidden bg-white shadow-sm p-3 sm:p-4 flex items-center justify-between flex-shrink-0 relative z-30">
                    <button
                        onClick={openSidebar}
                        className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        type="button"
                        aria-label="Open sidebar"
                    >
                        <Menu size={20} />
                    </button>
                    <h1 className="text-base sm:text-lg font-semibold text-primary truncate mx-4">
                        Admin Panel
                    </h1>
                    <div className="w-10" /> {/* Spacer for centering */}
                </div>

                {/* Page content */}
                <div className="flex-1 overflow-x-hidden max-w-full relative z-10">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AdminLayout
