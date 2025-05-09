import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  clientSecret: string;
  shippingCost: number;
  taxAmount: number;
}

export default function PaymentForm({ clientSecret, shippingCost, taxAmount }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { cartItems, subTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState<any>(null);
  
  // Calculate total
  const total = subTotal + shippingCost + taxAmount;

  // Get checkout info from session storage
  useEffect(() => {
    const savedCheckoutInfo = sessionStorage.getItem('checkoutInfo');
    if (savedCheckoutInfo) {
      setCheckoutInfo(JSON.parse(savedCheckoutInfo));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret || !checkoutInfo) {
      console.error("Missing required elements for payment:", {
        stripe: !!stripe,
        elements: !!elements,
        clientSecret: !!clientSecret,
        checkoutInfo: !!checkoutInfo
      });
      toast({
        title: "Payment Error",
        description: "Payment system is not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // First, confirm the payment with Stripe
      // Determine if this is a mock payment or real payment
      const isMockPayment = clientSecret.startsWith("mock_pi_");
      console.log("Processing payment, isMockPayment:", isMockPayment);
      
      let error;
      let paymentIntent;
      let paymentSuccess = false;
      let paymentIntentId = '';
      
      if (isMockPayment) {
        // For mock payments, simulate success
        console.log("Using mock payment process");
        paymentSuccess = true;
        paymentIntentId = clientSecret.split("_secret_")[0];
        console.log("Mock payment ID:", paymentIntentId);
      } else {
        // For real Stripe payments
        try {
          console.log("Processing Stripe payment with elements", elements ? "available" : "unavailable");
          const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
              // Don't use automatic redirect
              return_url: window.location.origin + "/payment-processing",
              payment_method_data: {
                billing_details: {
                  name: `${checkoutInfo.billingAddress.firstName} ${checkoutInfo.billingAddress.lastName}`,
                  email: checkoutInfo.email,
                  phone: checkoutInfo.billingAddress.phone,
                  address: {
                    line1: checkoutInfo.billingAddress.address,
                    line2: checkoutInfo.billingAddress.apartment || '',
                    city: checkoutInfo.billingAddress.city,
                    state: checkoutInfo.billingAddress.state,
                    postal_code: checkoutInfo.billingAddress.postalCode,
                    country: checkoutInfo.billingAddress.country,
                  },
                },
              },
            },
            redirect: "if_required",
          });
          
          error = result.error;
          paymentIntent = result.paymentIntent;
          
          if (paymentIntent && paymentIntent.status === "succeeded") {
            console.log("Payment succeeded with ID:", paymentIntent.id);
            paymentSuccess = true;
            paymentIntentId = paymentIntent.id;
          } else if (error) {
            console.error("Payment error:", error);
          } else {
            console.log("Payment result without error but not succeeded:", result);
          }
        } catch (stripeError) {
          console.error("Stripe payment confirmation error:", stripeError);
          error = {
            message: stripeError instanceof Error ? stripeError.message : "An unexpected error occurred during payment"
          };
        }
      }

      if (error) {
        console.error("Payment failed with error:", error);
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        });
        return;
      }
      
      if (!paymentSuccess) {
        console.error("Payment not successful");
        toast({
          title: "Payment Failed",
          description: "The payment could not be processed. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Payment successful, creating order...");
      
      try {
        // First manually clear the cart to avoid issues with cart items during order creation
        console.log("Attempting to clear cart before order creation");
        try {
          // Keep track of which items we've already manually removed
          const removedItemIds = new Set();
          
          for (const item of cartItems) {
            console.log(`Removing cart item ID: ${item.id} (${item.product.name})`);
            try {
              await apiRequest("DELETE", `/api/cart/${item.id}`);
              // Track this item as successfully removed
              removedItemIds.add(item.id);
            } catch (itemError) {
              console.error(`Error removing item ${item.id}:`, itemError);
            }
          }
          
          // Store the removed IDs to avoid duplicate removal attempts
          window.sessionStorage.setItem('removedCartItems', JSON.stringify([...removedItemIds]));
          console.log("All cart items removed successfully");
        } catch (clearCartError) {
          console.error("Error during manual cart clearing:", clearCartError);
          // Continue with order creation even if cart clearing partially fails
        }
        
        // Payment successful, now create the order in the database
        const orderItems = cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          total: Number(item.product.price) * item.quantity
        }));

        // Prepare order data
        const orderData = {
          total: total.toString(),
          subTotal: subTotal.toString(),
          tax: taxAmount.toString(),
          shippingAddress: checkoutInfo.shippingAddress,
          billingAddress: checkoutInfo.sameAsShipping ? checkoutInfo.shippingAddress : checkoutInfo.billingAddress,
          paymentMethod: "card",
          paymentIntentId,
          items: cartItems.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            price: item.product.price.toString(),
            quantity: item.quantity,
            total: (Number(item.product.price) * item.quantity).toString()
          }))
        };
        
        console.log("Creating order with data:", orderData);
        
        console.log("Creating order with data:", 
          { ...orderData, itemCount: orderItems.length, 
            billingIsSameAsShipping: checkoutInfo.sameAsShipping }
        );
        
        const orderResponse = await apiRequest("POST", "/api/orders", orderData);
        
        if (!orderResponse.ok) {
          const errorText = await orderResponse.text();
          let errorMessage = "Unknown error";
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || "Unknown error";
          } catch (e) {
            errorMessage = errorText || "Unknown error";
          }
          throw new Error(`Order creation failed (${orderResponse.status}): ${errorMessage}`);
        }
        
        const order = await orderResponse.json();
        console.log("Order created successfully:", order);

        // Clear cart using the safer approach that won't fail if items were already removed
        console.log("Using safe cart clear mechanism that skips already removed items");
        
        // Instead of using useCart's clearCart() which might try to delete already-removed items,
        // we need to make sure we don't try to delete items we've already removed
        try {
          // Get the list of items we've already manually removed
          const removedItemIdsStr = window.sessionStorage.getItem('removedCartItems');
          const alreadyRemovedIds = removedItemIdsStr ? new Set(JSON.parse(removedItemIdsStr)) : new Set();
          
          // Check if there are any remaining items that weren't manually removed earlier
          const remainingItems = cartItems.filter(item => !alreadyRemovedIds.has(item.id));
          
          if (remainingItems.length > 0) {
            console.log(`Clearing ${remainingItems.length} remaining cart items`);
            for (const item of remainingItems) {
              try {
                await apiRequest("DELETE", `/api/cart/${item.id}`);
              } catch (err) {
                // Ignore errors for items that might have been removed already
                console.log(`Could not remove item ${item.id}, may be already removed`);
              }
            }
          } else {
            console.log("No remaining items to clear from cart");
          }
        } catch (err) {
          console.error("Error during final cart clearing:", err);
          // Continue anyway - the order is already created
        }
        
        // Clear checkout info from session storage
        sessionStorage.removeItem('checkoutInfo');
        
        // Navigate to success page
        setLocation(`/order-success?orderId=${order.id}`);
        
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
      } catch (orderError) {
        console.error("Order creation error:", orderError);
        toast({
          title: "Order Creation Failed",
          description: orderError instanceof Error ? orderError.message : "There was a problem creating your order. Please contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast({
        title: "Error",
        description: "There was a problem processing your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Information notice
  const InfoNotice = () => (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <div className="flex">
        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-blue-700">
          This is a demo checkout. You can use the test card number 4242 4242 4242 4242, any future date for expiration, any 3 digits for CVC, and any 5 digits for postal code.
        </p>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <InfoNotice />
      
      <div className="p-4 border border-neutral-200 rounded-lg">
        <PaymentElement />
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isProcessing || !stripe || !elements || !checkoutInfo}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>Complete Purchase</>
        )}
      </Button>
    </form>
  );
}