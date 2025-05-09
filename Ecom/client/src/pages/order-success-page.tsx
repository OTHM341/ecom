import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Order, OrderItem, Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Truck, 
  Clock, 
  ShoppingBag, 
  ArrowRight,
  Loader2
} from "lucide-react";

type OrderWithItems = Order & { items: (OrderItem & { product: Product })[] };

export default function OrderSuccessPage() {
  const [location] = useLocation();
  const [orderId, setOrderId] = useState<number | null>(null);

  // Extract order ID from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const id = params.get("orderId");
    if (id) {
      setOrderId(parseInt(id));
    }
  }, [location]);

  // Fetch order details
  const {
    data: order,
    isLoading,
    error,
    refetch
  } = useQuery<OrderWithItems>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
    retry: 3,           // Retry failed requests up to 3 times
    retryDelay: 1000,   // Wait 1 second between retries
    staleTime: 0,       // Always refetch when the component mounts
  });
  
  // Retry loading the order if there's an error
  useEffect(() => {
    if (error && orderId) {
      // Wait a moment and try again - this helps with timing issues when the order was just created
      const timer = setTimeout(() => {
        refetch();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [error, orderId, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl mx-auto text-center">
              <div className="text-destructive mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
              <p className="text-neutral-600 mb-6">We couldn't find the order you're looking for. It may have been removed or the link is invalid.</p>
              <Button asChild>
                <a href="/">Return to Home</a>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Format the date
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get the shipping address
  const shippingAddress = order.shippingAddress as any;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-display font-bold mb-2">Thank You for Your Order!</h1>
              <p className="text-neutral-600">
                Your order has been received and is being processed.
              </p>
            </div>

            <div className="border border-neutral-200 rounded-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-neutral-500 mb-1">Order Number</div>
                  <div className="font-semibold">#{order.id}</div>
                </div>
                <div className="text-center">
                  <div className="text-neutral-500 mb-1">Date</div>
                  <div className="font-semibold">{formattedDate}</div>
                </div>
                <div className="text-center">
                  <div className="text-neutral-500 mb-1">Total</div>
                  <div className="font-semibold">${Number(order.total).toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 bg-neutral-50 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-3 bg-neutral-50 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 bg-neutral-50 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-neutral-100 rounded-md overflow-hidden">
                              <img
                                src={item.product.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-neutral-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-neutral-500">
                                ${Number(item.price).toFixed(2)} each
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-neutral-500">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-neutral-900 font-medium">
                          ${Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right text-sm font-medium">
                        Subtotal:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        ${Number(order.subTotal).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right text-sm font-medium">
                        Tax:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        ${Number(order.tax).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right text-sm font-medium">
                        Shipping:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        ${(Number(order.total) - Number(order.subTotal) - Number(order.tax)).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="px-4 py-3 text-right text-base font-bold">
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-base font-bold">
                        ${Number(order.total).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <p className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                  <p>{shippingAddress.address}</p>
                  {shippingAddress.apartment && <p>{shippingAddress.apartment}</p>}
                  <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                  <p>{shippingAddress.country}</p>
                  <p>{shippingAddress.phone}</p>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Order Status</h2>
                <div className="bg-neutral-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmed</p>
                      <p className="text-sm text-neutral-500">{formattedDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Processing</p>
                      <p className="text-sm text-neutral-500">Your order is being processed</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center mr-2">
                      <Truck className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-500">Shipping</p>
                      <p className="text-sm text-neutral-500">Pending</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild>
                <a href="/">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/account/orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  View All Orders
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
