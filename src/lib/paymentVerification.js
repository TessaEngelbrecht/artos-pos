import { GoogleGenerativeAI } from '@google/generative-ai'
// Check if API key is available
if (!process.env.REACT_APP_GEMINI_API_KEY) {
    console.error('Gemini API key not found. Please add REACT_APP_GEMINI_API_KEY to your .env file')
}
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY)

// Convert file to base64 for AI analysis
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            const base64 = reader.result.split(',')[1] // Remove data:image/jpeg;base64, prefix
            resolve(base64)
        }
        reader.onerror = (error) => reject(error)
    })
}

// Get MIME type from file
const getMimeType = (file) => {
    return file.type
}

// Verify payment proof using Gemini AI
export const verifyPaymentProof = async (file, expectedAmount, expectedReference) => {
    try {
        //console.log('API Key present:', !!process.env.REACT_APP_GEMINI_API_KEY)
        //console.log('Starting AI verification for amount:', expectedAmount)
        // Convert file to base64
        const base64Data = await fileToBase64(file)
        const mimeType = getMimeType(file)

        // Get Gemini model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        // Create the prompt for payment verification
        const prompt = `
    Analyze this payment proof image/document and verify the following:
    
    Expected Payment Amount: R${expectedAmount.toFixed(2)}
    Expected Reference: ${expectedReference}
    
    Please check:
    1. Is this a valid payment proof/receipt/bank statement?
    2. Can you identify the payment amount? What amount is shown?
    3. Can you identify the recipient/beneficiary information?
    4. Can you identify any reference information?
    5. Does the payment amount match R${expectedAmount.toFixed(2)} (allow for small differences like bank fees)?
    6. Is this document clear and readable?
    7. Does this appear to be a legitimate banking document?
    
    Respond in JSON format:
    {
      "isValid": boolean,
      "isPaymentProof": boolean,
      "detectedAmount": number or null,
      "amountMatches": boolean,
      "detectedReference": "string or null",
      "referenceMatches": boolean,
      "recipient": "string or null",
      "confidence": number (0-100),
      "issues": ["array of any issues found"],
      "bankName": "string or null",
      "transactionDate": "string or null",
      "documentType": "string (e.g., 'bank receipt', 'statement', 'proof of payment')"
    }
    
    Be thorough but also consider that bank documents can vary in format. Look for key payment indicators like amounts, dates, references, and banking information.
    `

        // Analyze the image
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            }
        ])

        const response = await result.response
        const text = response.text()

        //console.log('AI Response:', text)

        // Parse JSON response
        try {
            // Extract JSON from response (sometimes AI includes extra text)
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('No JSON found in AI response')
            }

            const verificationResult = JSON.parse(jsonMatch[0])

            // Validate the response structure
            const requiredFields = ['isValid', 'isPaymentProof', 'amountMatches', 'confidence']
            const hasRequiredFields = requiredFields.every(field => verificationResult.hasOwnProperty(field))

            if (!hasRequiredFields) {
                throw new Error('AI response missing required fields')
            }

            return {
                success: true,
                verification: verificationResult,
                rawResponse: text
            }

        } catch (parseError) {
            console.error('Error parsing AI response:', parseError)
            return {
                success: false,
                error: 'Failed to parse AI verification response',
                rawResponse: text
            }
        }

    } catch (error) {
        console.error('Error verifying payment proof:', error)
        return {
            success: false,
            error: error.message || 'Failed to verify payment proof',
            verification: null
        }
    }
}

// Helper function to generate verification summary
export const getVerificationSummary = (verification) => {
    if (!verification) return 'Verification failed'

    const { isValid, isPaymentProof, amountMatches, confidence, issues } = verification

    if (isValid && isPaymentProof && amountMatches && confidence >= 70) {
        return 'Payment proof verified successfully ✅'
    } else if (isPaymentProof && amountMatches) {
        return 'Payment proof appears valid but with some concerns ⚠️'
    } else if (isPaymentProof && !amountMatches) {
        return 'Payment proof detected but amount mismatch ❌'
    } else if (!isPaymentProof) {
        return 'Document does not appear to be a payment proof ❌'
    } else {
        return 'Payment proof verification inconclusive ⚠️'
    }
}
