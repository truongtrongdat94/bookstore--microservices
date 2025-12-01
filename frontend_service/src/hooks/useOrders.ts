import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api';
import { CheckoutRequest } from '../types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useOrders = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['orders', page, limit],
    queryFn: () => ordersApi.getOrders(page, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useOrder = (orderId: number | undefined) => {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOrder(orderId!),
    enabled: !!orderId,
    staleTime: 1 * 60 * 1000,
  });
};

export const useCheckout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CheckoutRequest) => ordersApi.checkout(data),
    onSuccess: (order) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Đặt hàng thành công!');
      navigate(`/orders/${order.order_id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Đặt hàng thất bại');
    },
  });
};

export const useCancelOrder = (orderId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      toast.success('Đã hủy đơn hàng');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Không thể hủy đơn hàng');
    },
  });
};

export const useShippingAddresses = () => {
  return useQuery({
    queryKey: ['shippingAddresses'],
    queryFn: ordersApi.getShippingAddresses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
