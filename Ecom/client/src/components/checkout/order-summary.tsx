import { CartItem as CartItemType, Product } from "@shared/schema";
import { Link } from "wouter";
import { Truck, ShieldCheck } from "lucide-react";

interface OrderSummaryProps {
  cartItems: (CartItemType & { product: Product })[];
  subTotal: number;
  shippingCost: number;
  taxAmount: number;
  inCheckout?: boolean;
}

export default function OrderSummary({ 
  cartItems, 
  subTotal, 
  shippingCost, 
  taxAmount,
  inCheckout = false
}: OrderSummaryProps) {
  // Calculate total
  const total = subTotal + shippingCost + taxAmount;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-fit">
      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
      
      <div className="border-b border-neutral-200 pb-4 space-y-4">
        {cartItems.map(item => (
          <div key={item.id} className="flex items-center">
            <div className="w-16 h-16 rounded bg-neutral-100 overflow-hidden">
              <img 
                src={item.product.imageUrl}
                alt={item.product.name} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex justify-between">
                <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                <span className="text-sm font-medium">${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
              </div>
              <p className="text-xs text-neutral-500">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="py-4 space-y-2 border-b border-neutral-200">
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600">Subtotal</span>
          <span className="text-sm font-medium">${subTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600">Shipping</span>
          <span className="text-sm font-medium">
            {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600">Tax</span>
          <span className="text-sm font-medium">${taxAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="pt-4">
        <div className="flex justify-between mb-4">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg">${total.toFixed(2)}</span>
        </div>
        
        <div className="rounded-lg bg-neutral-100 p-4">
          <div className="flex items-center text-sm text-neutral-600 mb-2">
            <Truck className="h-4 w-4 mr-2" />
            <span>Estimated delivery: 3-5 business days</span>
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <ShieldCheck className="h-4 w-4 mr-2" />
            <span>Secure checkout with Stripe</span>
          </div>
        </div>
        
        {!inCheckout && (
          <div className="mt-4">
            <Link href="/checkout">
              <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-600 transition">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
