import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';

export const useUserOrders = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['user-orders', page, limit],
    queryFn: () => ordersApi.getMyOrders(page, limit),
  });
};
