import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#1B5E20] transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Về UIT</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Về UIT</h1>
          <p className="text-xl text-white/90 max-w-[800px]">
            Bởi vì sách là thế giới
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-[#1B5E20] mb-4">Giới thiệu</h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  UIT được thành lập từ năm 2005, là một trong những thương hiệu xuất bản hàng đầu tại Việt Nam. 
                  Chúng tôi tự hào là cầu nối đưa những cuốn sách hay, những tác phẩm văn học đỉnh cao của thế giới 
                  đến với độc giả Việt Nam.
                </p>
                <p>
                  Với phương châm "Bởi vì sách là thế giới", UIT không ngừng nỗ lực mang đến những ấn phẩm chất lượng, 
                  từ văn học hiện đại đến kinh điển, từ sách thiếu nhi đến sách chuyên ngành, phục vụ nhu cầu đọc đa dạng 
                  của mọi lứa tuổi.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#1B5E20] mb-4">Sứ mệnh</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  Chúng tôi tin rằng sách không chỉ là nguồn tri thức mà còn là người bạn đồng hành trong cuộc sống. 
                  Sứ mệnh của UIT là làm phong phú thêm đời sống tinh thần của người Việt, góp phần xây dựng một 
                  xã hội yêu sách, yêu văn hóa.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#1B5E20] mb-4">Giá trị cốt lõi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-[#1B5E20] mb-2">Chất lượng</h4>
                  <p className="text-sm text-gray-700">
                    Cam kết mang đến những ấn phẩm có nội dung chất lượng cao, biên tập tỉ mỉ và in ấn đẹp mắt.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-[#1B5E20] mb-2">Đa dạng</h4>
                  <p className="text-sm text-gray-700">
                    Cung cấp thư mục sách phong phú từ nhiều thể loại, tác giả và quốc gia khác nhau.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-[#1B5E20] mb-2">Tận tâm</h4>
                  <p className="text-sm text-gray-700">
                    Luôn lắng nghe và phục vụ độc giả với thái độ chuyên nghiệp và nhiệt tình.
                  </p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-[#1B5E20] mb-2">Đổi mới</h4>
                  <p className="text-sm text-gray-700">
                    Không ngừng sáng tạo trong cách tiếp cận và phát triển các sản phẩm văn hóa.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-bold text-[#1B5E20] mb-4">Các mốc quan trọng</h3>
              <div className="space-y-6">
                {[
                  { year: '2005', title: 'Thành lập UIT', desc: 'Ra đời với tầm nhìn trở thành nhà xuất bản hàng đầu Việt Nam' },
                  { year: '2010', title: 'Mở rộng hệ thống', desc: 'Phát triển mạng lưới hiệu sách trên toàn quốc' },
                  { year: '2015', title: 'Chuyển đổi số', desc: 'Ra mắt nền tảng thương mại điện tử và ứng dụng di động' },
                  { year: '2020', title: 'Mở rộng quốc tế', desc: 'Hợp tác với các nhà xuất bản hàng đầu thế giới' },
                ].map((item) => (
                  <div key={item.year} className="flex gap-4">
                    <div className="text-[#1B5E20] shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#1B5E20]/10 flex items-center justify-center text-sm font-semibold">
                        {item.year}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-1">{item.title}</h5>
                      <p className="text-sm text-gray-700">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-[#1B5E20] mb-4">Thông tin liên hệ</h4>
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Địa chỉ:</p>
                  <p>59 Đỗ Quang, Trung Hoà, Cầu Giấy, Hà Nội</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Email:</p>
                  <p>contact@nhanam.vn</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Điện thoại:</p>
                  <p>024 3512 3456</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Giờ làm việc:</p>
                  <p>Thứ 2 - Thứ 6: 8:00 - 17:30</p>
                  <p>Thứ 7: 9:00 - 12:00</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1B5E20] text-white p-6 rounded-lg">
              <h4 className="font-semibold text-white mb-3">Kết nối với chúng tôi</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
