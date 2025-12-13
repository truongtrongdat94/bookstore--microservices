import { ChevronRight, Package, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#1B5E20] transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Chính sách đổi trả</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-10 h-10" />
            <h1 className="text-4xl font-bold text-white">Chính sách đổi trả</h1>
          </div>
          <p className="text-xl text-white/90 max-w-[800px]">Đổi trả dễ dàng trong 30 ngày - Sự hài lòng của bạn là ưu tiên hàng đầu</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: <Clock className="w-8 h-8 text-[#1B5E20]" />, title: '30 ngày', desc: 'Thời gian đổi trả' },
                { icon: <Package className="w-8 h-8 text-[#1B5E20]" />, title: 'Miễn phí', desc: 'Phí vận chuyển đổi trả' },
                { icon: <RefreshCw className="w-8 h-8 text-[#1B5E20]" />, title: 'Đơn giản', desc: 'Quy trình đổi trả' },
              ].map((item, idx) => (
                <div key={idx} className="bg-[#1B5E20]/5 border border-[#1B5E20]/20 p-6 rounded-lg text-center">
                  <div className="mx-auto mb-3 flex justify-center">{item.icon}</div>
                  <h4 className="font-semibold text-[#1B5E20] mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>

            <section>
              <h2 className="text-2xl font-bold text-[#1B5E20] mb-4">1. Điều kiện đổi trả</h2>
              <h4 className="font-semibold text-gray-900 mb-3">Sách được đổi trả khi:</h4>
              <div className="space-y-3 mb-6">
                {[
                  { title: 'Lỗi từ nhà xuất bản', desc: 'Sách bị lỗi in ấn, thiếu trang, sai nội dung' },
                  { title: 'Giao sai sản phẩm', desc: 'Nhận được sách khác với đơn đặt hàng' },
                  { title: 'Hư hỏng trong vận chuyển', desc: 'Sách bị rách, ướt hoặc hư hại khi nhận hàng' },
                  { title: 'Không hài lòng', desc: 'Đổi trả trong 30 ngày, sách còn nguyên vẹn' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div><p className="font-medium text-gray-900 mb-1">{item.title}</p><p className="text-sm text-gray-700">{item.desc}</p></div>
                  </div>
                ))}
              </div>

              <h4 className="font-semibold text-gray-900 mb-3">Sách KHÔNG được đổi trả khi:</h4>
              <div className="space-y-3">
                {[
                  { title: 'Quá thời gian quy định', desc: 'Đã quá 30 ngày kể từ ngày nhận hàng' },
                  { title: 'Sách đã qua sử dụng', desc: 'Có dấu hiệu gấp góc, ghi chú, viết vẽ' },
                  { title: 'Mất bao bì, phụ kiện', desc: 'Không còn nguyên vẹn như khi nhận' },
                  { title: 'Sản phẩm khuyến mãi đặc biệt', desc: 'Đã được thông báo không áp dụng đổi trả' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-red-50 p-4 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div><p className="font-medium text-gray-900 mb-1">{item.title}</p><p className="text-sm text-gray-700">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B5E20] mb-4">2. Quy trình đổi trả</h2>
              <div className="space-y-6">
                {[
                  { step: '1', title: 'Liên hệ bộ phận CSKH', desc: 'Gọi hotline 1900 1234 hoặc gửi email đến support@nhanam.vn', note: 'Cung cấp: Mã đơn hàng, lý do đổi trả, hình ảnh sản phẩm (nếu có)' },
                  { step: '2', title: 'Xác nhận yêu cầu', desc: 'CSKH sẽ xem xét và phản hồi trong vòng 24 giờ', note: 'Bạn sẽ nhận được mã đổi trả và hướng dẫn chi tiết' },
                  { step: '3', title: 'Đóng gói và gửi trả', desc: 'Đóng gói sách cẩn thận theo hướng dẫn', note: 'Chúng tôi sẽ gửi shipper đến lấy hàng hoặc bạn có thể gửi qua bưu điện' },
                  { step: '4', title: 'Kiểm tra và xử lý', desc: 'Chúng tôi kiểm tra sản phẩm trong 2-3 ngày làm việc', note: 'Nếu hợp lệ, chúng tôi sẽ đổi sách mới hoặc hoàn tiền' },
                  { step: '5', title: 'Nhận sách/tiền', desc: 'Nhận sách mới hoặc tiền hoàn trong 5-7 ngày', note: 'Hoàn tiền qua phương thức thanh toán ban đầu' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="shrink-0">
                      <div className="w-12 h-12 bg-[#1B5E20] text-white rounded-full flex items-center justify-center">
                        <span className="text-xl font-bold">{item.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-gray-700 mb-2">{item.desc}</p>
                      <p className="text-sm text-gray-600">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1B5E20] mb-4">3. Hình thức đổi trả</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-[#1B5E20] mb-3">Đổi sản phẩm</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Đổi sang sản phẩm cùng loại</li>
                    <li>• Đổi sang sản phẩm khác (bù trừ chênh lệch)</li>
                    <li>• Miễn phí vận chuyển</li>
                    <li>• Thời gian: 5-7 ngày</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-[#1B5E20] mb-3">Hoàn tiền</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Hoàn 100% giá trị đơn hàng</li>
                    <li>• Qua tài khoản ngân hàng</li>
                    <li>• Hoặc ví điện tử</li>
                    <li>• Thời gian: 5-10 ngày làm việc</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="bg-[#1B5E20] text-white p-6 rounded-lg">
              <h4 className="font-semibold text-white mb-4">Liên hệ hỗ trợ đổi trả</h4>
              <div className="space-y-3 text-sm">
                <div><p className="text-white/80 mb-1">Hotline:</p><p className="text-xl font-bold">1900 1234</p></div>
                <div><p className="text-white/80 mb-1">Email:</p><p>support@nhanam.vn</p></div>
                <div className="pt-3 border-t border-white/20"><p className="text-white/80">Thời gian hỗ trợ:</p><p>8:00 - 21:00 (Thứ 2 - CN)</p></div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-[#1B5E20] mb-4">Các chính sách khác</h4>
              <div className="space-y-2 text-sm">
                <Link to="/shipping-payment" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">→ Thanh toán & vận chuyển</Link>
                <Link to="/privacy-policy" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">→ Chính sách bảo mật</Link>
                <Link to="/contact" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">→ Liên hệ</Link>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-[#1B5E20] mb-3">Mẹo hữu ích</h4>
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
