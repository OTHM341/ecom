import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
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
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { z } from "zod";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [location, setLocation] = useLocation();
  const { user, loginMutation, isLoading } = useAuth();

  // If user is already logged in, redirect appropriately
  useEffect(() => {
    if (user) {
      // Redirect admin users to admin dashboard, regular users to home
      if (user.isAdmin) {
        console.log("Admin user detected, redirecting to admin dashboard");
        setLocation("/admin");
      } else {
        setLocation("/");
      }
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = async (data: LoginValues) => {
    await loginMutation.mutateAsync(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Auth Form Section */}
              <div className="p-8">
                <h1 className="text-2xl font-display font-bold text-neutral-900 mb-6">
                  Sign In to Your Account
                </h1>
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Sign In
                    </Button>
                    
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link
                          href="/register"
                          className="text-primary hover:underline font-medium"
                        >
                          Register Now
                        </Link>
                      </p>
                    </div>
                  </form>
                </Form>
              </div>
              
              {/* Hero/Benefits Section */}
              <div className="bg-primary text-white p-8 flex flex-col justify-center">
                <div className="max-w-md mx-auto">
                  <h2 className="text-3xl font-display font-bold mb-4">
                    Welcome to O&N Shop
                  </h2>
                  <p className="mb-6">
                    Join our community of shoppers and enjoy a premium shopping experience with fast shipping, easy returns, and exceptional customer service.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="mr-3 bg-primary-800 p-2 rounded-full">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Access to exclusive deals and promotions</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3 bg-primary-800 p-2 rounded-full">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Save your shipping information for faster checkout</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3 bg-primary-800 p-2 rounded-full">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Track your orders and view your order history</span>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-3 bg-primary-800 p-2 rounded-full">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Receive personalized product recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}