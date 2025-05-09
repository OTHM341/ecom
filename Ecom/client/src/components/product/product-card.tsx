import { useState } from "react";
import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  StarHalf, 
  Heart, 
  ShoppingCart, 
  Eye
} from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const {
    id,
    name,
    price,
    compareAtPrice,
    imageUrl,
    rating,
    reviewCount,
    isNew,
    isBestSeller,
    inventory
  } = product;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToCart(id, 1);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Navigate to product detail page
    window.location.href = `/product/${id}`;
  };

  // Calculate discount percentage if there's a compareAtPrice
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((Number(compareAtPrice) - Number(price)) / Number(compareAtPrice)) * 100)
    : 0;

  // Render rating stars
  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-amber-400 text-amber-400" />);
    }

    // Add empty stars to make total of 5
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-amber-400" />);
    }

    return stars;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden product-card group fade-up"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${id}`}>
        <div className="relative">
          <div className="aspect-square overflow-hidden">
            <img 
              src={imageUrl}
              alt={name} 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          </div>

          {/* Product badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <span className="bg-secondary text-white text-xs font-medium px-2 py-1 rounded-md">
                New
              </span>
            )}
            {isBestSeller && (
              <span className="bg-neutral-800 text-white text-xs font-medium px-2 py-1 rounded-md">
                Best Seller
              </span>
            )}
            {hasDiscount && (
              <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-md">
                {discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <div className="absolute top-3 right-3">
            <Button 
              variant="secondary" 
              size="icon" 
              className="bg-white rounded-full p-2 shadow-sm hover:bg-primary-50 transition h-8 w-8"
              onClick={(e) => e.preventDefault()}
            >
              <Heart className="h-4 w-4 text-neutral-600" />
            </Button>
          </div>

          {/* Quick view button */}
          <div className="absolute inset-x-0 bottom-0 quick-view">
            <Button 
              className="bg-primary text-white font-medium w-full py-2.5 transition hover:bg-primary-600 rounded-none"
              onClick={handleQuickView}
            >
              <Eye className="mr-2 h-4 w-4" />
              Quick View
            </Button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{name}</h3>

          {/* Ratings */}
          <div className="flex items-center mb-1">
            <div className="flex">
              {renderRatingStars(Number(rating))}
            </div>
            <span className="text-xs text-neutral-500 ml-1">
              ({reviewCount})
            </span>
          </div>

          {/* Pricing and cart button */}
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-neutral-900">${Number(price).toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-sm text-neutral-500 line-through ml-2">
                  ${Number(compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="bg-neutral-100 hover:bg-neutral-200 transition rounded-full h-9 w-9"
              disabled={inventory <= 0}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4 text-primary" />
            </Button>
          </div>

          {/* Out of stock notice */}
          {inventory <= 0 && (
            <p className="text-destructive text-sm mt-2">Out of stock</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;