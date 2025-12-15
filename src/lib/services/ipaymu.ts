import crypto from 'crypto'

const IPAYMU_VA = process.env.IPAYMU_VA
const IPAYMU_API_KEY = process.env.IPAYMU_API_KEY
const IPAYMU_URL = process.env.NODE_ENV === 'production' 
  ? 'https://my.ipaymu.com/api/v2/payment' 
  : 'https://sandbox.ipaymu.com/api/v2/payment'

interface PaymentPayload {
  product: string[]
  qty: string[]
  price: string[]
  amount: string
  returnUrl: string
  cancelUrl: string
  notifyUrl: string
  referenceId: string
  buyerName?: string
  buyerEmail?: string
  buyerPhone?: string
}

export const iPaymu = {
  createPayment: async (payload: PaymentPayload) => {
    if (!IPAYMU_VA || !IPAYMU_API_KEY) {
        console.error("Missing iPaymu Credentials")
        return { success: false, message: "Server config missing" }
    }

    try {
      const body = JSON.stringify(payload)
      
      // Generate Signature
      // 1. SHA256 of body
      const bodyHash = crypto.createHash('sha256').update(body).digest('hex')
      
      // 2. String to sign
      const stringToSign = `POST:${IPAYMU_VA}:${bodyHash}:${IPAYMU_API_KEY}`
      
      // 3. HMAC-SHA256 signature
      const signature = crypto.createHmac('sha256', IPAYMU_API_KEY)
        .update(stringToSign)
        .digest('hex')

      const response = await fetch(IPAYMU_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'va': IPAYMU_VA,
          'signature': signature,
          'timestamp': Date.now().toString()
        },
        body: body
      })

      const data = await response.json()
      
      if (data.Status === 200) {
        return {
          success: true,
          url: data.Data.Url,
          sessionId: data.Data.SessionID
        }
      } else {
        // NEW: Handle Sandbox specific success but different status sometimes?
        // Usually 200 is standard. Let's log deeper if error.
        console.error('iPaymu Error:', data)
        return { success: false, message: data.Message || "iPaymu returned error status" }
      }
    } catch (error) {
      console.error('iPaymu Exception:', error)
      return { success: false, message: 'Payment gateway error' }
    }
  }
}
