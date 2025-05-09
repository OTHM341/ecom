import { createContext, ReactNode, useContext, useCallback, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Product, CartItem } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

type CartContextType = {
  cartItems: CartItemWithProduct[];
  isLoading: boolean;
  error: Error | null;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const {
    data: cartItems = [],
    error,
    isLoading,
    refetch: refetchCart,
  } = useQuery<CartItemWithProduct[], Error>({
    queryKey: ["/api/cart"],
    enabled: !!user, // Only fetch if user is logged in
    // Will return 401 if user is not authenticated
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await apiRequest("POST", "/api/cart", { productId, quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const res = await apiRequest("PUT", `/api/cart/${itemId}`, { quantity });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart updated",
        description: "Item quantity has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest("DELETE", `/api/cart/${itemId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      // Loop through all items and remove them
      for (const item of cartItems) {
        await apiRequest("DELETE", `/api/cart/${item.id}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to clear cart",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCart = useCallback(
    async (productId: number, quantity: number) => {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please login to add items to your cart.",
          variant: "destructive",
        });
        return;
      }
      await addToCartMutation.mutateAsync({ productId, quantity });
    },
    [user, addToCartMutation, toast]
  );

  const updateCartItem = useCallback(
    async (itemId: number, quantity: number) => {
      await updateCartItemMutation.mutateAsync({ itemId, quantity });
    },
    [updateCartItemMutation]
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      await removeFromCartMutation.mutateAsync(itemId);
    },
    [removeFromCartMutation]
  );

  const clearCart = useCallback(async () => {
    await clearCartMutation.mutateAsync();
  }, [clearCartMutation]);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  // Calculate total items and subtotal
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subTotal = cartItems.reduce(
    (total, item) => total + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        error,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        totalItems,
        subTotal,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
