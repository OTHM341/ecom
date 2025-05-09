import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import ProductPage from "@/pages/product-page";
import CategoryPage from "@/pages/category-page";
import CartPage from "@/pages/cart-page";
import CheckoutPage from "@/pages/checkout-page";
import PaymentPage from "@/pages/payment-page";
import OrderSuccessPage from "@/pages/order-success-page";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminCategories from "@/pages/admin/categories";
import AdminUsers from "@/pages/admin/users";
import AdminReviews from "@/pages/admin/reviews";
import AdminStock from "@/pages/admin/stock";
import AdminCoupons from "@/pages/admin/coupons";

function Router() {
  return (
    <Switch>
      {/* Client Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/category/:id" component={CategoryPage} />
      <Route path="/cart" component={CartPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <ProtectedRoute path="/payment" component={PaymentPage} />
      <ProtectedRoute path="/order-success" component={OrderSuccessPage} />
      
      {/* Admin Routes */}
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly={true} />
      <ProtectedRoute path="/admin/products" component={AdminProducts} adminOnly={true} />
      <ProtectedRoute path="/admin/categories" component={AdminCategories} adminOnly={true} />
      <ProtectedRoute path="/admin/users" component={AdminUsers} adminOnly={true} />
      <ProtectedRoute path="/admin/orders" component={AdminOrders} adminOnly={true} />
      <ProtectedRoute path="/admin/reviews" component={AdminReviews} adminOnly={true} />
      <ProtectedRoute path="/admin/stock" component={AdminStock} adminOnly={true} />
      <ProtectedRoute path="/admin/coupons" component={AdminCoupons} adminOnly={true} />
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
