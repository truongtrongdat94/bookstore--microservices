import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Minus, Plus, Trash2, Loader2, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useAuthStore } from '../store';
import { ordersApi } from '../api/orders';
import { CheckoutResponse } from '../types/order';
import { toast } from 'sonner';
import { QRPaymentModal } from './QRPaymentModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export function CartPage() {
  // Use the useCart hook instead of hardcoded data
  const { 
    items, 
    totalItems, 
    totalPrice, 
    isLoading, 
    updateQuantity, 
    removeFromCart,
    clearCart
  } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [deliveryDate, setDeliveryDate] = useState('');
  const [needInvoice, setNeedInvoice] = useState(false);
  
  // Checkout state - Requirements: 3.1
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Handle quantity update - calls useCart.updateQuantity
  const handleUpdateQuantity = (bookId: number, delta: number, currentQuantity: number) => {
    const newQuantity = Math.max(1, currentQuantity + delta);
    updateQuantity({ bookId, quantity: newQuantity });
  };

  // Handle remove item - calls useCart.removeFromCart
  const handleRemoveItem = (bookId: number) => {
    if (typeof removeFromCart === 'function') {
      removeFromCart(bookId);
    }
  };

  const shipping = 30000;
  const total = totalPrice + shipping;

  // Handle checkout - Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
  const handleCheckout = async () => {
    // Check authentication, redirect to login if not authenticated - Requirements: 3.2
    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }

    // Validate shipping address - Requirements: 3.3
    if (!shippingAddress.trim()) {
      setCheckoutError('Vui lòng nhập địa chỉ giao hàng');
      toast.error('Vui lòng nhập địa chỉ giao hàng');
      return;
    }

    // Validate cart is not empty
    if (items.length === 0) {
      setCheckoutError('Giỏ hàng trống');
      toast.error('Giỏ hàng trống');
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Call checkout API - Requirements: 3.3
      const result = await ordersApi.checkout(shippingAddress);
      
      // Handle success - Requirements: 3.4
      // First clear cart silently, then set checkout result and show modal
      clearCart({ silent: true });
      
      // Set checkout result and show modal after cart is cleared
      setCheckoutResult(result);
      setShowQRModal(true);
      
      toast.success('Đặt hàng thành công! Vui lòng thanh toán.');
    } catch (error: any) {
      // Handle error - Requirements: 3.5
      const errorMessage = error.response?.data?.message || error.message || 'Không thể thanh toán. Vui lòng thử lại.';
      setCheckoutError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Handle close QR modal - Requirements: 4.1
  const handleCloseQRModal = () => {
    setShowQRModal(false);
  };

  // Handle regenerate QR - Requirements: 4.5
  const handleRegenerateQR = async () => {
    if (!checkoutResult) return;
    
    try {
      const qrResponse = await ordersApi.getOrderQR(checkoutResult.order_id);
      
      // Update checkoutResult with new QR data
      setCheckoutResult({
        ...checkoutResult,
        payment: {
          qr_data_url: qrResponse.qr_data_url,
          transfer_content: qrResponse.transfer_content,
          bank_info: qrResponse.bank_info,
          expires_at: qrResponse.expires_at,
          expires_in_seconds: qrResponse.expires_in_seconds,
        },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo mã QR mới.';
      toast.error(errorMessage);
      throw error;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };


  // Loading state - display skeleton/spinner while isLoading is true
  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <h2 className="mb-8">Giỏ hàng của bạn</h2>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#1B5E20]" />
          <span className="ml-3 text-gray-600">Đang tải giỏ hàng...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h2 className="mb-8">Giỏ hàng của bạn</h2>

      {items.length === 0 && !checkoutResult ? (
        <Card className="p-12 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
          <Link to="/">
            <Button className="bg-[#1B5E20] hover:bg-[#0d3d13]">
              Tiếp tục mua sắm
            </Button>
          </Link>
        </Card>
      ) : items.length === 0 && checkoutResult ? (
        // Show success message with QR code directly (no modal needed)
        <Card className="p-8">
          <div className="text-center mb-6">
            <div className="text-green-500 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Đặt hàng thành công!</h3>
            <p className="text-gray-500 mb-2">Mã đơn hàng: <span className="font-semibold">{checkoutResult.order_number}</span></p>
          </div>

          {/* QR Code Section - Display directly instead of modal */}
          {checkoutResult.payment && (
            <div className="max-w-md mx-auto">
              <Card className="p-6 bg-gray-50 border-2 border-[#1B5E20]">
                <h4 className="text-center font-semibold mb-4 text-[#1B5E20]">Quét mã QR để thanh toán</h4>
                
                {/* QR Code Image */}
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-2 rounded-lg shadow">
                    <img 
                      src={checkoutResult.payment.qr_data_url} 
                      alt="QR Code thanh toán"
                      className="w-48 h-48"
                      onError={(e) => {
                        console.error('QR image failed to load');
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      onLoad={() => console.log('QR image loaded successfully')}
                    />
                  </div>
                </div>

                {/* Total Amount */}
                <div className="text-center mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Số tiền cần chuyển</p>
                  <p className="text-2xl font-bold text-[#1B5E20]">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(checkoutResult.total_amount)}
                  </p>
                </div>

                {/* Bank Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngân hàng:</span>
                    <span className="font-medium">{checkoutResult.payment.bank_info.bank_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số tài khoản:</span>
                    <span className="font-mono font-medium">{checkoutResult.payment.bank_info.account_no}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Chủ tài khoản:</span>
                    <span className="font-medium">{checkoutResult.payment.bank_info.account_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nội dung CK:</span>
                    <span className="font-mono font-medium text-[#1B5E20]">{checkoutResult.payment.transfer_content}</span>
                  </div>
                </div>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Vui lòng nhập đúng nội dung chuyển khoản để đơn hàng được xác nhận tự động
                </p>
              </Card>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Link to="/">
              <Button variant="outline">
                Tiếp tục mua sắm
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - Desktop Table */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Sản phẩm</TableHead>
                    <TableHead>Thông tin</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Tổng</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.book_id}>
                      <TableCell>
                        <div className="w-16 h-20 overflow-hidden rounded">
                          <ImageWithFallback
                            src={item.book_image || ''}
                            alt={item.book_title || ''}
                            className="w-full h-full object-cover"
                            displayWidth={64}
                            aspectRatio="4/5"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="mb-1">{item.book_title}</p>
                          <p className="text-sm text-gray-600">{item.book_author}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.book_id, -1, item.quantity)}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.book_id, 1, item.quantity)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(item.book_price || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice((item.book_price || 0) * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.book_id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>


            {/* Cart Items - Mobile Cards */}
            <div className="md:hidden space-y-4">
              {items.map((item) => (
                <Card key={item.book_id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-28 flex-shrink-0 overflow-hidden rounded">
                      <ImageWithFallback
                        src={item.book_image || ''}
                        alt={item.book_title || ''}
                        className="w-full h-full object-cover"
                        displayWidth={80}
                        aspectRatio="5/7"
                      />
                    </div>
                    <div className="flex-1">
                      <h5 className="mb-1">{item.book_title}</h5>
                      <p className="text-sm text-gray-600 mb-2">{item.book_author}</p>
                      <p className="text-[#1B5E20] mb-3">{formatPrice(item.book_price || 0)}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.book_id, -1, item.quantity)}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.book_id, 1, item.quantity)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.book_id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h4 className="mb-6">Thông tin đơn hàng</h4>

              {/* Shipping Address - Requirements: 3.1 */}
              <div className="mb-4">
                <Label htmlFor="shipping-address">Địa chỉ giao hàng <span className="text-red-500">*</span></Label>
                <Input
                  id="shipping-address"
                  type="text"
                  placeholder="Nhập địa chỉ giao hàng"
                  value={shippingAddress}
                  onChange={(e) => {
                    setShippingAddress(e.target.value);
                    if (checkoutError) setCheckoutError(null);
                  }}
                  className={`mt-2 ${checkoutError && !shippingAddress.trim() ? 'border-red-500' : ''}`}
                />
                {checkoutError && !shippingAddress.trim() && (
                  <p className="text-red-500 text-sm mt-1">{checkoutError}</p>
                )}
              </div>

              {/* Delivery Date */}
              <div className="mb-4">
                <Label htmlFor="delivery-date">Ngày giao hàng mong muốn</Label>
                <Input
                  id="delivery-date"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Invoice Checkbox */}
              <div className="flex items-center space-x-2 mb-6">
                <Checkbox
                  id="invoice"
                  checked={needInvoice}
                  onCheckedChange={(checked) => setNeedInvoice(checked as boolean)}
                />
                <label
                  htmlFor="invoice"
                  className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Xuất hóa đơn công ty
                </label>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính ({totalItems} sản phẩm):</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển:</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span>Tổng cộng:</span>
                  <span className="text-[#1B5E20]">{formatPrice(total)}</span>
                </div>
              </div>

              <Button 
                className="w-full bg-[#1B5E20] hover:bg-[#0d3d13]"
                onClick={handleCheckout}
                disabled={isCheckingOut || items.length === 0}
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Thanh toán'
                )}
              </Button>
              
              {/* Display checkout error if any */}
              {checkoutError && shippingAddress.trim() && (
                <p className="text-red-500 text-sm text-center mt-2">{checkoutError}</p>
              )}

              <p className="text-xs text-gray-500 text-center mt-4">
                Miễn phí vận chuyển cho đơn hàng từ 500.000đ
              </p>
            </Card>
          </div>
        </div>
      )}



      {/* QR Payment Modal - Requirements: 4.1 */}
      {checkoutResult && checkoutResult.payment && (
        <QRPaymentModal
          isOpen={showQRModal}
          onClose={handleCloseQRModal}
          qrData={checkoutResult.payment}
          orderId={checkoutResult.order_id}
          orderNumber={checkoutResult.order_number}
          totalAmount={checkoutResult.total_amount}
          onRegenerateQR={handleRegenerateQR}
        />
      )}
    </div>
  );
}
