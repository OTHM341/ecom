import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Loader2, CreditCard, CheckCircle2 } from "lucide-react";

const paymentFormSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, {
    message: "Card number must be 16 digits",
  }),
  cardholderName: z.string().min(2, {
    message: "Cardholder name must be at least 2 characters",
  }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: "Expiry date must be in format MM/YY",
  }),
  cvv: z.string().regex(/^\d{3,4}$/, {
    message: "CVV must be 3 or 4 digits",
  }),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface SimplePaymentFormProps {
  transactionId: string;
  shippingCost: number;
  taxAmount: number;
  subTotal?: number;
  total?: number;
}

export default function SimplePaymentForm({
  transactionId,
  shippingCost,
  taxAmount,
  subTotal = 0,
  total = 0,
}: SimplePaymentFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: "",
      expiryDate: "",
      cvv: "",
    },
  });

  async function onSubmit(values: PaymentFormValues) {
    try {
      setIsSubmitting(true);
      
      // Log the simulated payment
      console.log("Processing payment with transaction ID:", transactionId);
      console.log("Card details:", {
        cardNumber: `**** **** **** ${values.cardNumber.slice(-4)}`,
        cardholderName: values.cardholderName,
        expiryDate: values.expiryDate,
      });
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if the response contains an order ID or error
      if (transactionId) {
        // Try to get order ID from sessionStorage
        const paymentResponse = sessionStorage.getItem('payment_response');
        let orderId = null;
        let paymentError = false;
        
        if (paymentResponse) {
          try {
            const parsedResponse = JSON.parse(paymentResponse);
            orderId = parsedResponse.orderId;
            paymentError = parsedResponse.error;
          } catch (e) {
            console.error("Failed to parse payment response:", e);
          }
        }
        
        if (paymentError) {
          console.error("Error in payment response:", paymentError);
          toast({
            title: "Order processing failed",
            description: "We processed your payment but couldn't create your order. Please contact support.",
            variant: "destructive",
          });
          
          // Still clear cart and redirect to home
          setTimeout(() => {
            clearCart();
            setLocation("/");
          }, 1500);
          return;
        }
        
        if (orderId) {
          // Set payment as complete
          setPaymentComplete(true);
          
          toast({
            title: "Payment successful!",
            description: "Your payment has been processed successfully.",
          });
          
          // Redirect to order success page with order ID
          setTimeout(() => {
            clearCart();
            setLocation(`/order-success?orderId=${orderId}`);
          }, 1500);
          return;
        }
        
        // If we don't have an order ID yet, try to get it from the server
        try {
          const response = await apiRequest("GET", `/api/payment/${transactionId}`);
          if (response.ok) {
            const data = await response.json();
            
            if (data.orderId) {
              // Set payment as complete
              setPaymentComplete(true);
              
              toast({
                title: "Payment successful!",
                description: "Your payment has been processed successfully.",
              });
              
              // Redirect to order success page with order ID
              setTimeout(() => {
                clearCart();
                setLocation(`/order-success?orderId=${data.orderId}`);
              }, 1500);
            } else if (data.error) {
              throw new Error(data.error);
            } else {
              // Default success case (should not happen)
              setPaymentComplete(true);
              
              toast({
                title: "Payment successful!",
                description: "Your payment has been processed.",
              });
              
              // Redirect to home
              setTimeout(() => {
                clearCart();
                setLocation("/");
              }, 1500);
            }
          } else {
            throw new Error("Failed to verify payment status");
          }
        } catch (orderError) {
          console.error("Error verifying payment:", orderError);
          toast({
            title: "Order processing failed",
            description: "We processed your payment but couldn't verify your order. Please contact support.",
            variant: "destructive",
          });
          
          // Still clear cart and redirect to home
          setTimeout(() => {
            clearCart();
            setLocation("/");
          }, 1500);
        }
      }
    } catch (error) {
      toast({
        title: "Payment failed",
        description: error instanceof Error ? error.message : "An error occurred processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (paymentComplete) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-neutral-600 mb-4">
          Your payment has been processed successfully. Redirecting to order confirmation...
        </p>
        <div className="animate-pulse mt-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
      <p className="text-neutral-600 mb-6">
        All transactions are secure and encrypted.
      </p>

      <div className="mb-6">
        <div className="flex gap-2 mb-2">
          <CreditCard className="text-primary" />
          <span className="font-medium">Credit / Debit Card</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visa/visa-original.svg" className="h-8" alt="Visa" />
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mastercard/mastercard-original.svg" className="h-8" alt="Mastercard" />
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg" className="h-8" alt="Amazon" />
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      {...field}
                      inputMode="numeric"
                      maxLength={16}
                      autoComplete="cc-number"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      autoComplete="cc-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="MM/YY"
                        {...field}
                        maxLength={5}
                        autoComplete="cc-exp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cvv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVV</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123"
                        {...field}
                        inputMode="numeric"
                        maxLength={4}
                        autoComplete="cc-csc"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col gap-2 mb-6">
            <div className="flex justify-between">
              <span className="text-neutral-600">Subtotal</span>
              <span>${subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Tax</span>
              <span>${taxAmount.toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>${(total || (subTotal + shippingCost + taxAmount)).toFixed(2)}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${(total || (subTotal + shippingCost + taxAmount)).toFixed(2)}`
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}