This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Environment Variables

Before running the application, you need to set up the following environment variables:

### Required for Email Notifications

- `RESEND_API_KEY`: Your Resend API key for sending emails (get it from [resend.com](https://resend.com))
  - When an order is placed and paid, the system will:
    - Send an order confirmation email to the customer
    - Send a copy to `info@manenbrouw.be` via BCC
    - Send a separate admin notification to `info@manenbrouw.be`

### Other Required Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret for verifying webhook signatures
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key for client-side
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name for image hosting
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `ADMIN_PASSWORD`: Password for admin access

Create a `.env.local` file in the root directory with these variables.

## Getting Started

Install dependencies first:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
