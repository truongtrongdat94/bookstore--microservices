import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { useAuth, useProfile, useAddresses, useUserOrders } from '../hooks';
import { Address, CreateAddressDto } from '../types';
import { toast } from 'sonner';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

type ProfileTab = 'info' | 'orders' | 'password' | 'addresses';

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, isLoadingProfile, logout } = useAuth();
  const { changePassword, isChangingPassword } = useProfile();
  const { 
    addresses, 
    isLoading: isLoadingAddresses, 
    createAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress,
    isCreating,
    isUpdating,
    isDeleting
  } = useAddresses();
  const { data: ordersData, isLoading: isLoadingOrders } = useUserOrders(1, 10);

  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState<CreateAddressDto>({
    name: '',
    phone: '',
    company: '',
    address: '',
    country: 'Vietnam',
    province: '',
    district: '',
    ward: '',
    zip_code: '',
    is_default: false
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoadingProfile) {
      navigate('/login');
      toast.error('Vui lòng đăng nhập để truy cập trang này');
    }
  }, [isAuthenticated, isLoadingProfile, navigate]);

  // Don't render if not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  const userData = {
    name: profile?.full_name || user.full_name || user.username,
    email: user.email,
    phone: profile?.phone || user.phone
  };

  const validatePassword = (): boolean => {
    const errors: string[] = [];
    
    if (passwordData.newPassword.length < 8) {
      errors.push('Mật khẩu mới phải có ít nhất 8 ký tự');
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('Mật khẩu xác nhận không khớp');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }
    
    changePassword({
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    }, {
      onSuccess: () => {
        // Clear form after success
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors([]);
      }
    });
  };

  const handleAddressDialogOpen = (address?: Address) => {
    if (address) {
      // Edit mode
      setEditingAddress(address);
      setAddressFormData({
        name: address.name,
        phone: address.phone,
        company: address.company || '',
        address: address.address,
        country: address.country,
        province: address.province,
        district: address.district,
        ward: address.ward,
        zip_code: address.zip_code || '',
        is_default: address.is_default
      });
    } else {
      // Add mode
      setEditingAddress(null);
      setAddressFormData({
        name: '',
        phone: '',
        company: '',
        address: '',
        country: 'Vietnam',
        province: '',
        district: '',
        ward: '',
        zip_code: '',
        is_default: false
      });
    }
    setAddressDialogOpen(true);
  };

  const handleSaveAddress = () => {
    // Validate required fields
    if (!addressFormData.name || !addressFormData.phone || !addressFormData.address || 
        !addressFormData.province || !addressFormData.district || !addressFormData.ward) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (editingAddress) {
      // Update existing address
      updateAddress({
        id: editingAddress.address_id,
        data: addressFormData
      }, {
        onSuccess: () => {
          setAddressDialogOpen(false);
        }
      });
    } else {
      // Create new address
      createAddress(addressFormData, {
        onSuccess: () => {
          setAddressDialogOpen(false);
        }
      });
    }
  };

  const handleDeleteAddress = (addressId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      deleteAddress(addressId);
    }
  };

  const handleSetDefaultAddress = (addressId: number) => {
    setDefaultAddress(addressId);
  };

  const handleLogout = () => {
    logout();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đang giao',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
      'paid': 'Đã thanh toán',
      'failed': 'Thất bại'
    };
    return statusMap[status] || status;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">THÔNG TIN TÀI KHOẢN</h2>
            {isLoadingProfile ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-40"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 mb-1">Họ tên:</p>
                  <p>{userData.name}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email:</p>
                  <p>{userData.email}</p>
                </div>
                {userData.phone && (
                  <div>
                    <p className="text-gray-600 mb-1">Số điện thoại:</p>
                    <p>{userData.phone}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'orders':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">ĐƠN HÀNG CỦA BẠN</h2>
            {isLoadingOrders ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="bg-[#1B5E20] text-white">
                      <th className="w-[15%] px-4 py-4 text-left font-semibold">Đơn hàng</th>
                      <th className="w-[12%] px-4 py-4 text-left font-semibold">Ngày</th>
                      <th className="w-[28%] px-4 py-4 text-left font-semibold">Địa chỉ</th>
                      <th className="w-[20%] px-4 py-4 text-left font-semibold">Giá trị đơn hàng</th>
                      <th className="w-[25%] px-4 py-4 text-left font-semibold">TT thanh toán</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {!ordersData?.items || ordersData.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          Không có đơn hàng nào.
                        </td>
                      </tr>
                    ) : (
                      ordersData.items.map((order) => (
                        <tr key={order.order_id} className="border-t border-gray-100">
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-900">#{order.order_number || order.order_id}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              {order.items?.length || 0} sản phẩm
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-700">{formatDate(order.created_at)}</td>
                          <td className="px-4 py-4 text-gray-700 truncate">
                            {typeof order.shipping_address === 'string' 
                              ? order.shipping_address 
                              : JSON.stringify(order.shipping_address)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-900">{formatCurrency(order.total_amount)}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                              order.payment_status === 'paid' 
                                ? 'bg-green-100 text-green-700' 
                                : order.payment_status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {getStatusText(order.payment_status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'password':
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">ĐỔI MẬT KHẨU</h2>
            <p className="text-gray-600 mb-6">
              Để đảm bảo tính bảo mật bạn vui lòng đặt lại mật khẩu với ít nhất 8 kí tự
            </p>
            <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
              {passwordErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  <ul className="list-disc list-inside">
                    {passwordErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <Label htmlFor="oldPassword">Mật khẩu cũ *</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                  required
                  disabled={isChangingPassword}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Mật khẩu mới *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  disabled={isChangingPassword}
                  className="mt-2"
                  minLength={8}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Xác nhận lại mật khẩu *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  disabled={isChangingPassword}
                  className="mt-2"
                />
              </div>
              <Button 
                type="submit"
                className="bg-[#1B5E20] hover:bg-[#0d3d13]"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Đang xử lý...' : 'Đổi lại mật khẩu'}
              </Button>
            </form>
          </div>
        );

      case 'addresses':
        return (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">ĐỊA CHỈ CỦA BẠN</h2>
              <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-[#1B5E20] hover:bg-[#0d3d13] text-white px-6 py-2"
                    onClick={() => handleAddressDialogOpen()}
                  >
                    Thêm địa chỉ
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAddress ? 'CHỈNH SỬA ĐỊA CHỈ' : 'THÊM ĐỊA CHỈ MỚI'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Họ tên *</Label>
                      <Input
                        id="name"
                        value={addressFormData.name}
                        onChange={(e) => setAddressFormData({...addressFormData, name: e.target.value})}
                        placeholder="Trương Trọng"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        value={addressFormData.phone}
                        onChange={(e) => setAddressFormData({...addressFormData, phone: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Công ty</Label>
                      <Input
                        id="company"
                        value={addressFormData.company}
                        onChange={(e) => setAddressFormData({...addressFormData, company: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Địa chỉ *</Label>
                      <Input
                        id="address"
                        value={addressFormData.address}
                        onChange={(e) => setAddressFormData({...addressFormData, address: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">Quốc gia *</Label>
                      <Select 
                        value={addressFormData.country} 
                        onValueChange={(value: string) => setAddressFormData({...addressFormData, country: value})}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vietnam">Vietnam</SelectItem>
                          <SelectItem value="USA">USA</SelectItem>
                          <SelectItem value="Japan">Japan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="province">Tỉnh thành *</Label>
                        <Select 
                          value={addressFormData.province} 
                          onValueChange={(value: string) => setAddressFormData({...addressFormData, province: value})}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Chọn tỉnh" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Hà Nội">Hà Nội</SelectItem>
                            <SelectItem value="Hồ Chí Minh">Hồ Chí Minh</SelectItem>
                            <SelectItem value="Đà Nẵng">Đà Nẵng</SelectItem>
                            <SelectItem value="Điện Biên">Điện Biên</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="district">Quận huyện *</Label>
                        <Select 
                          value={addressFormData.district} 
                          onValueChange={(value: string) => setAddressFormData({...addressFormData, district: value})}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Chọn quận" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Quận 1">Quận 1</SelectItem>
                            <SelectItem value="Quận 2">Quận 2</SelectItem>
                            <SelectItem value="Điện Biên Phủ">Điện Biên Phủ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="ward">Phường xã *</Label>
                        <Select 
                          value={addressFormData.ward} 
                          onValueChange={(value: string) => setAddressFormData({...addressFormData, ward: value})}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Chọn phường" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Phường 1">Phường 1</SelectItem>
                            <SelectItem value="Phường 2">Phường 2</SelectItem>
                            <SelectItem value="Pô Khoang">Pô Khoang</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Mã Zip</Label>
                      <Input
                        id="zipCode"
                        value={addressFormData.zip_code}
                        onChange={(e) => setAddressFormData({...addressFormData, zip_code: e.target.value})}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="isDefault"
                        checked={addressFormData.is_default}
                        onCheckedChange={(checked: boolean) => setAddressFormData({...addressFormData, is_default: checked})}
                      />
                      <Label htmlFor="isDefault" className="cursor-pointer">
                        Đặt là địa chỉ mặc định?
                      </Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddressDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button 
                      className="bg-[#1B5E20] hover:bg-[#0d3d13]" 
                      onClick={handleSaveAddress}
                      disabled={isCreating || isUpdating}
                    >
                      {isCreating || isUpdating ? 'Đang xử lý...' : (editingAddress ? 'Cập nhật' : 'Thêm địa chỉ')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            {isLoadingAddresses ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Chưa có địa chỉ nào được lưu.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <Card key={address.address_id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start gap-6">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <p className="text-gray-900 font-semibold text-lg">{address.name}</p>
                          {address.is_default && (
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                              Địa chỉ mặc định
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-gray-700">
                          <p className="leading-relaxed">
                            <span className="font-medium">Địa chỉ:</span> {address.address}, {address.ward}, {address.district}, {address.province}, {address.country}
                          </p>
                          <p>
                            <span className="font-medium">Số điện thoại:</span> {address.phone}
                          </p>
                          {address.company && (
                            <p>
                              <span className="font-medium">Công ty:</span> {address.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3 min-w-[120px]">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-[#1B5E20] border-[#1B5E20] hover:bg-[#1B5E20] hover:text-white w-full"
                          onClick={() => handleAddressDialogOpen(address)}
                        >
                          Chỉnh sửa
                        </Button>
                        {!address.is_default && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white w-full"
                            onClick={() => handleSetDefaultAddress(address.address_id)}
                            disabled={isUpdating}
                          >
                            Đặt làm mặc định
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white w-full"
                          onClick={() => handleDeleteAddress(address.address_id)}
                          disabled={isDeleting}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => onNavigate('home')} className="hover:text-[#1B5E20]">
              Trang chủ
            </button>
            <span>›</span>
            <span className="text-[#1B5E20]">Tài khoản</span>
            <span>›</span>
            <span className="text-gray-900">
              {activeTab === 'info' && 'Thông tin tài khoản'}
              {activeTab === 'orders' && 'Đơn hàng'}
              {activeTab === 'password' && 'Đổi mật khẩu'}
              {activeTab === 'addresses' && 'Sổ địa chỉ'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-[200px] flex-shrink-0">
            <Card className="p-4">
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-1">Xin chào,</p>
                <p className="text-[#1B5E20]">{userData.name}!</p>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    activeTab === 'info' 
                      ? 'bg-gray-100 text-[#1B5E20]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Thông tin tài khoản
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    activeTab === 'orders' 
                      ? 'bg-gray-100 text-[#1B5E20]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Đơn hàng của bạn
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    activeTab === 'password' 
                      ? 'bg-gray-100 text-[#1B5E20]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Đổi mật khẩu
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-2 rounded transition-colors ${
                    activeTab === 'addresses' 
                      ? 'bg-gray-100 text-[#1B5E20]' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  Sổ địa chỉ ({isLoadingAddresses ? '...' : addresses.length})
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  Đăng xuất
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Card className="p-8">
              {renderTabContent()}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}