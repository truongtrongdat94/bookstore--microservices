import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../hooks';
import { authApi } from '../api/auth';

export function AuthPage() {
  const { login, isLoggingIn } = useAuth();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    firstName: '', 
    lastName: '', 
    phone: '', 
    email: '', 
    password: '' 
  });

  // OTP verification state
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes in seconds
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Countdown timer for OTP
  useEffect(() => {
    if (showOtpVerification && otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showOtpVerification, otpTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    login(loginData);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsRegistering(true);

    try {
      // Convert Vietnamese to ASCII and create username (alphanumeric only)
      const normalizeVietnamese = (str: string) => {
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
          .replace(/đ/g, 'd')
          .replace(/Đ/g, 'D')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric
      };
      
      const username = normalizeVietnamese(`${registerData.firstName}${registerData.lastName}`);
      const full_name = `${registerData.firstName} ${registerData.lastName}`;
      
      const result = await authApi.register({
        username,
        email: registerData.email,
        password: registerData.password,
        full_name,
        phone: registerData.phone
      });

      // Show OTP verification screen
      setOtpEmail(registerData.email);
      setShowOtpVerification(true);
      setOtpTimer(300); // Reset timer
      setMessage({ type: 'success', text: result.message || 'Mã OTP đã được gửi đến email của bạn' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Đăng ký thất bại' });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsVerifying(true);

    try {
      const result = await authApi.verifyOTP(otpEmail, otpCode);
      
      // Save token and user data
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      setMessage({ type: 'success', text: 'Xác thực thành công! Đang chuyển hướng...' });
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Mã OTP không hợp lệ' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setMessage(null);
    setIsResending(true);

    try {
      const result = await authApi.resendOTP(otpEmail);
      setOtpTimer(300); // Reset timer
      setMessage({ type: 'success', text: result.message || 'Mã OTP mới đã được gửi' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Không thể gửi lại mã OTP' });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth endpoint through API Gateway
    // API Gateway will proxy to user-service and preserve OAuth redirects
    window.location.href = '/api/auth/google';
  };



  const benefits = [
    { icon: '🚀', text: 'Vận chuyển siêu tốc' },
    { icon: '📚', text: 'Sản phẩm đa dạng' },
    { icon: '🔄', text: 'Đổi trả dễ dàng' },
    { icon: '💰', text: 'Giảm giá đến 10%' }
  ];

  // OTP Verification Screen
  if (showOtpVerification) {
    return (
      <div className="min-h-[calc(100vh-200px)] py-16">
        <div className="max-w-md mx-auto px-4">
          <Card className="p-8">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-2xl font-semibold mb-2">Xác thực Email</h3>
              <p className="text-gray-600">
                Chúng tôi đã gửi mã OTP 6 chữ số đến email <strong>{otpEmail}</strong>
              </p>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg ${
                message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <Label htmlFor="otp-code">Mã OTP</Label>
                <Input
                  id="otp-code"
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="mt-2 text-center text-2xl tracking-widest"
                  autoFocus
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Mã OTP sẽ hết hạn sau: <strong className="text-[#1B5E20]">{formatTime(otpTimer)}</strong>
                </p>
                {otpTimer === 0 && (
                  <p className="text-sm text-red-600">Mã OTP đã hết hạn. Vui lòng gửi lại.</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#1B5E20] hover:bg-[#0d3d13]"
                disabled={isVerifying || otpCode.length !== 6}
              >
                {isVerifying ? 'Đang xác thực...' : 'Xác thực'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending || otpTimer > 240} // Can resend after 1 minute
                  className="text-sm text-[#1B5E20] hover:underline disabled:text-gray-400 disabled:no-underline"
                >
                  {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowOtpVerification(false);
                    setOtpCode('');
                    setMessage(null);
                  }}
                  className="text-sm text-gray-600 hover:underline"
                >
                  Quay lại đăng ký
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] py-16">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left - Auth Forms */}
          <div>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                <TabsTrigger value="register">Đăng ký</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <Card className="p-8">
                  <h3 className="mb-6">Đăng nhập</h3>

                  {message && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="example@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="login-password">Mật khẩu</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <a href="#" className="text-sm text-[#1B5E20] hover:underline">
                        Quên mật khẩu?
                      </a>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#1B5E20] hover:bg-[#0d3d13]"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>

                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="bg-white px-4 text-gray-500">Hoặc đăng nhập với</span>
                      </div>
                    </div>

                    <Button variant="outline" type="button" onClick={handleGoogleLogin} className="w-full">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Đăng nhập với Google
                    </Button>
                  </form>
                </Card>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <Card className="p-8">
                  <h3 className="mb-6">Đăng ký</h3>

                  {message && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <form className="space-y-6" onSubmit={handleRegister}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first-name">Họ</Label>
                        <Input
                          id="first-name"
                          placeholder="Nguyễn"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last-name">Tên</Label>
                        <Input
                          id="last-name"
                          placeholder="Văn A"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">Số điện thoại</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0123456789"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="example@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="register-password">Mật khẩu</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Tối thiểu 8 ký tự, phải có số và ký tự đặc biệt (!@#$%^&*)
                      </p>
                    </div>

                    <Button 
                      type="submit"
                      className="w-full bg-[#1B5E20] hover:bg-[#0d3d13]"
                      disabled={isRegistering}
                    >
                      {isRegistering ? 'Đang đăng ký...' : 'Đăng ký'}
                    </Button>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right - Benefits */}
          <div className="flex items-center">
            <Card className="w-full bg-gradient-to-br from-[#1B5E20] to-[#2e7d32] text-white p-8">
              <h3 className="text-white mb-6">Lợi ích khi trở thành thành viên</h3>
              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="text-3xl">{benefit.icon}</div>
                    <p className="text-lg text-white">{benefit.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-white/90">
                  Tham gia cộng đồng yêu sách của UIT và nhận được nhiều ưu đãi đặc biệt dành riêng cho thành viên.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
