import AdminLayout from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3Icon, 
  UsersIcon, 
  PackageIcon, 
  ShoppingCartIcon, 
  TrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react";

const statsCards = [
  {
    name: "Total Sales",
    value: "$25,430",
    change: "+12%",
    changeType: "increase",
    icon: TrendingUpIcon,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    name: "Total Orders",
    value: "27",
    change: "+8%",
    changeType: "increase",
    icon: ShoppingCartIcon,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
  },
  {
    name: "Products",
    value: "24",
    change: "+3",
    changeType: "increase",
    icon: PackageIcon,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
  },
  {
    name: "Users",
    value: "28",
    change: "+18%",
    changeType: "increase",
    icon: UsersIcon,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-500",
  },
];

export default function AdminDashboard() {
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    select: (data) => {
      if (!data) return [];
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    select: (data) => {
      if (!data) return [];
      return data;
    },
  });

  const totalProducts = products?.length || 0;
  const totalCategories = categories?.length || 0;
  const lowStockProducts = products?.filter(product => product.inventory < 10).length || 0;

  // For demo purposes, we're using static data
  // In a real app, you would fetch this data from the server
  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", date: "2023-11-01", total: "$125.00", status: "Completed" },
    { id: "ORD-002", customer: "Jane Smith", date: "2023-11-02", total: "$85.50", status: "Processing" },
    { id: "ORD-003", customer: "Bob Johnson", date: "2023-11-02", total: "$225.25", status: "Completed" },
    { id: "ORD-004", customer: "Alice Williams", date: "2023-11-03", total: "$45.99", status: "Pending" },
    { id: "ORD-005", customer: "Charlie Brown", date: "2023-11-03", total: "$320.75", status: "Processing" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stats Cards */}
          {statsCards.map((stat) => (
            <Card key={stat.name} className="p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="mt-1 text-2xl font-semibold">{stat.value}</p>
                </div>
                <div className={`rounded-md p-2 ${stat.iconBg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm">
                {stat.changeType === "increase" ? (
                  <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
                )}
                <span
                  className={`font-medium ${
                    stat.changeType === "increase" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="ml-1 text-gray-500">from last month</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Inventory Summary */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-medium">Inventory Summary</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Products</span>
                <span className="font-medium">{totalProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Categories</span>
                <span className="font-medium">{totalCategories}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Low Stock Products</span>
                <span className="font-medium text-amber-500">{lowStockProducts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Out of Stock Products</span>
                <span className="font-medium text-red-500">3</span>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-medium">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="mt-0.5 rounded-full bg-green-100 p-1">
                  <PackageIcon className="h-4 w-4 text-green-500" />
                </span>
                <div>
                  <p className="text-sm font-medium">New product added</p>
                  <p className="text-xs text-gray-500">Premium Watch added to Electronics</p>
                  <p className="text-xs text-gray-400">12 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="mt-0.5 rounded-full bg-blue-100 p-1">
                  <ShoppingCartIcon className="h-4 w-4 text-blue-500" />
                </span>
                <div>
                  <p className="text-sm font-medium">New order received</p>
                  <p className="text-xs text-gray-500">Order #1234 from Jane Smith</p>
                  <p className="text-xs text-gray-400">45 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="mt-0.5 rounded-full bg-purple-100 p-1">
                  <UsersIcon className="h-4 w-4 text-purple-500" />
                </span>
                <div>
                  <p className="text-sm font-medium">New user registered</p>
                  <p className="text-xs text-gray-500">User ID #5678</p>
                  <p className="text-xs text-gray-400">2 hours ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="overflow-hidden p-0">
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <h2 className="text-lg font-medium">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-blue-600">
                      {order.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{order.customer}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{order.date}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {order.total}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-tight ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Processing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}