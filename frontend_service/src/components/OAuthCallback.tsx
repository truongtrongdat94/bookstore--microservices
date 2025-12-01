import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from './ui/card';
import { useAuthStore } from '../store';
import { authApi } from '../api';
import { toast } from 'sonner';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }

      if (token) {
        try {
          // Save token to localStorage first
          localStorage.setItem('auth_token', token);
          
          // Fetch user profile with the new token
          const profile = await authApi.getProfile();
          
          // Update auth store with user and token
          setAuth(profile, token);
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['profile'] });
          
          toast.success('Đăng nhập thành công!');
          
          // Redirect to home page
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500);
        } catch (err: any) {
          console.error('Failed to fetch profile:', err);
          setError('Không thể lấy thông tin người dùng');
          localStorage.removeItem('auth_token');
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } else {
        setError('Không nhận được token xác thực');
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    processOAuthCallback();
  }, [searchParams, navigate, setAuth, queryClient]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16">
      <div className="max-w-md mx-auto px-4">
        <Card className="p-8 text-center">
          {error ? (
            <>
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold mb-2">Đăng nhập thất bại</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">Đang chuyển hướng về trang đăng nhập...</p>
            </>
          ) : isProcessing ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B5E20]"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Đang xử lý...</h3>
              <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
            </>
          ) : (
            <>
              <div className="text-green-500 text-5xl mb-4">✓</div>
              <h3 className="text-xl font-semibold mb-2">Đăng nhập thành công!</h3>
              <p className="text-gray-600 mb-4">Đang chuyển hướng về trang chủ...</p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B5E20]"></div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
