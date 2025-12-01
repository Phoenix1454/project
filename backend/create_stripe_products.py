#!/usr/bin/env python3
"""
Script to create Stripe products and prices for the platform.
Run this once to set up your Stripe account with the necessary products.
"""

import stripe
import os

# Your Stripe secret key
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_YOUR_KEY_HERE")

def create_products():
    print("Creating Stripe products...")
    
    # Create Lifetime Access Product
    try:
        lifetime_product = stripe.Product.create(
            name="Lifetime Premium Access",
            description="Unlock all content forever with a one-time payment"
        )
        print(f"✅ Created product: {lifetime_product.name}")
        
        lifetime_price = stripe.Price.create(
            product=lifetime_product.id,
            unit_amount=4999,  # $49.99
            currency="usd",
        )
        print(f"✅ Created one-time price: ${lifetime_price.unit_amount/100}")
        print(f"   Price ID: {lifetime_price.id}")
        
    except Exception as e:
        print(f"❌ Error creating lifetime product: {e}")
    
    # Create Monthly Subscription Product
    try:
        monthly_product = stripe.Product.create(
            name="Monthly Premium Subscription",
            description="Access all content with a monthly subscription"
        )
        print(f"✅ Created product: {monthly_product.name}")
        
        monthly_price = stripe.Price.create(
            product=monthly_product.id,
            unit_amount=999,  # $9.99
            currency="usd",
            recurring={"interval": "month"}
        )
        print(f"✅ Created monthly price: ${monthly_price.unit_amount/100}/month")
        print(f"   Price ID: {monthly_price.id}")
        
    except Exception as e:
        print(f"❌ Error creating monthly product: {e}")
    
    print("\n" + "="*60)
    print("IMPORTANT: Update backend/stripe_handler.py with these Price IDs:")
    print("="*60)
    print(f'PRICE_ONE_TIME = "{lifetime_price.id}"')
    print(f'PRICE_MONTHLY = "{monthly_price.id}"')
    print("="*60)

if __name__ == "__main__":
    create_products()
