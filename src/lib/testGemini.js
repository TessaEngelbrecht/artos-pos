import { GoogleGenerativeAI } from '@google/generative-ai'

export const testGeminiAPI = async () => {
    try {
       // console.log('Testing Gemini API...')
        //console.log('API Key:', process.env.REACT_APP_GEMINI_API_KEY ? 'Present' : 'Missing')

        const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        const result = await model.generateContent("Hello, can you respond with 'API working correctly'?")
        const response = await result.response
        const text = response.text()

       //console.log('API Response:', text)
        return { success: true, response: text }
    } catch (error) {
        console.error('API Test Failed:', error)
        return { success: false, error: error.message }
    }
}
