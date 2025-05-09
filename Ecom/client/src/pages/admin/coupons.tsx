import AdminLayout from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  RefreshCw, 
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Calendar,
  Percent,
  Check,
  X,
  Layers,
  Tag,
  Users,
  Copy
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
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Mock data for coupons
const mockCoupons = [
  {
    id: 1,
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minPurchase: 0,
    maxUses: 1000,
    usedCount: 245,
    isActive: true,
    startDate: "2023-10-01",
    endDate: "2023-12-31",
    description: "10% off for new customers",
    applicableProducts: "all",
    applicableCategories: "all",
    userRestriction: "new"
  },
  {
    id: 2,
    code: "SUMMER25",
    type: "percentage",
    value: 25,
    minPurchase: 100,
    maxUses: 500,
    usedCount: 320,
    isActive: true,
    startDate: "2023-06-01",
    endDate: "2023-08-31",
    description: "25% off summer collection",
    applicableProducts: "selected",
    applicableCategories: "selected",
    userRestriction: "all"
  },
  {
    id: 3,
    code: "FREESHIP",
    type: "fixed",
    value: 15,
    minPurchase: 75,
    maxUses: null,
    usedCount: 189,
    isActive: true,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    description: "Free shipping on orders over $75",
    applicableProducts: "all",
    applicableCategories: "all",
    userRestriction: "all"
  },
  {
    id: 4,
    code: "FLASH50",
    type: "percentage",
    value: 50,
    minPurchase: 200,
    maxUses: 100,
    usedCount: 100,
    isActive: false,
    startDate: "2023-07-15",
    endDate: "2023-07-16",
    description: "Flash sale - 50% off orders over $200",
    applicableProducts: "selected",
    applicableCategories: "all",
    userRestriction: "all"
  },
  {
    id: 5,
    code: "LOYALTY20",
    type: "percentage",
    value: 20,
    minPurchase: 50,
    maxUses: null,
    usedCount: 76,
    isActive: true,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    description: "20% off for loyal customers",
    applicableProducts: "all",
    applicableCategories: "all",
    userRestriction: "returning"
  },
  {
    id: 6,
    code: "BLACKFRIDAY",
    type: "percentage",
    value: 30,
    minPurchase: 0,
    maxUses: null,
    usedCount: 0,
    isActive: false,
    startDate: "2023-11-24",
    endDate: "2023-11-27",
    description: "Black Friday Special - 30% off everything",
    applicableProducts: "all",
    applicableCategories: "all",
    userRestriction: "all"
  },
  {
    id: 7,
    code: "ELECTRONICS15",
    type: "percentage",
    value: 15,
    minPurchase: 0,
    maxUses: 500,
    usedCount: 124,
    isActive: true,
    startDate: "2023-09-01",
    endDate: "2023-12-31",
    description: "15% off all electronics",
    applicableProducts: "all",
    applicableCategories: "selected",
    userRestriction: "all"
  }
];

export default function CouponsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // This would normally fetch data from an API
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/coupons"],
    queryFn: () => Promise.resolve(mockCoupons),
  });

  // Apply filters
  const filteredCoupons = data
    ? data.filter((coupon) => {
        const matchesSearch =
          coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === "all" || 
          (statusFilter === "active" && coupon.isActive) ||
          (statusFilter === "inactive" && !coupon.isActive) ||
          (statusFilter === "expired" && new Date(coupon.endDate) < new Date());
          
        const matchesType = 
          typeFilter === "all" || 
          coupon.type === typeFilter;
          
        return matchesSearch && matchesStatus && matchesType;
      })
    : [];

  const handleEditCoupon = (couponId: number) => {
    console.log(`Edit coupon ${couponId}`);
    // Logic to edit coupon
  };

  const handleDeleteCoupon = (couponId: number) => {
    console.log(`Delete coupon ${couponId}`);
    // Logic to delete coupon
  };

  const handleDuplicateCoupon = (couponId: number) => {
    console.log(`Duplicate coupon ${couponId}`);
    // Logic to duplicate coupon
  };

  const handleToggleStatus = (couponId: number, newStatus: boolean) => {
    console.log(`Toggle coupon ${couponId} status to ${newStatus}`);
    // Logic to toggle coupon status
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const endDate = new Date(coupon.endDate);
    
    if (!coupon.isActive) {
      return (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
          <X className="mr-1 h-3 w-3" />
          Inactive
        </Badge>
      );
    } else if (endDate < now) {
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <Calendar className="mr-1 h-3 w-3" />
          Expired
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Check className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    }
  };

  const getRestrictionBadge = (restriction: string) => {
    switch (restriction) {
      case 'all':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Users className="mr-1 h-3 w-3" />
            All Users
          </Badge>
        );
      case 'new':
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Users className="mr-1 h-3 w-3" />
            New Users
          </Badge>
        );
      case 'returning':
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Users className="mr-1 h-3 w-3" />
            Returning Users
          </Badge>
        );
      default:
        return <Badge>{restriction}</Badge>;
    }
  };

  const getApplicabilityBadge = (products: string, categories: string) => {
    if (products === "all" && categories === "all") {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <Tag className="mr-1 h-3 w-3" />
          All Products
        </Badge>
      );
    } else if (products === "selected" || categories === "selected") {
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Layers className="mr-1 h-3 w-3" />
          Restricted
        </Badge>
      );
    }
    return null;
  };

  return (
    <AdminLayout title="Coupons & Discounts">
      <div className="space-y-4">
        {/* Header with filters and actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search coupons..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add Coupon
            </Button>
          </div>
        </div>

        {/* Coupons Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Discount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usage / Limits
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valid Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
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
                      Loading coupons...
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-2">
                            {coupon.type === 'percentage' ? (
                              <Percent className="h-5 w-5 text-primary" />
                            ) : (
                              <Tag className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-mono font-medium text-sm">
                              {coupon.code}
                            </div>
                            <div className="flex space-x-1 mt-1">
                              {getRestrictionBadge(coupon.userRestriction)}
                              {getApplicabilityBadge(coupon.applicableProducts, coupon.applicableCategories)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coupon.type === 'percentage' ? (
                          <span className="font-medium">{coupon.value}% off</span>
                        ) : (
                          <span className="font-medium">${coupon.value.toFixed(2)} off</span>
                        )}
                        {coupon.minPurchase > 0 && (
                          <div className="text-xs text-gray-500">
                            Min. purchase: ${coupon.minPurchase.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {coupon.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium">{coupon.usedCount} used</div>
                        {coupon.maxUses && (
                          <div className="text-xs">
                            Limit: {coupon.maxUses} uses
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{formatDate(coupon.startDate)}</div>
                        <div>to {formatDate(coupon.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(coupon)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-1">
                          <Switch
                            checked={coupon.isActive}
                            onCheckedChange={(checked) => handleToggleStatus(coupon.id, checked)}
                            aria-label="Toggle coupon status"
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleEditCoupon(coupon.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicateCoupon(coupon.id)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => handleDeleteCoupon(coupon.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create Coupon Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
            <DialogDescription>
              Create a new coupon code or discount for your store.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="code">Coupon Code</Label>
              <Input id="code" placeholder="e.g. SUMMER25" className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="type">Discount Type</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="value">Discount Value</Label>
              <Input id="value" type="number" placeholder="e.g. 25" className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="minPurchase">Minimum Purchase</Label>
              <Input id="minPurchase" type="number" placeholder="0" className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="maxUses">Usage Limit</Label>
              <Input id="maxUses" type="number" placeholder="Unlimited" className="mt-1" />
            </div>
            
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Description of this coupon" className="mt-1" />
            </div>
            
            <div>
              <Label htmlFor="userRestriction">User Restriction</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="User type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="new">New Users Only</SelectItem>
                  <SelectItem value="returning">Returning Users Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="products">Product Restrictions</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="selected">Selected Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2">
              <div className="flex items-center space-x-2">
                <Switch id="active" />
                <Label htmlFor="active">Active</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(false)}>
              Create Coupon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}