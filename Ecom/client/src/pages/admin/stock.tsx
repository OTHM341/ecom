import AdminLayout from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  RefreshCw, 
  Plus,
  Minus,
  PackageCheck,
  PackageX,
  MoreVertical, 
  Download,
  Upload,
  AlertTriangle,
  Box
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

export default function StockManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [quantityToUpdate, setQuantityToUpdate] = useState(1);
  const [updateType, setUpdateType] = useState<"add" | "remove">("add");

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Apply filters
  const filteredProducts = products
    ? products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = 
          categoryFilter === "all" || 
          product.categoryId.toString() === categoryFilter;
        
        const matchesStock = 
          stockFilter === "all" || 
          (stockFilter === "instock" && product.inventory > 10) ||
          (stockFilter === "lowstock" && product.inventory <= 10 && product.inventory > 0) ||
          (stockFilter === "outofstock" && product.inventory === 0);
          
        return matchesSearch && matchesCategory && matchesStock;
      })
    : [];

  const getCategoryName = (categoryId) => {
    if (!categories) return "Loading...";
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  const handleOpenUpdateDialog = (productId: number, type: "add" | "remove") => {
    setCurrentProductId(productId);
    setUpdateType(type);
    setQuantityToUpdate(1);
    setIsUpdateDialogOpen(true);
  };

  const handleStockUpdate = () => {
    if (!currentProductId) return;
    
    const finalQuantity = updateType === "add" ? quantityToUpdate : -quantityToUpdate;
    console.log(`Update product ${currentProductId} stock by ${finalQuantity}`);
    // Logic to update stock
    
    setIsUpdateDialogOpen(false);
  };

  const handleExportInventory = () => {
    console.log("Export inventory");
    // Logic to export inventory to CSV/Excel
  };

  const handleImportInventory = () => {
    console.log("Import inventory");
    // Logic to import inventory from CSV/Excel
  };

  const getCurrentProduct = () => {
    if (!currentProductId || !products) return null;
    return products.find(p => p.id === currentProductId);
  };

  return (
    <AdminLayout title="Stock Management">
      <div className="space-y-4">
        {/* Header with filters and actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="relative md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="instock">In Stock</SelectItem>
                  <SelectItem value="lowstock">Low Stock</SelectItem>
                  <SelectItem value="outofstock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportInventory}>
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportInventory}>
              <Upload className="mr-1 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stock Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Current Stock
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
                {isLoadingProducts ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {product.imageUrl ? (
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={product.imageUrl}
                                alt={product.name}
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                                <Box className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">{product.description.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCategoryName(product.categoryId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs">
                          SKU-{product.id.toString().padStart(6, '0')}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="font-semibold">
                          {product.inventory} units
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.inventory > 10 ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <PackageCheck className="mr-1 h-3 w-3" />
                            In Stock
                          </Badge>
                        ) : product.inventory > 0 ? (
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Low Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                            <PackageX className="mr-1 h-3 w-3" />
                            Out of Stock
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end space-x-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleOpenUpdateDialog(product.id, "add")}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenUpdateDialog(product.id, "remove")}
                            disabled={product.inventory <= 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenUpdateDialog(product.id, "add")}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleOpenUpdateDialog(product.id, "remove")}
                                disabled={product.inventory <= 0}
                              >
                                <Minus className="mr-2 h-4 w-4" />
                                Remove Stock
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Set Stock Alert
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Stock History
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

      {/* Stock Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {updateType === "add" ? "Add Stock" : "Remove Stock"}
            </DialogTitle>
            <DialogDescription>
              {updateType === "add" 
                ? "Add inventory to your product stock" 
                : "Remove inventory from your product stock"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="product">Product</Label>
              <div className="text-sm font-medium">{getCurrentProduct()?.name || "Loading..."}</div>
              <div className="text-sm text-gray-500">Current stock: {getCurrentProduct()?.inventory || 0} units</div>
            </div>
            
            <div className="flex flex-col gap-1">
              <Label htmlFor="quantity">Quantity to {updateType === "add" ? "Add" : "Remove"}</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantityToUpdate}
                onChange={(e) => setQuantityToUpdate(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStockUpdate}>
              {updateType === "add" ? "Add Stock" : "Remove Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}