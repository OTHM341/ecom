import { Link } from "wouter";
import { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const { id, name, imageUrl } = category;

  // Get default image based on category name if no image provided
  const getCategoryImage = (categoryName: string) => {
    // Default high-quality images for categories
    const defaultImages: Record<string, string> = {
      'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'Clothing': 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
      'Home & Kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
      'Sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'Books & Media': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'Home & Garden': 'https://images.unsplash.com/photo-1599643532164-a6e4266e9c51?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    };
    
    return defaultImages[categoryName] || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80';
  };

  // Use the provided imageUrl or get a default one based on category name
  const displayImageUrl = imageUrl || getCategoryImage(name);

  return (
    <Link href={`/category/${id}`} className="group">
      <div className="relative overflow-hidden bg-muted/40 border border-border transition-all duration-500 group-hover:border-primary/30">
        <div className="aspect-[5/6] relative">
          <img 
            src={displayImageUrl}
            alt={name} 
            className="w-full h-full object-cover opacity-90 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
            onError={(e) => {
              // If image fails to load, use default image
              (e.target as HTMLImageElement).src = getCategoryImage(name);
            }}
          />
          
          {/* Gold accent line top */}
          <div className="absolute top-0 left-0 w-0 h-[1px] bg-primary/80 z-10 transition-all duration-500 group-hover:w-full"></div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent transition-opacity duration-500 group-hover:opacity-80"></div>
          
          {/* Content */}
          <div className="absolute inset-x-0 bottom-0 p-4 text-foreground flex flex-col items-center">
            <h3 className="font-sf text-base tracking-wide uppercase font-light">{name}</h3>
            <div className="w-8 h-[1px] bg-primary mt-2 mb-1 transition-all duration-500 group-hover:w-16"></div>
            <span className="text-xs text-muted-foreground font-light tracking-wider opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
              View Collection
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
