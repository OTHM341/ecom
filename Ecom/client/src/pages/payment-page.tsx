import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SimplePaymentForm from "@/components/checkout/simple-payment-form";
import OrderSummary from "@/components/checkout/order-summary";
import { Loader2, AlertTriangle, ChevronLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { cartItems, subTotal, isLoading } = useCart();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Shipping cost (free if order is over $50)
  const shippingCost = subTotal > 50 ? 0 : 5.99;
  
  // Tax (8%)
  const taxRate = 0.08;
  const taxAmount = subTotal * taxRate;
  
  // Total
  const total = subTotal + shippingCost + taxAmount;

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      setLocation("/cart");
    }
  }, [cartItems, isLoading, setLocation]);

  // Create payment transaction
  useEffect(() => {
    if (isLoading || cartItems.length === 0) return;

    setIsProcessing(true);
    console.log("Creating payment transaction with amount:", total);
    
    // Get checkout info from session storage
    const checkoutInfo = sessionStorage.getItem('checkoutInfo');
    let shippingAddress;
    
    if (checkoutInfo) {
      try {
        const parsedInfo = JSON.parse(checkoutInfo);
        shippingAddress = parsedInfo.shippingAddress;
      } catch (e) {
        console.error("Failed to parse checkout info:", e);
      }
    }

    // Default shipping address if none is found
    if (!shippingAddress) {
      shippingAddress = {
        firstName: user?.firstName || "Customer",
        lastName: user?.lastName || "",
        address: "123 Main St",
        city: "Anytown",
        state: "CA",
        postalCode: "90210",
        country: "USA",
        phone: "555-555-5555"
      };
    }
    
    // Include all necessary data for order creation
    apiRequest("POST", "/api/create-payment-intent", {
      amount: total,
      shippingAddress: shippingAddress,
      cartItems: cartItems.map(item => ({ 
        productId: item.product.id, 
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price 
      }))
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Payment initialization failed with status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Payment transaction created successfully:", data);
        
        // Store the payment response in sessionStorage for later use
        sessionStorage.setItem('payment_response', JSON.stringify(data));
        
        // Store the payment intent ID in state
        setClientSecret(data.paymentIntentId);
        
        // If there's an order ID already, go directly to success page
        if (data.orderId) {
          clearCart();
          setLocation(`/order-success?orderId=${data.orderId}`);
          return;
        }
        
        setError(null);
      })
      .catch((error) => {
        console.error("Error creating payment transaction:", error);
        setError("Failed to initialize payment. Please try again later.");
      })
      .finally(() => {
        setIsProcessing(false);
      });
  }, [cartItems, total, isLoading]);

  if (isLoading || isProcessing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-medium">Preparing your payment...</h2>
            <p className="text-neutral-600 mt-2">This will just take a moment.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-medium mb-2">Payment Error</h2>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Button asChild>
              <a href="/cart">Return to Cart</a>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12 bg-neutral-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm breadcrumbs mb-6">
            <ul className="flex items-center text-neutral-600">
              <li className="after:content-['/'] after:mx-2">
                <a href="/" className="hover:text-primary">Home</a>
              </li>
              <li className="after:content-['/'] after:mx-2">
                <a href="/cart" className="hover:text-primary">Cart</a>
              </li>
              <li className="after:content-['/'] after:mx-2">
                <a href="/checkout" className="hover:text-primary">Checkout</a>
              </li>
              <li>Payment</li>
            </ul>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              Payment
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Complete your purchase securely
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="border-b border-neutral-200 pb-4">
              <div className="flex justify-between">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-foreground text-primary flex items-center justify-center mb-1">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span className="text-sm text-neutral-500 font-medium">Information</span>
                </div>
                <div className="flex-1 flex items-center mx-4">
                  <div className="h-0.5 w-full bg-primary"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mb-1">
                    2
                  </div>
                  <span className="text-sm text-primary font-medium">Payment</span>
                </div>
                <div className="flex-1 flex items-center mx-4">
                  <div className="h-0.5 w-full bg-neutral-300"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center mb-1">
                    3
                  </div>
                  <span className="text-sm text-neutral-500">Confirmation</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="mb-6" 
            onClick={() => setLocation("/checkout")}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Information
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <SimplePaymentForm
                transactionId={clientSecret || ""}
                shippingCost={shippingCost}
                taxAmount={taxAmount}
                subTotal={subTotal}
                total={total}
              />
            </div>

            {/* Order Summary */}
            <OrderSummary 
              cartItems={cartItems} 
              subTotal={subTotal} 
              shippingCost={shippingCost} 
              taxAmount={taxAmount}
              inCheckout={true}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}