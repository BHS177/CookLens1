import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export const STRIPE_CONFIG = {
  priceId: 'price_1234567890', // This will be replaced with actual price ID
  currency: 'usd',
  amount: 300, // $3.00 in cents
}
