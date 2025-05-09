import React from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ProductCard from "@/components/product/product-card";
import CategoryCard from "@/components/product/category-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, Truck, ArrowLeftRight, HeadphonesIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Category, Product } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function HomePage() {
  const { isAdmin } = useAuth();
  const [, setLocation] = useLocation();
  
  // If user is admin, redirect to admin dashboard
  React.useEffect(() => {
    if (isAdmin) {
      // Redirect admin users to the admin dashboard
      setLocation("/admin");
    }
  }, [isAdmin, setLocation]);
  
  // Fetch categories
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch featured products
  const {
    data: featuredProducts = [],
    isLoading: productsLoading,
    error: productsError,
  } = useQuery<Product[]>({
    queryKey: ["/api/products", { featured: true }],
  });

  const isLoading = categoriesLoading || productsLoading;
  const error = categoriesError || productsError;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="min-h-[90vh] flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
          {/* Background geometric elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[20%] right-[15%] w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          </div>
          
          {/* Subtle animated grid overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxODE4MTgiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBzdHJva2Utb3BhY2l0eT0iLjAyIiBzdHJva2U9IiNmZmYiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMCAzMGgzMHYzMEgweiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIgc3Ryb2tlPSIjZmZmIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTAgMGgzMHYzMEgweiIgc3Ryb2tlLW9wYWNpdHk9Ii4wMiIgc3Ryb2tlPSIjZmZmIiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTMwIDBoMzB2MzBIMzB6IiBzdHJva2Utb3BhY2l0eT0iLjAyIiBzdHJva2U9IiNmZmYiIGZpbGw9Im5vbmUiLz48L2c+PC9zdmc+')]" opacity="0.4"></div>
          
          {/* Gold accent line */}
          <div className="absolute left-0 h-[60%] w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-70"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs tracking-widest uppercase font-light mb-2">
                Premium Collection
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-sf tracking-tighter font-light leading-tight max-w-4xl">
                <span className="block mb-2">Elevate your lifestyle with</span>
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-amber-300">
                  curated luxury
                </span>
              </h1>
              
              <p className="text-muted-foreground text-lg md:text-xl max-w-xl font-light leading-relaxed mt-4">
                Discover our exclusive collection of premium products, crafted for those who appreciate exceptional quality and design.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-5 mt-8 pt-4">
                <Link href="/category/1">
                  <Button className="bg-primary hover:bg-primary/90 text-background px-8 py-6 rounded-none text-sm font-light tracking-wide transition-all duration-300 ease-in-out hover:translate-y-[-2px] shadow-lg hover:shadow-primary/20">
                    SHOP NOW
                  </Button>
                </Link>
                <Link href="/category/all">
                  <Button variant="outline" className="border-border hover:border-primary hover:text-primary px-8 py-6 rounded-none text-sm font-light tracking-wide transition-all duration-300 ease-in-out">
                    EXPLORE COLLECTION
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Animated scroll indicator */}
          <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce opacity-50">
            <div className="w-[1px] h-6 bg-primary/60"></div>
            <div className="w-2 h-2 border-r border-b border-primary/60 transform rotate-45 mt-1"></div>
          </div>
        </section>

        {/* Beauty Section */}
        <section className="py-16 bg-background relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-sf tracking-tighter mb-4">
                Beauty <span className="text-primary">Collection</span>
              </h2>
              <div className="w-20 h-[1px] bg-primary/30 my-4"></div>
              <p className="text-muted-foreground max-w-xl font-light">
                Discover our premium beauty and skincare products
              </p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts
                  .filter(product => product.categoryId === 4)
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            )}
          </div>
        </section>

        {/* Sports Section */}
        <section className="py-16 bg-background/50 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-sf tracking-tighter mb-4">
                Sports <span className="text-primary">Equipment</span>
              </h2>
              <div className="w-20 h-[1px] bg-primary/30 my-4"></div>
              <p className="text-muted-foreground max-w-xl font-light">
                High-quality sports gear for your active lifestyle
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts
                .filter(product => product.categoryId === 5)
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        </section>

        {/* Books Section */}
        <section className="py-16 bg-background relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-sf tracking-tighter mb-4">
                Books & <span className="text-primary">Literature</span>
              </h2>
              <div className="w-20 h-[1px] bg-primary/30 my-4"></div>
              <p className="text-muted-foreground max-w-xl font-light">
                Explore our collection of bestselling books
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts
                .filter(product => product.categoryId === 6)
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        </section>

        {/* Home & Garden Section */}
        <section className="py-16 bg-background/50 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-sf tracking-tighter mb-4">
                Home & <span className="text-primary">Garden</span>
              </h2>
              <div className="w-20 h-[1px] bg-primary/30 my-4"></div>
              <p className="text-muted-foreground max-w-xl font-light">
                Everything you need for your home and garden
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts
                .filter(product => product.categoryId === 7)
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-background relative">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5 pattern-grid-lg"></div>
          
          {/* Gold accent line */}
          <div className="absolute right-0 h-[40%] w-[1px] bg-gradient-to-b from-transparent via-primary to-transparent opacity-70"></div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs tracking-widest uppercase font-light mb-4">
                Curated Collections
              </div>
              <h2 className="text-3xl md:text-4xl font-sf tracking-tighter mb-4 max-w-2xl">
                Discover our <span className="text-primary">premium</span> categories
              </h2>
              <div className="w-20 h-[1px] bg-primary/30 my-5"></div>
              <p className="text-muted-foreground max-w-xl font-light">
                Explore our carefully curated categories, each featuring exceptional quality and design
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="relative">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="absolute inset-0 animate-ping opacity-30 bg-primary rounded-full blur-sm"></div>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-destructive">
                <p>Failed to load categories. Please try again later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                {/* Beauty */}
                <CategoryCard 
                  key="4"
                  category={{
                    id: 4,
                    name: "Beauty",
                    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348"
                  }}
                />
                
                {/* Sports */}
                <CategoryCard 
                  key="5"
                  category={{
                    id: 5,
                    name: "Sports",
                    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b"
                  }}
                />
                
                {/* Books */}
                <CategoryCard 
                  key="6"
                  category={{
                    id: 6,
                    name: "Books",
                    imageUrl: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d"
                  }}
                />
                
                {/* Home & Garden */}
                <CategoryCard 
                  key="7"
                  category={{
                    id: 7,
                    name: "Home & Garden",
                    imageUrl: "https://images.unsplash.com/photo-1599643532164-a6e4266e9c51"
                  }}
                />
                
                {/* Display rest of the categories */}
                {Array.from(
                  new Map(categories.map(cat => [cat.name, cat])).values()
                ).map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>
        </section>

        

        {/* Banner */}
        <section className="py-12 bg-neutral-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary rounded-xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="text-primary-200 text-sm font-medium tracking-widest uppercase mb-3">
                    Special Offer
                  </span>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                    Get 20% Off on Your First Order
                  </h2>
                  <p className="text-primary-100 mb-6 max-w-md">
                    Sign up for our newsletter and get an exclusive 20% discount code for your first purchase.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md">
                    <Input 
                      type="email" 
                      placeholder="Enter your email" 
                      className="flex-grow rounded-lg px-4 py-3 border-none focus:ring-2 focus:ring-primary-300"
                    />
                    <Button className="bg-secondary text-white hover:bg-secondary-600 whitespace-nowrap">
                      Subscribe
                    </Button>
                  </div>
                </div>
                <div className="hidden lg:block relative min-h-[320px]">
                  {/* Image placeholder - we'll use a gradient as fallback */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-700"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 text-primary p-3 rounded-lg">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Free & Fast Shipping</h3>
                  <p className="text-neutral-600">
                    Free shipping on all orders over $50, delivered within 3-5 business days.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 text-primary p-3 rounded-lg">
                  <ArrowLeftRight className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">Easy Returns</h3>
                  <p className="text-neutral-600">
                    30-day return policy for a full refund or exchange with no questions asked.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 text-primary p-3 rounded-lg">
                  <HeadphonesIcon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg mb-1">24/7 Customer Support</h3>
                  <p className="text-neutral-600">
                    Our friendly team is here to help with any questions or concerns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
