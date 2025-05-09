import { CartItem as CartItemType, Product } from "@shared/schema";
import { 
  MinusCircle, 
  PlusCircle, 
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";

interface CartItemProps {
  item: CartItemType & { product: Product };
  inDropdown?: boolean;
}

const CartItem = ({ item, inDropdown = false }: CartItemProps) => {
  const { updateCartItem, removeFromCart } = useCart();
  
  const handleIncreaseQuantity = async () => {
    await updateCartItem(item.id, item.quantity + 1);
  };
  
  const handleDecreaseQuantity = async () => {
    if (item.quantity > 1) {
      await updateCartItem(item.id, item.quantity - 1);
    } else {
      await removeFromCart(item.id);
    }
  };
  
  const handleRemove = async () => {
    await removeFromCart(item.id);
  };
  
  // Calculate item total
  const itemTotal = Number(item.product.price) * item.quantity;
  
  // For dropdown view - simplified version
  if (inDropdown) {
    return (
      <div className="flex items-center px-4 py-3 hover:bg-neutral-50">
        <Link href={`/product/${item.product.id}`}>
          <img 
            src={item.product.imageUrl} 
            alt={item.product.name}
            className="w-16 h-16 object-cover rounded"
          />
        </Link>
        <div className="ml-3 flex-1">
          <Link href={`/product/${item.product.id}`}>
            <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
          </Link>
          <p className="text-xs text-neutral-500">{item.quantity} × ${Number(item.product.price).toFixed(2)}</p>
        </div>
        <button 
          className="text-neutral-400 hover:text-secondary"
          onClick={handleRemove}
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }
  
  // For cart page view - full version
  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Link href={`/product/${item.product.id}`} className="flex-shrink-0">
            <img 
              src={item.product.imageUrl} 
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded"
            />
          </Link>
          <div className="ml-4">
            <Link href={`/product/${item.product.id}`}>
              <h3 className="text-sm font-medium text-neutral-900">{item.product.name}</h3>
            </Link>
            <p className="text-sm text-neutral-500 mt-1">${Number(item.product.price).toFixed(2)}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDecreaseQuantity}
            className="h-8 w-8 rounded-full"
            aria-label="Decrease quantity"
          >
            <MinusCircle className="h-5 w-5" />
          </Button>
          <span className="text-neutral-900 w-8 text-center">{item.quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleIncreaseQuantity}
            className="h-8 w-8 rounded-full"
            aria-label="Increase quantity"
          >
            <PlusCircle className="h-5 w-5" />
          </Button>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end space-x-4">
          <span className="text-neutral-900 font-medium">${itemTotal.toFixed(2)}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8 text-neutral-400 hover:text-secondary"
            aria-label="Remove item"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default CartItem;
