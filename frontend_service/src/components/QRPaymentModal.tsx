import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Loader2, RefreshCw, Clock, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

// Props interface for QRPaymentModal
// Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
interface QRPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrData: {
    qr_data_url: string;
    transfer_content: string;
    bank_info: {
      account_no: string;
      account_name: string;
      bank_name: string;
    };
    expires_at: string;
    expires_in_seconds: number;
  };
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  onRegenerateQR: () => Promise<void>;
}

export function QRPaymentModal({
  isOpen,
  onClose,
  qrData,
  orderId: _orderId, // Reserved for future use
  orderNumber,
  totalAmount,
  onRegenerateQR,
}: QRPaymentModalProps) {
  // Countdown timer state - Requirements: 4.4
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);


  // Calculate remaining seconds from expires_at - Requirements: 4.4
  const calculateRemainingSeconds = useCallback(() => {
    const expiresAt = new Date(qrData.expires_at).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
    return remaining;
  }, [qrData.expires_at]);

  // Initialize and update countdown timer - Requirements: 4.4
  useEffect(() => {
    if (!isOpen || !qrData.expires_at) return;

    // Initialize remaining seconds
    const initial = calculateRemainingSeconds();
    setRemainingSeconds(initial);
    setIsExpired(initial <= 0);

    // Update countdown every second
    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setRemainingSeconds(remaining);
      
      // Show "Expired" when countdown reaches 0 - Requirements: 4.4
      if (remaining <= 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, qrData.expires_at, calculateRemainingSeconds]);

  // Reset expired state when qrData changes (after regeneration)
  useEffect(() => {
    if (qrData.expires_in_seconds > 0) {
      setIsExpired(false);
      setRemainingSeconds(qrData.expires_in_seconds);
    }
  }, [qrData.expires_in_seconds, qrData.qr_data_url]);

  // Handle regenerate QR - Requirements: 4.5
  const handleRegenerateQR = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateQR();
      toast.success('Đã tạo mã QR mới');
    } catch (error) {
      toast.error('Không thể tạo mã QR mới. Vui lòng thử lại.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Format remaining time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format price in VND
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      toast.success('Đã sao chép');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error('Không thể sao chép');
    }
  };


  // State for image loading
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image state when qrData changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [qrData.qr_data_url]);

  // Debug: log when modal should open
  useEffect(() => {
    if (isOpen) {
      console.log('QRPaymentModal: Modal is OPEN');
      console.log('QR URL starts with:', qrData.qr_data_url?.substring(0, 50));
    }
  }, [isOpen, qrData.qr_data_url]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={true}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Thanh toán đơn hàng</DialogTitle>
          <DialogDescription className="text-center">
            Mã đơn hàng: <span className="font-semibold">{orderNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* QR Code Image - Requirements: 4.1 */}
          <div className="flex justify-center">
            <div className={`relative ${isExpired ? 'opacity-50' : ''}`}>
              {!imageLoaded && !imageError && (
                <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-gray-100">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
              {imageError && (
                <div className="w-48 h-48 border rounded-lg flex items-center justify-center bg-red-50">
                  <span className="text-red-500 text-sm text-center px-2">Không thể tải mã QR</span>
                </div>
              )}
              <img
                src={qrData.qr_data_url}
                alt="QR Code thanh toán"
                className={`w-48 h-48 border rounded-lg ${!imageLoaded ? 'hidden' : ''}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {isExpired && imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <span className="text-white font-semibold">Đã hết hạn</span>
                </div>
              )}
            </div>
          </div>

          {/* Countdown Timer - Requirements: 4.4 */}
          <div className="flex items-center justify-center gap-2">
            <Clock className={`h-4 w-4 ${isExpired ? 'text-red-500' : 'text-orange-500'}`} />
            {isExpired ? (
              <span className="text-red-500 font-medium">Mã QR đã hết hạn</span>
            ) : (
              <span className="text-orange-500 font-medium">
                Còn lại: {formatTime(remainingSeconds)}
              </span>
            )}
          </div>

          {/* Total Amount - Requirements: 4.3 */}
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">Số tiền cần chuyển</p>
              <p className="text-2xl font-bold text-[#1B5E20]">
                {formatPrice(totalAmount)}
              </p>
            </div>
          </Card>

          {/* Bank Info - Requirements: 4.2 */}
          <Card className="p-4 space-y-3">
            <h4 className="font-semibold text-sm text-gray-700">Thông tin chuyển khoản</h4>
            
            {/* Bank Name */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ngân hàng:</span>
              <span className="font-medium">{qrData.bank_info.bank_name}</span>
            </div>

            {/* Account Number */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Số tài khoản:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono">{qrData.bank_info.account_no}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(qrData.bank_info.account_no, 'account')}
                >
                  {copied === 'account' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Account Name */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Chủ tài khoản:</span>
              <span className="font-medium">{qrData.bank_info.account_name}</span>
            </div>

            {/* Transfer Content - Requirements: 4.3 */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Nội dung CK:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-sm">{qrData.transfer_content}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(qrData.transfer_content, 'content')}
                >
                  {copied === 'content' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Warning message */}
          <p className="text-xs text-center text-gray-500">
            Vui lòng nhập đúng nội dung chuyển khoản để đơn hàng được xác nhận tự động
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Regenerate QR Button - Requirements: 4.5 */}
          {isExpired && (
            <Button
              onClick={handleRegenerateQR}
              disabled={isRegenerating}
              className="w-full sm:w-auto bg-[#1B5E20] hover:bg-[#0d3d13]"
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo mã mới...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tạo mã QR mới
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
