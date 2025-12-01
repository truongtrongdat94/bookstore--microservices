import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { toast } from 'sonner';
import { CreateAddressDto, UpdateAddressDto } from '../types';

export const useAddresses = () => {
  const queryClient = useQueryClient();

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: usersApi.getAddresses,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAddressDto) => usersApi.createAddress(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Thêm địa chỉ thành công!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Thêm địa chỉ thất bại';
      toast.error(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateAddressDto }) =>
      usersApi.updateAddress(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Cập nhật địa chỉ thành công!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Cập nhật địa chỉ thất bại';
      toast.error(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Xóa địa chỉ thành công!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Xóa địa chỉ thất bại';
      toast.error(message);
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: number) => usersApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Đã đặt làm địa chỉ mặc định!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Thao tác thất bại';
      toast.error(message);
    },
  });

  return {
    addresses,
    isLoading,
    createAddress: createMutation.mutate,
    updateAddress: updateMutation.mutate,
    deleteAddress: deleteMutation.mutate,
    setDefaultAddress: setDefaultMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
