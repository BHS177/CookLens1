import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ 
        isSubscribed: false, 
        subscription: null 
      })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })

    // Create temporary email based on userId
    const userEmail = `${userId}@cooklens.temp`

    // Check if user has an active subscription
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    })

    if (customers.data.length === 0) {
      return NextResponse.json({ 
        isSubscribed: false, 
        subscription: null 
      })
    }

    const customer = customers.data[0]
    
    // Check for active subscriptions only
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ 
        isSubscribed: false, 
        subscription: null 
      })
    }

    const subscription = subscriptions.data[0]
    
    // Debug logging
    console.log('Subscription details:', {
      id: subscription.id,
      status: subscription.status,
      current_period_start: (subscription as any).current_period_start,
      current_period_end: (subscription as any).current_period_end,
      created: subscription.created
    })
    
    return NextResponse.json({ 
      isSubscribed: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: (subscription as any).current_period_start,
        currentPeriodEnd: (subscription as any).current_period_end,
        cancelAtPeriodEnd: (subscription as any).cancel_at_period_end,
        canceledAt: (subscription as any).canceled_at,
        created: subscription.created,
        price: subscription.items.data[0]?.price?.unit_amount || 300,
        currency: subscription.items.data[0]?.price?.currency || 'eur',
        interval: subscription.items.data[0]?.price?.recurring?.interval || 'month'
      }
    })
  } catch (error) {
    console.error('Error getting subscription details:', error)
    return NextResponse.json({ 
      isSubscribed: false, 
      subscription: null 
    })
  }
}
