import axios from 'axios'

const BASE_URL = 'https://api.exchangerate-api.com/v4/latest'

// Cache pentru rate-uri (să nu facem prea multe requests)
let ratesCache = null
let cacheTime = null
const CACHE_DURATION = 3600000 // 1 oră

export const getExchangeRates = async (baseCurrency = 'MDL') => {
    // Verifică cache
    const now = Date.now()
    if (ratesCache && cacheTime && (now - cacheTime) < CACHE_DURATION) {
        return ratesCache
    }

    try {
        const response = await axios.get(`${BASE_URL}/${baseCurrency}`)
        ratesCache = response.data.rates
        cacheTime = now
        return response.data.rates
    } catch (error) {
        console.error('Error fetching exchange rates:', error)
        // Fallback rates (aproximative)
        return {
            MDL: 1,
            EUR: 0.051,
            USD: 0.055,
            RON: 0.25
        }
    }
}

export const convertAmount = (amount, fromCurrency, toCurrency, rates) => {
    if (fromCurrency === toCurrency) return amount

    // Convertește prin USD ca monedă intermediară
    // amount in fromCurrency -> USD -> toCurrency
    const amountInBase = amount / rates[fromCurrency]
    const convertedAmount = amountInBase * rates[toCurrency]

    return convertedAmount
}