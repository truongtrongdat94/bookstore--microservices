import { useMutation } from '@tanstack/react-query';
import { usersApi } from '../api/users';
import { toast } from 'sonner';
import { ChangePasswordDto } from '../types';

export const useProfile = () => {
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordDto) => usersApi.changePassword(data),
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message || 'Đổi mật khẩu thất bại';
      toast.error(message);
    },
  });

  return {
    changePassword: changePasswordMutation.mutate,
    isChangingPassword: changePasswordMutation.isPending,
  };
};
