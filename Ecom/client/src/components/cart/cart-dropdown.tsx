import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import CartItem from "./cart-item";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CartDropdownProps {
  onClose: () => void;
}

const CartDropdown = ({ onClose }: CartDropdownProps) => {
  const { cartItems, isLoading, subTotal } = useCart();
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-neutral-200 z-50 fade-in"
    >
      <div className="p-4 border-b border-neutral-200">
        <h3 className="font-medium">
          Your Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
        </h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : cartItems.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-neutral-500 mb-4">Your cart is empty</p>
          <Button
            size="sm"
            className="w-full"
            onClick={onClose}
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <>
          <div className="max-h-96 overflow-y-auto py-2">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} inDropdown={true} />
            ))}
          </div>
          
          <div className="p-4 border-t border-neutral-200">
            <div className="flex justify-between mb-3">
              <span className="font-medium">Subtotal:</span>
              <span className="font-medium">${subTotal.toFixed(2)}</span>
            </div>
            <Link href="/checkout" onClick={onClose}>
              <Button className="w-full mb-2">
                Checkout
              </Button>
            </Link>
            <Link href="/cart" onClick={onClose}>
              <Button variant="outline" className="w-full">
                View Cart
              </Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default CartDropdown;
