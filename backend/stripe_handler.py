import stripe
import os
from typing import Optional
from datetime import datetime, timedelta

# Stripe API Configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_YOUR_KEY_HERE")

# Per-course pricing (£2 per course)
COURSE_PRICE_GBP = 2.00

class StripeHandler:
    """Handles all Stripe payment operations for per-course purchases"""
    
    @staticmethod
    def create_course_checkout_session(
        user_email: str,
        course_id: int,
    def create_course_checkout_session(user_email: str, course_id: int, course_title: str, success_url: str, cancel_url: str) -> dict:
        """Create a Stripe checkout session for purchasing a single course"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'gbp',
                        'unit_amount': int(COURSE_PRICE_GBP * 100),  # £2.00 in pence
                        'product_data': {
                            'name': f'Course: {course_title}',
                            'description': f'Lifetime access to {course_title}',
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=success_url,
                cancel_url=cancel_url,
                customer_email=user_email,
                metadata={
                    'course_id': course_id,
                    'user_email': user_email,
                }
            )
            return {"url": session.url, "session_id": session.id}
        except Exception as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")
    
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
