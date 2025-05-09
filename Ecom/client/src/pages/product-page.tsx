import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Product } from "@shared/schema";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star,
  StarHalf,
  Truck,
  ArrowLeftRight,
  ShieldCheck,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Loader2,
} from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const productId = params ? parseInt(params.id) : 0;
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Fetch product data
  const {
    data: product,
    isLoading,
    error,
  } = useQuery<Product>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
  });

  const handleDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrementQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
          <p className="mb-4">We couldn't find the product you're looking for.</p>
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Function to render product rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-amber-400 text-amber-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-amber-400 text-amber-400" />);
    }

    // Add empty stars to make total of 5
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="text-amber-400" />);
    }

    return stars;
  };

  const imageUrls = product.imageUrls || [product.imageUrl];
  const activeImage = imageUrls[activeImageIndex] || product.imageUrl;
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((Number(product.compareAtPrice) - Number(product.price)) / Number(product.compareAtPrice)) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              
              {imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {imageUrls.map((url, index) => (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg overflow-hidden bg-neutral-100 cursor-pointer ${
                        index === activeImageIndex ? "border-2 border-primary" : "border border-neutral-200"
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={url}
                        alt={`${product.name} - View ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center mb-2">
                  <div className="flex text-amber-400 mr-2">
                    {renderRatingStars(Number(product.rating))}
                  </div>
                  <span className="text-neutral-600">
                    {product.reviewCount} Reviews
                  </span>
                </div>
                <h1 className="text-3xl font-display font-bold text-neutral-900">{product.name}</h1>
                <p className="text-neutral-500 mt-2">Product ID: {product.id}</p>
              </div>

              <div className="flex items-center">
                <span className="text-3xl font-semibold text-neutral-900 mr-3">${Number(product.price).toFixed(2)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-neutral-500 line-through">${Number(product.compareAtPrice).toFixed(2)}</span>
                    <span className="ml-2 bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-neutral-700">
                  Availability:{" "}
                  {product.inventory > 0 ? (
                    <span className="text-green-600 font-medium">In Stock</span>
                  ) : (
                    <span className="text-red-600 font-medium">Out of Stock</span>
                  )}
                </p>
                <p className="text-neutral-700">
                  Shipping: <span className="font-medium">Free shipping</span>
                </p>
              </div>

              <div className="border-t border-b border-neutral-200 py-6 space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Quantity</h3>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleDecrementQuantity}
                      disabled={quantity <= 1}
                      className="h-10 w-10 rounded-l-lg border-neutral-300"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      min="1"
                      className="h-10 w-16 border-y border-l-0 border-r-0 border-neutral-300 text-center rounded-none focus:ring-0"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleIncrementQuantity}
                      className="h-10 w-10 rounded-r-lg border-neutral-300"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.inventory <= 0}
                  className="w-full bg-primary hover:bg-primary-600 text-white"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-primary text-primary hover:bg-primary-50"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Add to Wishlist
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-neutral-600">
                  <Truck className="h-5 w-5 mr-2" />
                  <span>Fast delivery in 2-5 business days</span>
                </div>
                <div className="flex items-center text-neutral-600">
                  <ArrowLeftRight className="h-5 w-5 mr-2" />
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center text-neutral-600">
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  <span>2-year warranty included</span>
                </div>
              </div>

              <div className="pt-4">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-neutral-600">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
