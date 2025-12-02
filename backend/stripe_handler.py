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
    def handle_course_purchase(session: dict, db) -> dict:
        """Process successful course purchase and create CoursePurchase record"""
        from .models import CoursePurchase
        
        course_id = int(session['metadata']['course_id'])
        user_email = session['metadata']['user_email']
        payment_id = session['payment_intent']
        
        # Import User model
        from .models import User
        user = db.query(User).filter(User.email == user_email).first()
        
        if not user:
            raise Exception(f"User not found: {user_email}")
        
        # Create course purchase record
        purchase = CoursePurchase(
            user_id=user.id,
            course_id=course_id,
            stripe_payment_id=payment_id,
            amount_paid=COURSE_PRICE_GBP
        )
        db.add(purchase)
        db.commit()
        
        return {
            'user_id': user.id,
            'course_id': course_id,
            'purchased_at': purchase.purchased_at
        }

