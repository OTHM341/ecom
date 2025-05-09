# ShopNest E-commerce Platform

ShopNest is a professional e-commerce platform that provides a complete solution for online shopping. Built with modern web technologies, it offers a seamless shopping experience with product browsing, cart management, secure checkout, and comprehensive admin functionality.

## Features

- **User Authentication**: Secure login and registration system with role-based authorization
- **Product Catalog**: Browse products by categories, featured items, and search functionality
- **Shopping Cart**: Add, update, and remove items from cart with real-time updates
- **Wishlist**: Save products for later consideration
- **Checkout Process**: Streamlined checkout with address management and order summaries
- **Payment Integration**: Secure payments with Stripe
- **Order Management**: Track and manage orders
- **Admin Dashboard**: Comprehensive management of products, categories, orders, and users
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

## Technologies Used

- **Frontend**: React, TailwindCSS, Shadcn/UI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with fallback to in-memory storage
- **Authentication**: Passport.js with session-based auth
- **Payment Processing**: Stripe API
- **State Management**: React Context API, TanStack Query
- **Routing**: Wouter

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB (optional, falls back to in-memory storage)
- Stripe account for payment processing

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then update `.env` with your configuration settings:
   - `SESSION_SECRET`: Random string for securing sessions
   - `MONGODB_URI`: Your MongoDB connection string (optional)
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `VITE_STRIPE_PUBLIC_KEY`: Your Stripe public key

4. Start the development server:
   ```
   npm run dev
   ```

## Admin Access

The platform comes with a pre-configured admin user:
- **Username**: admin
- **Password**: admin123

Admin users can access the admin dashboard to manage products, categories, orders and users.

## Testing Payment

For testing the payment functionality without using real credit cards, you can use Stripe's test cards:
- Card Number: 4242 4242 4242 4242
- Expiry Date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Project Structure

- `/client`: Frontend React application
- `/server`: Backend Express server
- `/shared`: Shared types and schemas
- `/public`: Static assets

## Deployment

This application can be deployed to any hosting platform that supports Node.js applications, such as:
- Vercel
- Heroku
- AWS
- Replit

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Shadcn UI for the component library
- Lucide icons for the beautiful icon set
- Tailwind CSS for the utility-first CSS framework
- Stripe for the payment processing