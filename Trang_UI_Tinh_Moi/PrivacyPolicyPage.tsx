import { ChevronRight, Shield, Lock, Eye, Database } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigate: (page: string) => void;
}

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
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
            <span className="text-gray-900">Chính sách bảo mật</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10" />
            <h1 className="text-white">Chính sách bảo mật</h1>
          </div>
          <p className="text-xl text-white/90 max-w-[800px]">
            Cam kết bảo vệ thông tin cá nhân của khách hàng
          </p>
          <p className="text-sm text-white/80 mt-4">
            Cập nhật lần cuối: 11/12/2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-[#1B5E20] mb-4">1. Giới thiệu</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Nhã Nam cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. 
                  Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ 
                  thông tin của bạn khi sử dụng website và dịch vụ của chúng tôi.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">2. Thông tin chúng tôi thu thập</h2>
              <div className="space-y-4 text-gray-700">
                <h4 className="text-gray-900">2.1. Thông tin cá nhân</h4>
                <p>
                  Khi bạn đăng ký tài khoản, đặt hàng hoặc liên hệ với chúng tôi, chúng tôi có thể thu thập:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Họ và tên</li>
                  <li>Địa chỉ email</li>
                  <li>Số điện thoại</li>
                  <li>Địa chỉ giao hàng</li>
                  <li>Thông tin thanh toán</li>
                </ul>

                <h4 className="text-gray-900 mt-4">2.2. Thông tin tự động</h4>
                <p>
                  Khi bạn truy cập website, chúng tôi tự động thu thập:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Địa chỉ IP</li>
                  <li>Loại trình duyệt</li>
                  <li>Thời gian truy cập</li>
                  <li>Trang đã xem</li>
                  <li>Dữ liệu cookies</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">3. Mục đích sử dụng thông tin</h2>
              <div className="space-y-4 text-gray-700">
                <p>Chúng tôi sử dụng thông tin của bạn để:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-gray-900 mb-2">Xử lý đơn hàng</h5>
                    <p className="text-sm">Xác nhận, đóng gói và giao hàng đến bạn</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-gray-900 mb-2">Chăm sóc khách hàng</h5>
                    <p className="text-sm">Hỗ trợ và giải đáp thắc mắc của bạn</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-gray-900 mb-2">Cải thiện dịch vụ</h5>
                    <p className="text-sm">Phân tích và nâng cao trải nghiệm người dùng</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="text-gray-900 mb-2">Marketing</h5>
                    <p className="text-sm">Gửi thông tin khuyến mãi (nếu bạn đồng ý)</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">4. Bảo vệ thông tin</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ thông tin của bạn:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
                  <li>Hệ thống tường lửa (firewall) bảo vệ server</li>
                  <li>Kiểm soát truy cập nghiêm ngặt</li>
                  <li>Sao lưu dữ liệu thường xuyên</li>
                  <li>Đào tạo nhân viên về bảo mật thông tin</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">5. Chia sẻ thông tin</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ 
                  thông tin với bên thứ ba trong các trường hợp sau:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Đối tác vận chuyển để giao hàng</li>
                  <li>Đối tác thanh toán để xử lý giao dịch</li>
                  <li>Cơ quan pháp luật khi có yêu cầu hợp pháp</li>
                  <li>Bảo vệ quyền lợi của Nhã Nam và khách hàng</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">6. Cookies</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Chúng tôi sử dụng cookies để cải thiện trải nghiệm của bạn. Cookies giúp:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Ghi nhớ đăng nhập và giỏ hàng</li>
                  <li>Cá nhân hóa nội dung</li>
                  <li>Phân tích lưu lượng truy cập</li>
                  <li>Hiển thị quảng cáo phù hợp</li>
                </ul>
                <p>
                  Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng điều này có thể ảnh hưởng 
                  đến một số chức năng của website.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">7. Quyền của bạn</h2>
              <div className="space-y-4 text-gray-700">
                <p>Bạn có quyền:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Truy cập và xem thông tin cá nhân của bạn</li>
                  <li>Yêu cầu sửa đổi thông tin không chính xác</li>
                  <li>Yêu cầu xóa thông tin cá nhân</li>
                  <li>Rút lại sự đồng ý sử dụng thông tin</li>
                  <li>Từ chối nhận email marketing</li>
                  <li>Khiếu nại về cách xử lý dữ liệu</li>
                </ul>
                <p className="mt-4">
                  Để thực hiện các quyền này, vui lòng liên hệ: <strong>privacy@nhanam.vn</strong>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">8. Lưu trữ thông tin</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Chúng tôi lưu trữ thông tin của bạn trong thời gian cần thiết để:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Cung cấp dịch vụ cho bạn</li>
                  <li>Tuân thủ nghĩa vụ pháp lý</li>
                  <li>Giải quyết tranh chấp</li>
                  <li>Thực thi thỏa thuận</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">9. Trẻ em</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Dịch vụ của chúng tôi không dành cho trẻ em dưới 16 tuổi. Chúng tôi không cố ý 
                  thu thập thông tin cá nhân từ trẻ em. Nếu phát hiện, chúng tôi sẽ xóa thông tin đó ngay lập tức.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">10. Thay đổi chính sách</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Chúng tôi có thể cập nhật chính sách này theo thời gian. Những thay đổi quan trọng 
                  sẽ được thông báo qua email hoặc trên website. Việc bạn tiếp tục sử dụng dịch vụ 
                  sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận chính sách mới.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-[#1B5E20] mb-4">11. Liên hệ</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p><strong>Công ty Văn hóa Nhã Nam</strong></p>
                  <p>Địa chỉ: 59 Đỗ Quang, Trung Hoà, Cầu Giấy, Hà Nội</p>
                  <p>Email: privacy@nhanam.vn</p>
                  <p>Điện thoại: 024 3512 3456</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg sticky top-4">
              <h4 className="text-[#1B5E20] mb-4">Mục lục</h4>
              <nav className="space-y-2 text-sm">
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">1. Giới thiệu</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">2. Thông tin thu thập</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">3. Mục đích sử dụng</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">4. Bảo vệ thông tin</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">5. Chia sẻ thông tin</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">6. Cookies</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">7. Quyền của bạn</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">8. Lưu trữ thông tin</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">9. Trẻ em</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">10. Thay đổi chính sách</a>
                <a href="#" className="block text-gray-700 hover:text-[#1B5E20] transition-colors">11. Liên hệ</a>
              </nav>
            </div>

            <div className="bg-[#1B5E20] text-white p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-6 h-6" />
                <h4 className="text-white">Bảo mật</h4>
              </div>
              <p className="text-sm text-white/90">
                Thông tin của bạn được mã hóa và bảo vệ bởi các công nghệ bảo mật hàng đầu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
