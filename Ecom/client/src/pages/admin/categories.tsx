import AdminLayout from "@/components/admin/admin-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Plus, 
  RefreshCw, 
  MoreVertical, 
  Edit, 
  Trash,
  Image as ImageIcon,
  Box,
  AlertTriangle
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
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const filteredCategories = categories
    ? categories.filter((category) => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : [];

  const getCategoryProductCount = (categoryId: number) => {
    if (!products) return 0;
    return products.filter(product => product.categoryId === categoryId).length;
  };

  const handleEdit = (categoryId: number) => {
    console.log(`Edit category ${categoryId}`);
    // Navigate to edit page or open modal
  };

  const handleDelete = (categoryId: number) => {
    console.log(`Delete category ${categoryId}`);
    // Logic to delete category
  };

  const handleRefresh = () => {
    // Refetch categories data
  };

  return (
    <AdminLayout title="Category Management">
      <div className="space-y-4">
        {/* Header with search and actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search categories..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Categories Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product Count
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Loading categories...
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => {
                    const productCount = getCategoryProductCount(category.id);
                    
                    return (
                      <tr key={category.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {category.imageUrl ? (
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={category.imageUrl}
                                  alt={category.name}
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                                  <Box className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{category.name}</div>
                              {productCount === 0 && (
                                <Badge variant="outline" className="text-amber-600">
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Empty
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-w-xs">
                          <div className="text-sm text-gray-900 truncate">{category.description || "—"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-800">
                            {category.slug}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {productCount} {productCount === 1 ? "product" : "products"}
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
                              <DropdownMenuItem onClick={() => handleEdit(category.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ImageIcon className="mr-2 h-4 w-4" />
                                Update Image
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600" 
                                onClick={() => handleDelete(category.id)}
                                disabled={productCount > 0}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}