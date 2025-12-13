import { ChevronRight, Truck, CreditCard, Banknote, Smartphone, MapPin, Clock } from 'lucide-react';

interface ShippingPaymentPageProps {
  onNavigate: (page: string) => void;
}

export function ShippingPaymentPage({ onNavigate }: ShippingPaymentPageProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => onNavigate('home')} className="hover:text-[#1B5E20] transition-colors">
              Trang chủ
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Thanh toán & vận chuyển</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-10 h-10" />
            <h1 className="text-white">Thanh toán & Vận chuyển</h1>
          </div>
          <p className="text-xl text-white/90 max-w-[800px]">
            Giao hàng nhanh chóng - Thanh toán linh hoạt
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Section */}
            <section>
              <h2 className="text-[#1B5E20] mb-6">Chính sách vận chuyển</h2>
              
              {/* Shipping Options */}
              <div className="space-y-4 mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-lg flex items-center justify-center shrink-0">
                      <Truck className="w-6 h-6 text-[#1B5E20]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-2">Giao hàng tiêu chuẩn</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Áp dụng cho tất cả các đơn hàng trên toàn quốc
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">3-5 ngày (nội thành)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">5-7 ngày (ngoại thành)</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm">
                          <span className="text-gray-700">Phí vận chuyển: </span>
                          <span className="text-[#1B5E20]">25.000đ - 35.000đ</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-2">Giao hàng nhanh</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Giao trong ngày hoặc 24h tại Hà Nội & TP.HCM
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">2-4 giờ (nội thành)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">Đặt trước 14h</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm">
                          <span className="text-gray-700">Phí vận chuyển: </span>
                          <span className="text-[#1B5E20]">50.000đ</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#1B5E20]/10 to-[#1B5E20]/5 border border-[#1B5E20]/20 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#1B5E20] rounded-lg flex items-center justify-center shrink-0">
                      <span className="text-2xl">🎁</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[#1B5E20] mb-2">Miễn phí vận chuyển</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Áp dụng cho đơn hàng từ 300.000đ trở lên
                      </p>
                      <p className="text-sm text-gray-600">
                        * Áp dụng cho giao hàng tiêu chuẩn trên toàn quốc
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Areas */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="text-[#1B5E20] mb-4">Khu vực giao hàng</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="text-gray-900 mb-2">Nội thành Hà Nội & TP.HCM</h5>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Giao hàng trong 2-3 ngày</li>
                      <li>• Có giao hàng nhanh trong ngày</li>
                      <li>• Phí ship từ 25.000đ</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-gray-900 mb-2">Tỉnh thành khác</h5>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Giao hàng trong 5-7 ngày</li>
                      <li>• Phí ship từ 30.000đ - 35.000đ</li>
                      <li>• Miễn phí với đơn từ 300.000đ</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-gray-900 mb-2">Vùng xa, hải đảo</h5>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Giao hàng trong 7-10 ngày</li>
                      <li>• Phí ship theo thực tế</li>
                      <li>• Liên hệ để được tư vấn</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-gray-900 mb-2">Nhận tại cửa hàng</h5>
                    <ul className="space-y-1 text-gray-700">
                      <li>• Miễn phí hoàn toàn</li>
                      <li>• Nhận sau 2-4 giờ đặt hàng</li>
                      <li>• Tại 8 cửa hàng trên toàn quốc</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Payment Section */}
            <section>
              <h2 className="text-[#1B5E20] mb-6">Phương thức thanh toán</h2>
              
              <div className="space-y-4">
                {/* COD */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <Banknote className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-2">Thanh toán khi nhận hàng (COD)</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Thanh toán bằng tiền mặt khi nhận hàng tại nhà
                      </p>
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                        <p>✓ Kiểm tra hàng trước khi thanh toán</p>
                        <p>✓ Áp dụng cho tất cả đơn hàng</p>
                        <p>✓ Phí COD: 0đ (đơn dưới 5 triệu), 15.000đ (đơn trên 5 triệu)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Transfer */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-2">Chuyển khoản ngân hàng</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Chuyển khoản trực tiếp vào tài khoản Nhã Nam
                      </p>
                      <div className="bg-gray-50 p-4 rounded text-sm">
                        <p className="text-gray-900 mb-2">Thông tin tài khoản:</p>
                        <div className="space-y-1 text-gray-700">
                          <p>• Ngân hàng: Vietcombank</p>
                          <p>• Số TK: 0123 456 789</p>
                          <p>• Chủ TK: CÔNG TY VĂN HÓA NHÃ NAM</p>
                          <p>• Nội dung: Mã đơn hàng + Số điện thoại</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* E-wallet */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                      <Smartphone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-2">Ví điện tử</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Thanh toán qua các ví điện tử phổ biến
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <div className="bg-gray-50 px-4 py-2 rounded text-sm text-gray-700">MoMo</div>
                        <div className="bg-gray-50 px-4 py-2 rounded text-sm text-gray-700">ZaloPay</div>
                        <div className="bg-gray-50 px-4 py-2 rounded text-sm text-gray-700">VNPay</div>
                        <div className="bg-gray-50 px-4 py-2 rounded text-sm text-gray-700">ShopeePay</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Credit Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                      <CreditCard className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900 mb-2">Thẻ tín dụng/ghi nợ</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Thanh toán bằng thẻ Visa, Mastercard, JCB
                      </p>
                      <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                        <p>✓ Bảo mật SSL 128-bit</p>
                        <p>✓ Không lưu thông tin thẻ</p>
                        <p>✓ Hỗ trợ thanh toán quốc tế</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Important Notes */}
            <section>
              <h2 className="text-[#1B5E20] mb-4">Lưu ý quan trọng</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi thanh toán</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Thời gian giao hàng có thể kéo dài hơn vào dịp lễ, tết</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Đơn hàng chuyển khoản sẽ được xử lý sau khi nhận được tiền</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Liên hệ hotline 1900 1234 nếu có vấn đề về đơn hàng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Quý khách có thể tra cứu đơn hàng qua mã vận đơn được gửi qua SMS/Email</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Order Tracking */}
            <section>
              <h2 className="text-[#1B5E20] mb-4">Tra cứu đơn hàng</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Nhập mã đơn hàng hoặc mã vận đơn để tra cứu tình trạng giao hàng
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Nhập mã đơn hàng..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent"
                  />
                  <button className="bg-[#1B5E20] text-white px-6 py-2 rounded-lg hover:bg-[#145016] transition-colors">
                    Tra cứu
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#1B5E20] text-white p-6 rounded-lg">
              <h4 className="text-white mb-4">Hỗ trợ đặt hàng</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/80 mb-1">Hotline:</p>
                  <p className="text-xl">1900 1234</p>
                </div>
                <div>
                  <p className="text-white/80 mb-1">Email:</p>
                  <p>order@nhanam.vn</p>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-white/80">Thời gian hỗ trợ:</p>
                  <p>8:00 - 21:00 (Hàng ngày)</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-[#1B5E20] mb-4">Các chính sách khác</h4>
              <div className="space-y-2 text-sm">
                <button 
                  onClick={() => onNavigate('return')}
                  className="block w-full text-left text-gray-700 hover:text-[#1B5E20] transition-colors"
                >
                  → Chính sách đổi trả
                </button>
                <button 
                  onClick={() => onNavigate('privacy')}
                  className="block w-full text-left text-gray-700 hover:text-[#1B5E20] transition-colors"
                >
                  → Chính sách bảo mật
                </button>
                <button 
                  onClick={() => onNavigate('contact')}
                  className="block w-full text-left text-gray-700 hover:text-[#1B5E20] transition-colors"
                >
                  → Liên hệ
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-[#1B5E20] mb-4">Ưu đãi vận chuyển</h4>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded border border-[#1B5E20]/20">
                  <p className="text-sm text-gray-900 mb-1">Miễn phí ship</p>
                  <p className="text-xs text-gray-600">Đơn từ 300.000đ</p>
                </div>
                <div className="bg-white p-4 rounded border border-[#1B5E20]/20">
                  <p className="text-sm text-gray-900 mb-1">Giao nhanh 2H</p>
                  <p className="text-xs text-gray-600">Nội thành HN & HCM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
