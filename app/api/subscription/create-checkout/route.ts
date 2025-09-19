import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating checkout session...')
    const { userId } = await auth()
    console.log('User ID:', userId)
    
    if (!userId) {
      console.log('No user ID found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, create a temporary email based on userId
    // In production, you should get the real email from Clerk
    const userEmail = `${userId}@cooklens.temp`
    console.log('Using temporary email:', userEmail)

    if (!process.env.STRIPE_SECRET_KEY) {
      console.log('Stripe secret key not found')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    console.log('Stripe secret key found, creating Stripe instance...')
    console.log('Stripe key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10))

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
    })

    // Create or retrieve customer
    console.log('Looking for existing customers...')
    let customer
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    })

    if (existingCustomers.data.length > 0) {
      console.log('Found existing customer:', existingCustomers.data[0].id)
      customer = existingCustomers.data[0]
    } else {
      console.log('Creating new customer...')
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          clerkUserId: userId
        }
      })
      console.log('Created customer:', customer.id)
    }

    // Get app URL with fallback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cooklens.vercel.app'
    console.log('App URL:', appUrl)
    
    // Validate URL format
    if (!appUrl.startsWith('http://') && !appUrl.startsWith('https://')) {
      throw new Error(`Invalid APP_URL format: ${appUrl}. Must include https:// or http://`)
    }

    // Create checkout session
    console.log('Creating checkout session...')
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'CookLens Pro',
              description: 'Unlimited photo uploads and AI recipe generation',
            },
            unit_amount: 300, // 3€ in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${appUrl}/settings?subscription=success`,
      cancel_url: `${appUrl}/settings?subscription=cancelled`,
    })

    console.log('Checkout session created:', session.id)
    console.log('Checkout URL:', session.url)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
