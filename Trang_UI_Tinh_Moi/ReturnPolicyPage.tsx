import { ChevronRight, Package, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';

interface ReturnPolicyPageProps {
  onNavigate: (page: string) => void;
}

export function ReturnPolicyPage({ onNavigate }: ReturnPolicyPageProps) {
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
            <span className="text-gray-900">Chính sách đổi trả</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-10 h-10" />
            <h1 className="text-white">Chính sách đổi trả</h1>
          </div>
          <p className="text-xl text-white/90 max-w-[800px]">
            Đổi trả dễ dàng trong 30 ngày - Sự hài lòng của bạn là ưu tiên hàng đầu
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#1B5E20]/5 border border-[#1B5E20]/20 p-6 rounded-lg text-center">
                <Clock className="w-8 h-8 text-[#1B5E20] mx-auto mb-3" />
                <h4 className="text-[#1B5E20] mb-2">30 ngày</h4>
                <p className="text-sm text-gray-700">Thời gian đổi trả</p>
              </div>
              <div className="bg-[#1B5E20]/5 border border-[#1B5E20]/20 p-6 rounded-lg text-center">
                <Package className="w-8 h-8 text-[#1B5E20] mx-auto mb-3" />
                <h4 className="text-[#1B5E20] mb-2">Miễn phí</h4>
                <p className="text-sm text-gray-700">Phí vận chuyển đổi trả</p>
              </div>
              <div className="bg-[#1B5E20]/5 border border-[#1B5E20]/20 p-6 rounded-lg text-center">
                <RefreshCw className="w-8 h-8 text-[#1B5E20] mx-auto mb-3" />
                <h4 className="text-[#1B5E20] mb-2">Đơn giản</h4>
                <p className="text-sm text-gray-700">Quy trình đổi trả</p>
              </div>
            </div>

            <section>
              <h2 className="text-[#1B5E20] mb-4">1. Điều kiện đổi trả</h2>
              <div className="space-y-4 text-gray-700">
                <h4 className="text-gray-900">Sách được đổi trả khi:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 mb-1">Lỗi từ nhà xuất bản</p>
                      <p className="text-sm">Sách bị lỗi in ấn, thiếu trang, sai nội dung</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 mb-1">Giao sai sản phẩm</p>
                      <p className="text-sm">Nhận được sách khác với đơn đặt hàng</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 mb-1">Hư hỏng trong vận chuyển</p>
                      <p className="text-sm">Sách bị rách, ướt hoặc hư hại khi nhận hàng</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 mb-1">Không hài lòng</p>
                      <p className="text-sm">Đổi trả trong 30 ngày, sách còn nguyên vẹn</p>
                    </div>
                  </div>
                </div>

                <h4 className="text-gray-900 mt-6">Sách KHÔNG được đổi trả khi:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 mb-1">Quá thời gian quy định</p>
                      <p className="text-sm">Đã quá 30 ngày kể từ ngày nhận hàng</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 mb-1">Sách đã qua sử dụng</p>
                      <p className="text-sm">Có dấu hiệu gấp góc, ghi chú, viết vẽ</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 mb-1">Mất bao bì, phụ kiện</p>
                      <p className="text-sm">Không còn nguyên vẹn như khi nhận</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-gray-900 mb-1">Sản phẩm khuyến mãi đặc biệt</p>
                      <p className="text-sm">Đã được thông báo không áp dụng đổi trả</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">2. Quy trình đổi trả</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-[#1B5E20] text-white rounded-full flex items-center justify-center">
                      <span className="text-xl">1</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-2">Liên hệ bộ phận CSKH</h4>
                    <p className="text-gray-700 mb-2">
                      Gọi hotline <strong>1900 1234</strong> hoặc gửi email đến <strong>support@nhanam.vn</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Cung cấp: Mã đơn hàng, lý do đổi trả, hình ảnh sản phẩm (nếu có)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-[#1B5E20] text-white rounded-full flex items-center justify-center">
                      <span className="text-xl">2</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-2">Xác nhận yêu cầu</h4>
                    <p className="text-gray-700 mb-2">
                      CSKH sẽ xem xét và phản hồi trong vòng 24 giờ
                    </p>
                    <p className="text-sm text-gray-600">
                      Bạn sẽ nhận được mã đổi trả và hướng dẫn chi tiết
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-[#1B5E20] text-white rounded-full flex items-center justify-center">
                      <span className="text-xl">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-2">Đóng gói và gửi trả</h4>
                    <p className="text-gray-700 mb-2">
                      Đóng gói sách cẩn thận theo hướng dẫn
                    </p>
                    <p className="text-sm text-gray-600">
                      Chúng tôi sẽ gửi shipper đến lấy hàng hoặc bạn có thể gửi qua bưu điện
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-[#1B5E20] text-white rounded-full flex items-center justify-center">
                      <span className="text-xl">4</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-2">Kiểm tra và xử lý</h4>
                    <p className="text-gray-700 mb-2">
                      Chúng tôi kiểm tra sản phẩm trong 2-3 ngày làm việc
                    </p>
                    <p className="text-sm text-gray-600">
                      Nếu hợp lệ, chúng tôi sẽ đổi sách mới hoặc hoàn tiền
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-[#1B5E20] text-white rounded-full flex items-center justify-center">
                      <span className="text-xl">5</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-2">Nhận sách/tiền</h4>
                    <p className="text-gray-700 mb-2">
                      Nhận sách mới hoặc tiền hoàn trong 5-7 ngày
                    </p>
                    <p className="text-sm text-gray-600">
                      Hoàn tiền qua phương thức thanh toán ban đầu
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">3. Hình thức đổi trả</h2>
              <div className="space-y-4 text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-[#1B5E20] mb-3">Đổi sản phẩm</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Đổi sang sản phẩm cùng loại</li>
                      <li>• Đổi sang sản phẩm khác (bù trừ chênh lệch)</li>
                      <li>• Miễn phí vận chuyển</li>
                      <li>• Thời gian: 5-7 ngày</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h4 className="text-[#1B5E20] mb-3">Hoàn tiền</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Hoàn 100% giá trị đơn hàng</li>
                      <li>• Qua tài khoản ngân hàng</li>
                      <li>• Hoặc ví điện tử</li>
                      <li>• Thời gian: 5-10 ngày làm việc</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">4. Chi phí đổi trả</h2>
              <div className="space-y-4 text-gray-700">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-gray-900 mb-2">Nhã Nam chịu phí khi:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Lỗi từ nhà xuất bản</li>
                        <li>• Giao sai sản phẩm</li>
                        <li>• Hư hỏng do vận chuyển</li>
                        <li>• Sản phẩm không đúng mô tả</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-gray-900 mb-2">Khách hàng chịu phí khi:</h5>
                      <ul className="space-y-1 text-sm">
                        <li>• Đổi ý không muốn mua</li>
                        <li>• Chọn nhầm sản phẩm</li>
                        <li>• Muốn đổi sang sản phẩm khác</li>
                        <li>• (Chi phí: 30.000đ - 50.000đ)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">5. Lưu ý quan trọng</h2>
              <div className="space-y-4 text-gray-700">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Vui lòng quay video khi mở hộp hàng để làm bằng chứng khi có vấn đề</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Giữ nguyên tất cả tem, nhãn mác, phiếu bảo hành (nếu có)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Đối với sách ngoại văn nhập khẩu: không áp dụng đổi trả nếu không có lỗi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Sách thuộc chương trình khuyến mãi đặc biệt có thể có quy định riêng</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#1B5E20] mt-1">•</span>
                    <span>Thời gian xử lý có thể kéo dài hơn vào dịp lễ, tết</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">6. Câu hỏi thường gặp</h2>
              <div className="space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h5 className="text-gray-900 mb-2">Tôi có thể đổi sách đã đọc được không?</h5>
                  <p className="text-sm text-gray-700">
                    Chỉ chấp nhận đổi trả nếu sách còn nguyên vẹn, không có dấu hiệu sử dụng. 
                    Nếu đã đọc và có vết gấp góc, chúng tôi rất tiếc không thể hỗ trợ đổi trả.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h5 className="text-gray-900 mb-2">Làm sao biết đơn hàng của tôi đủ điều kiện đổi trả?</h5>
                  <p className="text-sm text-gray-700">
                    Liên hệ hotline 1900 1234 với mã đơn hàng, chúng tôi sẽ kiểm tra và tư vấn cụ thể.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h5 className="text-gray-900 mb-2">Tôi mua tại cửa hàng có được đổi trả online không?</h5>
                  <p className="text-sm text-gray-700">
                    Có, bạn có thể đổi trả tại bất kỳ cửa hàng Nhã Nam nào hoặc qua hệ thống online.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#1B5E20] text-white p-6 rounded-lg">
              <h4 className="text-white mb-4">Liên hệ hỗ trợ đổi trả</h4>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-white/80 mb-1">Hotline:</p>
                  <p className="text-xl">1900 1234</p>
                </div>
                <div>
                  <p className="text-white/80 mb-1">Email:</p>
                  <p>support@nhanam.vn</p>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-white/80">Thời gian hỗ trợ:</p>
                  <p>8:00 - 21:00 (Thứ 2 - CN)</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-[#1B5E20] mb-4">Các chính sách khác</h4>
              <div className="space-y-2 text-sm">
                <button 
                  onClick={() => onNavigate('shipping')}
                  className="block w-full text-left text-gray-700 hover:text-[#1B5E20] transition-colors"
                >
                  → Thanh toán & vận chuyển
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
              <h4 className="text-[#1B5E20] mb-3">Mẹo hữu ích</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Chụp ảnh/quay video khi nhận hàng</li>
                <li>✓ Kiểm tra kỹ sản phẩm ngay</li>
                <li>✓ Giữ nguyên bao bì, phụ kiện</li>
                <li>✓ Liên hệ sớm nếu có vấn đề</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
