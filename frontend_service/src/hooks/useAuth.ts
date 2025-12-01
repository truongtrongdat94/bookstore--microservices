import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { authApi } from '../api';
import { useAuthStore } from '../store';
import { LoginRequest, RegisterRequest } from '../types';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const hasHandledAuthError = useRef(false);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Đăng nhập thất bại');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success('Đăng ký thành công!');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Đăng ký thất bại');
    },
  });

  // Get profile query - don't run on auth pages to prevent loops
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const { data: profile, isLoading: isLoadingProfile, isError: isProfileError, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated && !isAuthPage, // Don't fetch on auth pages
    staleTime: 5 * 60 * 1000,
    retry: 0, // Don't retry on failure to prevent loops
    refetchOnMount: false, // Don't refetch on mount if data exists
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Handle profile fetch errors - only once to prevent loops
  useEffect(() => {
    if (isProfileError && profileError && !hasHandledAuthError.current) {
      console.error('Failed to fetch profile:', profileError);
      const error = profileError as any;
      
      // If profile fetch fails with 401, clear auth and redirect to login
      if (error.status === 401) {
        hasHandledAuthError.current = true; // Mark as handled
        clearAuth();
        // Only invalidate auth-related queries, not all queries
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        
        // Only navigate if not already on auth page
        if (!isAuthPage) {
          navigate('/login', { replace: true });
          toast.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
        }
      }
    }
    
    // Reset flag when authentication succeeds
    if (isAuthenticated && profile) {
      hasHandledAuthError.current = false;
    }
  }, [isProfileError, profileError, clearAuth, navigate, queryClient, isAuthPage, isAuthenticated, profile]);

  // Logout
  const logout = () => {
    authApi.logout();
    clearAuth();
    queryClient.clear();
    navigate('/login');
    toast.success('Đã đăng xuất');
  };

  return {
    user,
    profile,
    isAuthenticated,
    isLoadingProfile,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
};
