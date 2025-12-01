import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { ordersApi } from '../api';
import { useCartStore } from '../store';
import { useAuthStore } from '../store';
import { toast } from 'sonner';
import { CartItem } from '../types';

export const useCart = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const cartStore = useCartStore();

  // Fetch cart from server if authenticated
  const { data: serverCart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: ordersApi.getCart,
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Sync server cart with local store - use useEffect to avoid setState during render
  useEffect(() => {
    if (serverCart && isAuthenticated) {
      cartStore.setCart(serverCart.items);
    }
  }, [serverCart, isAuthenticated]);

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: ({ bookId, quantity }: { bookId: number; quantity: number }) =>
      isAuthenticated
        ? ordersApi.addToCart(bookId, quantity)
        : Promise.resolve(null),
    onSuccess: (data, variables) => {
      if (data) {
        cartStore.setCart(data.items);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
      toast.success('Đã thêm vào giỏ hàng');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể thêm vào giỏ hàng');
    },
  });

  // Update cart item mutation
  const updateCartMutation = useMutation({
    mutationFn: ({ bookId, quantity }: { bookId: number; quantity: number }) =>
      isAuthenticated
        ? ordersApi.updateCartItem(bookId, quantity)
        : Promise.resolve(null),
    onSuccess: (data) => {
      if (data) {
        cartStore.setCart(data.items);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể cập nhật giỏ hàng');
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: (bookId: number) =>
      isAuthenticated ? ordersApi.removeFromCart(bookId) : Promise.resolve(null),
    onSuccess: (data, bookId) => {
      if (data) {
        cartStore.setCart(data.items);
      } else {
        cartStore.removeItem(bookId);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Đã xóa khỏi giỏ hàng');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể xóa khỏi giỏ hàng');
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: (options?: { silent?: boolean }) => (isAuthenticated ? ordersApi.clearCart() : Promise.resolve()),
    onSuccess: (_, variables) => {
      cartStore.clearCart();
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      // Only show toast if not silent (e.g., after checkout we don't want toast)
      if (!variables?.silent) {
        toast.success('Đã xóa giỏ hàng');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể xóa giỏ hàng');
    },
  });

  // Local cart actions for non-authenticated users
  const addToLocalCart = (item: CartItem) => {
    cartStore.addItem(item);
    toast.success('Đã thêm vào giỏ hàng');
  };

  // Wrapper functions to provide consistent interface
  const handleUpdateQuantity = ({ bookId, quantity }: { bookId: number; quantity: number }) => {
    if (isAuthenticated) {
      updateCartMutation.mutate({ bookId, quantity });
    } else {
      cartStore.updateQuantity(bookId, quantity);
    }
  };

  const handleRemoveFromCart = (bookId: number) => {
    if (isAuthenticated) {
      removeFromCartMutation.mutate(bookId);
    } else {
      cartStore.removeItem(bookId);
    }
  };

  const handleClearCart = (options?: { silent?: boolean }) => {
    if (isAuthenticated) {
      clearCartMutation.mutate(options);
    } else {
      cartStore.clearCart();
      if (!options?.silent) {
        toast.success('Đã xóa giỏ hàng');
      }
    }
  };

  return {
    items: cartStore.items,
    totalItems: cartStore.totalItems,
    totalPrice: cartStore.totalPrice,
    isLoading,
    
    addToCart: isAuthenticated
      ? addToCartMutation.mutate
      : addToLocalCart,
    updateQuantity: handleUpdateQuantity,
    removeFromCart: handleRemoveFromCart,
    clearCart: handleClearCart,
    
    getItem: cartStore.getItem,
  };
};
