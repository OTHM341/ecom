import { useState } from "react";
import { Link } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartItem from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, ArrowRight, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";

export default function CartPage() {
  const { cartItems, isLoading, subTotal, totalItems } = useCart();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  
  // Shipping cost could be calculated based on order size or user location
  const shippingCost = subTotal > 50 ? 0 : 5.99;
  
  // Tax rate (e.g., 8%)
  const taxRate = 0.08;
  const taxAmount = subTotal * taxRate;
  
  // Total (including tax and shipping)
  const total = subTotal + taxAmount + shippingCost;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-6">Your Cart</h1>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : cartItems.length === 0 ? (
            <div className="text-center py-16 border rounded-lg bg-neutral-50">
              <div className="mx-auto flex justify-center mb-4">
                <ShoppingCart className="h-16 w-16 text-neutral-300" />
              </div>
              <h2 className="text-2xl font-medium text-neutral-700 mb-2">Your cart is empty</h2>
              <p className="text-neutral-500 mb-8">Looks like you haven't added any products to your cart yet.</p>
              <Button asChild>
                <Link href="/">Start Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                      {cartItems.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="flex max-w-md">
                    <Input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="rounded-r-none"
                    />
                    <Button variant="secondary" className="rounded-l-none">
                      Apply
                    </Button>
                  </div>
                  <Link href="/">
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary-50">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Order Summary */}
              <div className="bg-white rounded-lg border border-neutral-200 p-6 h-fit">
                <h2 className="text-lg font-medium mb-4">Order Summary</h2>
                
                <div className="space-y-3 border-b border-neutral-200 pb-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Subtotal ({totalItems} items)</span>
                    <span className="font-medium">${subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-medium">
                      {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Tax (8%)</span>
                    <span className="font-medium">${taxAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between py-4 border-b border-neutral-200">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">${total.toFixed(2)}</span>
                </div>
                
                <div className="mt-6">
                  <Button asChild className="w-full">
                    <Link href={user ? "/checkout" : "/auth"}>
                      {user ? "Proceed to Checkout" : "Sign In to Checkout"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                <div className="mt-4 rounded-lg bg-neutral-50 p-4">
                  <div className="flex items-center text-sm text-neutral-600 mb-2">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center text-sm text-neutral-600">
                    <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Secure checkout with Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
