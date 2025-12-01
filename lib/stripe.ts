import Stripe from "stripe";

// Use a fallback key during build time to prevent build failures
// The actual validation happens at runtime when the API is called
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(stripeKey, {
    apiVersion: "2025-11-17.clover",
    typescript: true,
});

// Validate at runtime
export function validateStripeKey() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not set");
    }
}
