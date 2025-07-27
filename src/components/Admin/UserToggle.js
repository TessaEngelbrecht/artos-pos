import React from 'react'
import { motion } from 'framer-motion'
import { Users} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const UserToggle = () => {
    const navigate = useNavigate()

    const switchToUser = () => {
        navigate('/', { replace: true })
    }

    return (
        <motion.button
            onClick={switchToUser}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Switch to User View"
        >
            <Users size={18} className="mr-2" />
            <span className="text-sm font-medium">User View</span>
        </motion.button>
    )
}

export default UserToggle
