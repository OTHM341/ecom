import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { addressSchema } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import OrderSummary from "@/components/checkout/order-summary";
import { Loader2, CheckCircle2, AlertTriangle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// We extend the address schema for the checkout form
const checkoutFormSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  sameAsShipping: z.boolean().default(true),
  email: z.string().email("Invalid email address"),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { cartItems, subTotal, isLoading } = useCart();

  // Shipping cost (free if order is over $50)
  const shippingCost = subTotal > 50 ? 0 : 5.99;
  
  // Tax (8%)
  const taxRate = 0.08;
  const taxAmount = subTotal * taxRate;
  
  // Total
  const total = subTotal + shippingCost + taxAmount;

  // Create the form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      shippingAddress: {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        address: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        phone: "",
      },
      billingAddress: {
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        address: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "US",
        phone: "",
      },
      sameAsShipping: true,
      email: user?.email || "",
    },
  });

  // Watch for sameAsShipping changes
  const sameAsShipping = form.watch("sameAsShipping");
  const shippingAddress = form.watch("shippingAddress");
  
  // Update billing address when sameAsShipping changes or shipping address changes
  useEffect(() => {
    if (sameAsShipping) {
      // Only update when sameAsShipping is true
      form.setValue("billingAddress", shippingAddress);
    }
  }, [sameAsShipping, shippingAddress, form]);

  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      setLocation("/cart");
    }
  }, [cartItems, isLoading, setLocation]);

  const onSubmit = (data: CheckoutFormValues) => {
    // If billing address is same as shipping, make sure it's properly set
    const submitData = {
      ...data,
      billingAddress: data.sameAsShipping ? data.shippingAddress : data.billingAddress
    };
    
    // Store checkout info in session/local storage to use in payment page
    sessionStorage.setItem('checkoutInfo', JSON.stringify(submitData));
    console.log("Checkout info saved:", submitData);
    
    setLocation('/payment');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-medium">Preparing your checkout...</h2>
            <p className="text-neutral-600 mt-2">This will just take a moment.</p>
          </div>
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
              <li>Checkout</li>
            </ul>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              Checkout
            </h1>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Enter your shipping information
            </p>
          </div>

          {/* Steps */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="border-b border-neutral-200 pb-4">
              <div className="flex justify-between">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mb-1">
                    1
                  </div>
                  <span className="text-sm text-primary font-medium">Information</span>
                </div>
                <div className="flex-1 flex items-center mx-4">
                  <div className="h-0.5 w-full bg-neutral-300"></div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center mb-1">
                    2
                  </div>
                  <span className="text-sm text-neutral-500 font-medium">Payment</span>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="your@email.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="shippingAddress.firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shippingAddress.lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="shippingAddress.address"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Street Address *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shippingAddress.apartment"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <FormField
                        control={form.control}
                        name="shippingAddress.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shippingAddress.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shippingAddress.postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postal Code *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="shippingAddress.country"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Country *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select Country" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="US">United States</SelectItem>
                              <SelectItem value="CA">Canada</SelectItem>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="AU">Australia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="shippingAddress.phone"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Billing Address */}
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <FormField
                        control={form.control}
                        name="sameAsShipping"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Billing address same as shipping address</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {!sameAsShipping && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="billingAddress.firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="billingAddress.lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="billingAddress.address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="billingAddress.apartment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="billingAddress.city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="billingAddress.state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="billingAddress.postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code *</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="billingAddress.country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select Country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="UK">United Kingdom</SelectItem>
                                  <SelectItem value="AU">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="billingAddress.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    {sameAsShipping && (
                      <div className="mt-4 text-sm text-gray-600">
                        <p>Billing address will be the same as shipping address.</p>
                      </div>
                    )}
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Proceed to Payment
                  </Button>
                </form>
              </Form>
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
