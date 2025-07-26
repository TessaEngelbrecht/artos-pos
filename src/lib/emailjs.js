import emailjs from '@emailjs/browser'

export const sendOrderEmail = async (orderData, userInfo) => {
    try {
        const templateParams = {
            to_email: 'tessa.engelbrecht@gmail.com', // Make sure this is set engelb.lara@gmail.com
            to_name: 'Lara Engelbrecht', // Add recipient name
            from_name: `${userInfo.name} ${userInfo.surname}`,
            customer_name: `${userInfo.name} ${userInfo.surname}`,
            customer_email: userInfo.email,
            customer_contact: userInfo.contact_number,
            order_details: orderData.items.map(item =>
                `${item.name} x ${item.quantity} = R${(item.price * item.quantity).toFixed(2)}`
            ).join('\n'),
            total_amount: `R${orderData.total.toFixed(2)}`,
            pickup_location: orderData.pickup_location,
            order_date: new Date().toLocaleDateString(),
            reply_to: userInfo.email // Add reply-to email
        }

        console.log('Sending email with params:', templateParams) // Debug log

        const response = await emailjs.send(
            process.env.REACT_APP_EMAILJS_SERVICE_ID,
            process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
            templateParams,
            process.env.REACT_APP_EMAILJS_PUBLIC_KEY
        )

        console.log('Email sent successfully:', response)
        return response
    } catch (error) {
        console.error('Email sending failed:', error)
        throw error
    }
}
