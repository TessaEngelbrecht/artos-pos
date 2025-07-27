import React, { useState } from 'react'
import { AdminProvider } from '../contexts/AdminContext'
import AdminLayout from '../components/Admin/AdminLayout'
import AdminDashboard from '../components/Admin/AdminDashboard'
import WeeklySummary from '../components/Admin/WeeklySummary'

const AdminPage = () => {
    const [currentPage, setCurrentPage] = useState('dashboard')

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <AdminDashboard />
            case 'weekly':
                return <WeeklySummary />
            default:
                return <AdminDashboard />
        }
    }

    return (
        <AdminProvider>
            <AdminLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
                {renderCurrentPage()}
            </AdminLayout>
        </AdminProvider>
    )
}

export default AdminPage
