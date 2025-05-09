import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductGrid from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Filter, ChevronDown } from "lucide-react";
import { Category, Product } from "@shared/schema";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:id");
  const categoryId = params?.id !== "all" ? parseInt(params?.id || "0") : undefined;
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("featured");

  // Fetch category data if categoryId is provided
  const {
    data: category,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
    enabled: !!categoryId,
  });

  // Fetch products
  const {
    data: products = [],
    isLoading: isProductsLoading,
    error: productsError,
  } = useQuery<Product[]>({
    queryKey: categoryId 
      ? [`/api/categories/${categoryId}/products`, { page }] 
      : ["/api/products", { page }],
  });

  // Fetch all categories for the sidebar
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const isLoading = isCategoryLoading || isProductsLoading || isCategoriesLoading;
  const error = categoryError || productsError || categoriesError;

  const sortProducts = (products: Product[]) => {
    const sortedProducts = [...products];
    switch (sortBy) {
      case "price-low":
        return sortedProducts.sort((a, b) => Number(a.price) - Number(b.price));
      case "price-high":
        return sortedProducts.sort((a, b) => Number(b.price) - Number(a.price));
      case "newest":
        return sortedProducts.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "rating":
        return sortedProducts.sort((a, b) => Number(b.rating) - Number(a.rating));
      case "featured":
      default:
        return sortedProducts.filter((p) => p.isFeatured).concat(sortedProducts.filter((p) => !p.isFeatured));
    }
  };

  const sortedProducts = sortProducts(products);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="text-sm breadcrumbs mb-6">
            <ul className="flex items-center text-neutral-600">
              <li className="after:content-['/'] after:mx-2">
                <a href="/" className="hover:text-primary">Home</a>
              </li>
              {categoryId ? (
                <>
                  <li className="after:content-['/'] after:mx-2">
                    <a href="/category/all" className="hover:text-primary">All Categories</a>
                  </li>
                  <li>{category?.name || "Loading..."}</li>
                </>
              ) : (
                <li>All Categories</li>
              )}
            </ul>
          </div>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-neutral-900">
              {categoryId ? category?.name || "Loading..." : "All Products"}
            </h1>
            {categoryId && category?.description && (
              <p className="mt-2 text-neutral-600">{category.description}</p>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p>Failed to load products. Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="hidden md:block space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Categories</h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="/category/all"
                        className={`block px-3 py-2 rounded-md ${
                          !categoryId
                            ? "bg-primary/10 text-primary"
                            : "text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        All Products
                      </a>
                    </li>
                    {categories
                      .filter((cat, index, self) => 
                        index === self.findIndex(c => c.id === cat.id)
                      )
                      .map((cat) => (
                        <li key={cat.id}>
                          <a
                            href={`/category/${cat.id}`}
                            className={`block px-3 py-2 rounded-md ${
                              categoryId === cat.id
                                ? "bg-primary/10 text-primary"
                                : "text-neutral-600 hover:bg-neutral-100"
                            }`}
                          >
                            {cat.name}
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
                
                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="font-medium mb-3">Price Range</h3>
                  {/* Price filter could be added here */}
                  <p className="text-sm text-neutral-600">Coming soon</p>
                </div>
              </div>

              {/* Products Section */}
              <div className="md:col-span-3">
                {/* Mobile categories dropdown */}
                <div className="md:hidden mb-6">
                  <Select
                    value={categoryId?.toString() || "all"}
                    onValueChange={(value) => {
                      window.location.href = `/category/${value}`;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      {categories
                        .filter((cat, index, self) => 
                          index === self.findIndex(c => c.id === cat.id)
                        )
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                  <div className="text-sm text-neutral-600">
                    Showing <span className="font-medium">{sortedProducts.length}</span> products
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Products Grid */}
                {sortedProducts.length === 0 ? (
                  <div className="text-center py-12 border rounded-lg bg-neutral-50">
                    <p className="text-lg font-medium text-neutral-700">No products found</p>
                    <p className="text-neutral-500 mt-2">Try a different category or search term</p>
                  </div>
                ) : (
                  <ProductGrid products={sortedProducts} />
                )}

                {/* Pagination */}
                <div className="mt-8 flex justify-center">
                  <div className="join">
                    <Button
                      variant="outline"
                      className="join-item"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button variant="outline" className="join-item">
                      Page {page}
                    </Button>
                    <Button
                      variant="outline"
                      className="join-item"
                      disabled={sortedProducts.length < 12}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
