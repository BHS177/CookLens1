import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ isSubscribed: false })
    }

    // For now, create a temporary email based on userId
    // In production, you should get the real email from Clerk
    const userEmail = `${userId}@cooklens.temp`

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ isSubscribed: false })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })

    // Check if user has an active subscription
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ isSubscribed: false })
    }

    const customer = customers.data[0]
    
    // Check for active subscriptions only (cancelled subscriptions won't be active)
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    })

    // If no active subscriptions, user is not subscribed
    const isSubscribed = subscriptions.data.length > 0
    
    return NextResponse.json({ isSubscribed })
  } catch (error) {
    console.error('Error checking subscription status:', error)
    return NextResponse.json({ isSubscribed: false })
  }
}
