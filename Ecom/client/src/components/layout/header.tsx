import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import CartDropdown from "@/components/cart/cart-dropdown";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search, User, Heart, ShoppingCart, Menu, ShoppingBag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [location] = useLocation();
  const { user, isAdmin, logoutMutation } = useAuth();
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to search results page
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Navigation categories
  const categories = [
    { id: "home", name: "Home", href: "/" },
    { id: "electronics", name: "Electronics", href: "/category/1" },
    { id: "clothing", name: "Clothing", href: "/category/2" },
    { id: "home-kitchen", name: "Home & Kitchen", href: "/category/3" },
    { id: "beauty", name: "Beauty", href: "/category/4" },
    { id: "sports", name: "Sports", href: "/category/5" },
    { id: "books", name: "Books", href: "/category/6" },
    { id: "home", name: "Home", href: "/category/7" }
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-foreground font-sf text-2xl flex items-center gold-shimmer">
              <ShoppingBag className="h-7 w-7 mr-2 text-primary" />
              <span className="font-sf tracking-tighter">O&N<span className="text-primary font-black"> Shop</span></span>
            </Link>
          </div>

          {/* Search - Desktop */}
          <div className="hidden md:block flex-1 mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input 
                type="text" 
                placeholder="SEARCH"
                className="w-full pl-10 pr-4 py-2 rounded-none bg-muted/30 border-0 border-b-2 border-muted focus:outline-none focus:ring-0 focus:border-primary text-foreground placeholder:text-muted-foreground/70 placeholder:tracking-widest placeholder:text-xs placeholder:font-light"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground/70" />
              </div>
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-5">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="text-foreground hover:text-primary transition-colors duration-200 p-2 mr-1 relative group">
                    <div className="absolute -top-1 -right-1 bg-primary text-background rounded-full w-2 h-2"></div>
                    <span className="hidden sm:inline-block text-sm font-light tracking-wide mr-1">ADMIN</span>
                  </Link>
                )}
                <Link href="/account" className="text-foreground hover:text-primary transition-colors duration-200 p-2">
                  <User className="h-5 w-5" />
                </Link>
                <button 
                  onClick={handleLogout}
                  className="hidden sm:block text-foreground hover:text-primary transition-colors duration-200 text-xs font-light tracking-wide ml-4 uppercase"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="hidden sm:flex items-center space-x-6">
                <Link href="/login" className="text-foreground hover:text-primary transition-colors duration-200 text-xs tracking-wide uppercase font-light">
                  Login
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="outline" className="text-xs tracking-wide uppercase font-light bg-transparent border-primary text-primary hover:bg-primary hover:text-background transition-all duration-300">
                    Join
                  </Button>
                </Link>
              </div>
            )}
            <Link href="/wishlist" className="text-foreground hover:text-primary transition-colors duration-200 p-2">
              <Heart className="h-5 w-5" />
            </Link>

            {/* Shopping Cart */}
            <div className="relative">
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)} 
                className="text-foreground hover:text-primary transition-colors duration-200 p-2 relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-background rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {totalItems}
                  </span>
                )}
              </button>
              
              {/* Cart Dropdown */}
              {isCartOpen && <CartDropdown onClose={() => setIsCartOpen(false)} />}
            </div>

            {/* Mobile menu button */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden text-foreground hover:text-primary transition-colors duration-200 p-2">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-border">
                <SheetHeader>
                  <SheetTitle className="text-left font-sf tracking-tight">O&N<span className="text-primary"> Shop</span></SheetTitle>
                </SheetHeader>
                <div className="mt-10 space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-xs font-light tracking-wider text-muted-foreground uppercase">Navigate</h3>
                    <ul className="space-y-3">
                      {categories.map((category) => (
                        <li key={category.id}>
                          <Link 
                            href={category.href}
                            className={`block py-2 hover:text-primary transition-colors duration-200 uppercase text-xs tracking-wider ${
                              location === category.href ? "text-primary font-medium" : "text-foreground/90 font-light"
                            }`}
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-light tracking-wider text-muted-foreground uppercase">Account</h3>
                    <ul className="space-y-3">
                      {!user ? (
                        <li>
                          <div className="space-y-3">
                            <Link 
                              href="/login" 
                              className="block py-2 text-foreground/90 hover:text-primary transition-colors duration-200 uppercase text-xs tracking-wider font-light"
                            >
                              Login
                            </Link>
                            <Link 
                              href="/register" 
                              className="block py-2 text-foreground/90 hover:text-primary transition-colors duration-200 uppercase text-xs tracking-wider font-light"
                            >
                              Join
                            </Link>
                          </div>
                        </li>
                      ) : (
                        <>
                          <li>
                            <Link 
                              href="/account" 
                              className="block py-2 text-foreground/90 hover:text-primary transition-colors duration-200 uppercase text-xs tracking-wider font-light"
                            >
                              My Account
                            </Link>
                          </li>
                          <li>
                            <Link 
                              href="/orders" 
                              className="block py-2 text-foreground/90 hover:text-primary transition-colors duration-200 uppercase text-xs tracking-wider font-light"
                            >
                              My Orders
                            </Link>
                          </li>
                          {isAdmin && (
                            <li>
                              <Link 
                                href="/admin" 
                                className="block py-2 text-foreground/90 hover:text-primary transition-colors duration-200 uppercase text-xs tracking-wider font-light"
                              >
                                Admin
                              </Link>
                            </li>
                          )}
                          <li>
                            <button 
                              onClick={handleLogout}
                              className="block py-2 text-foreground/90 hover:text-primary transition-colors duration-200 uppercase text-xs tracking-wider font-light w-full text-left"
                            >
                              Logout
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input 
              type="text" 
              placeholder="SEARCH"
              className="w-full pl-10 pr-4 py-2 rounded-none bg-muted/30 border-0 border-b-2 border-muted focus:outline-none focus:ring-0 focus:border-primary text-foreground placeholder:text-muted-foreground/70 placeholder:tracking-widest placeholder:text-xs placeholder:font-light"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground/70" />
            </div>
          </form>
        </div>
      </div>

      {/* Categories navigation - Desktop */}
      <div className="bg-background/50 backdrop-blur-md border-t border-border py-3 hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center space-x-8 overflow-x-auto justify-center">
            {categories.map((category) => (
              <li key={category.id}>
                <Link 
                  href={category.href}
                  className={`text-xs font-light uppercase tracking-wider whitespace-nowrap hover:text-primary transition-colors duration-200 ${
                    location === category.href ? "text-primary" : "text-foreground/80"
                  }`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
