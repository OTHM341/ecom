import AdminLayout from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter,
  RefreshCw, 
  MoreVertical, 
  Eye, 
  Printer,
  ClipboardList,
  Truck,
  XCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// Mock orders data
const orders = [
  {
    id: 1,
    orderNumber: "ORD-001",
    customer: {
      id: 2,
      name: "John Doe",
      email: "john@example.com"
    },
    total: 125.00,
    items: 3,
    date: "2023-11-01T10:30:00",
    status: "completed",
    paymentStatus: "paid",
    shippingMethod: "Standard Delivery"
  },
  {
    id: 2,
    orderNumber: "ORD-002",
    customer: {
      id: 3,
      name: "Jane Smith",
      email: "jane@example.com"
    },
    total: 85.50,
    items: 2,
    date: "2023-11-02T14:45:00",
    status: "processing",
    paymentStatus: "paid",
    shippingMethod: "Express Delivery"
  },
  {
    id: 3,
    orderNumber: "ORD-003",
    customer: {
      id: 4,
      name: "Bob Johnson",
      email: "bob@example.com"
    },
    total: 225.25,
    items: 5,
    date: "2023-11-02T16:20:00",
    status: "completed",
    paymentStatus: "paid",
    shippingMethod: "Standard Delivery"
  },
  {
    id: 4,
    orderNumber: "ORD-004",
    customer: {
      id: 5,
      name: "Alice Williams",
      email: "alice@example.com"
    },
    total: 45.99,
    items: 1,
    date: "2023-11-03T09:15:00",
    status: "pending",
    paymentStatus: "pending",
    shippingMethod: "Standard Delivery"
  },
  {
    id: 5,
    orderNumber: "ORD-005",
    customer: {
      id: 6,
      name: "Charlie Brown",
      email: "charlie@example.com"
    },
    total: 320.75,
    items: 4,
    date: "2023-11-03T11:50:00",
    status: "processing",
    paymentStatus: "paid",
    shippingMethod: "Express Delivery"
  },
  {
    id: 6,
    orderNumber: "ORD-006",
    customer: {
      id: 7,
      name: "Eva Martinez",
      email: "eva@example.com"
    },
    total: 75.25,
    items: 2,
    date: "2023-11-04T13:30:00",
    status: "shipped",
    paymentStatus: "paid",
    shippingMethod: "Standard Delivery"
  },
  {
    id: 7,
    orderNumber: "ORD-007",
    customer: {
      id: 8,
      name: "David Wilson",
      email: "david@example.com"
    },
    total: 150.50,
    items: 3,
    date: "2023-11-04T15:45:00",
    status: "cancelled",
    paymentStatus: "refunded",
    shippingMethod: "Express Delivery"
  }
];

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  // This would normally fetch orders from an API
  // For now, we're using the mock data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: () => Promise.resolve(orders),
  });

  // Apply filters and sorting
  const filteredOrders = data
    ? data.filter((order) => {
        const matchesSearch =
          order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === "all" || 
          order.status === statusFilter;
          
        return matchesSearch && matchesStatus;
      })
    : [];

  // Apply sorting
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "date-asc") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "total-desc") {
      return b.total - a.total;
    } else if (sortBy === "total-asc") {
      return a.total - b.total;
    }
    return 0;
  });

  const handleViewOrder = (orderId: number) => {
    console.log(`View order ${orderId}`);
    // Navigate to order details page
  };

  const handleUpdateStatus = (orderId: number, status: string) => {
    console.log(`Update order ${orderId} status to ${status}`);
    // Make API call to update order status
  };

  const handlePrintInvoice = (orderId: number) => {
    console.log(`Print invoice for order ${orderId}`);
    // Generate and print invoice
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <ClipboardList className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        );
      case 'shipped':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Truck className="mr-1 h-3 w-3" />
            Shipped
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="Order Management">
      <div className="space-y-4">
        {/* Header with filters and actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="total-desc">Total (High to Low)</SelectItem>
                  <SelectItem value="total-asc">Total (Low to High)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-1 h-4 w-4" />
              Advanced Filter
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading orders...
                    </td>
                  </tr>
                ) : sortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  sortedOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-blue-600">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">{order.items} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.customer.name}</div>
                        <div className="text-xs text-gray-500">{order.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.paymentStatus === 'paid' ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            Paid
                          </Badge>
                        ) : order.paymentStatus === 'pending' ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            Pending
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Refunded
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePrintInvoice(order.id)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            {order.status !== 'pending' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'pending')}>
                                <Clock className="mr-2 h-4 w-4" />
                                Mark as Pending
                              </DropdownMenuItem>
                            )}
                            {order.status !== 'processing' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'processing')}>
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Mark as Processing
                              </DropdownMenuItem>
                            )}
                            {order.status !== 'shipped' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'shipped')}>
                                <Truck className="mr-2 h-4 w-4" />
                                Mark as Shipped
                              </DropdownMenuItem>
                            )}
                            {order.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'completed')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Completed
                              </DropdownMenuItem>
                            )}
                            {order.status !== 'cancelled' && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel Order
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}