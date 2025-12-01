import stripe
import os
from typing import Optional
from datetime import datetime, timedelta

# Stripe API Configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_YOUR_KEY_HERE")

class StripeHandler:
    """Handles all Stripe payment operations"""
    
    PRICE_ONE_TIME = "price_1SZeN0DjadSejnKUixOrLr2Q"  # $49.99 lifetime
    PRICE_MONTHLY = "price_1SZeN0DjadSejnKUPsXpNAr9"   # $9.99/month
    
    @staticmethod
    def create_checkout_session(
        user_email: str,
        user_id: int,
        price_id: str,
        success_url: str,
        cancel_url: str
    ) -> str:
        """Create a Stripe Checkout session and return the URL"""
        try:
            session = stripe.checkout.Session.create(
                customer_email=user_email,
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='payment' if price_id == StripeHandler.PRICE_ONE_TIME else 'subscription',
                success_url=success_url + '?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=cancel_url,
                metadata={
                    'user_id': user_id
                }
            )
            return session.url
        except Exception as e:
            print(f"Stripe error: {e}")
            raise
    
    @staticmethod
    def verify_webhook_signature(payload: bytes, sig_header: str) -> dict:
        """Verify Stripe webhook signature and return event"""
        webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "whsec_test")
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            return event
        except Exception as e:
            print(f"Webhook signature verification failed: {e}")
            raise
    
    @staticmethod
    def handle_successful_payment(session: dict) -> dict:
        """Process successful payment and return user data to update"""
        user_id = int(session['metadata']['user_id'])
        mode = session['mode']
        
        # Determine premium expiry
        if mode == 'payment':  # One-time payment
            premium_expires_at = None  # Lifetime access
        else:  # Subscription
            premium_expires_at = (datetime.utcnow() + timedelta(days=30)).isoformat()
        
        return {
            'user_id': user_id,
            'is_premium': True,
            'stripe_customer_id': session.get('customer'),
            'premium_expires_at': premium_expires_at
        }
