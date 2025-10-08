import React from 'react'

const Footer = () => {
    return (
        <footer className="bg-gray-100 text-center text-sm text-gray-600 py-6 mt-12 select-none">
            <p>
                Website by <strong>Tessa Engelbrecht</strong>.{' '}
                If you would like your own website please contact me at{' '}
                <a
                    href="mailto:tessa.engelbrecht@gmail.com"
                    className="text-primary hover:underline"
                >
                    tessa.engelbrecht@gmail.com
                </a>.
            </p>
        </footer>
    )
}

export default Footer
