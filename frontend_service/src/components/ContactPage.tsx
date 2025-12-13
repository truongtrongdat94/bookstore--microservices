import { ChevronRight, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#1B5E20] transition-colors">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">Liên hệ</span>
          </div>
        </div>
      </div>

      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-white/90 max-w-[800px]">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-[#1B5E20] mb-6">Gửi tin nhắn cho chúng tôi</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 mb-2">Họ và tên <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent" placeholder="Nhập họ và tên" />
                  </div>
                  <div>
                    <label className="block text-gray-900 mb-2">Email <span className="text-red-500">*</span></label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent" placeholder="example@email.com" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-900 mb-2">Số điện thoại</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent" placeholder="0123 456 789" />
                  </div>
                  <div>
                    <label className="block text-gray-900 mb-2">Chủ đề <span className="text-red-500">*</span></label>
                    <select name="subject" value={formData.subject} onChange={handleChange} required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent">
                      <option value="">Chọn chủ đề</option>
                      <option value="order">Đặt hàng</option>
                      <option value="product">Sản phẩm</option>
                      <option value="delivery">Giao hàng</option>
                      <option value="return">Đổi trả</option>
                      <option value="cooperation">Hợp tác</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-900 mb-2">Nội dung <span className="text-red-500">*</span></label>
                  <textarea name="message" value={formData.message} onChange={handleChange} required rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B5E20] focus:border-transparent resize-none" placeholder="Nhập nội dung tin nhắn của bạn..." />
                </div>
                <button type="submit" className="w-full md:w-auto bg-[#1B5E20] text-white px-8 py-3 rounded-lg hover:bg-[#145016] transition-colors">Gửi tin nhắn</button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold text-[#1B5E20] mb-4">Trụ sở chính</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div><p className="text-gray-700">59 Đỗ Quang, Trung Hoà</p><p className="text-gray-700">Cầu Giấy, Hà Nội</p></div>
                </div>
                <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-gray-400 shrink-0" /><p className="text-gray-700">024 3512 3456</p></div>
                <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-gray-400 shrink-0" /><p className="text-gray-700">contact@nhanam.vn</p></div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div><p className="text-gray-700">Thứ 2 - Thứ 6: 8:00 - 17:30</p><p className="text-gray-700">Thứ 7: 9:00 - 12:00</p><p className="text-gray-700">Chủ nhật: Nghỉ</p></div>
                </div>
              </div>
            </div>

            <div className="bg-[#1B5E20] text-white p-6 rounded-lg">
              <h4 className="font-semibold text-white mb-4">Chăm sóc khách hàng</h4>
              <div className="space-y-3">
                <div><p className="text-white/80 text-sm mb-1">Hotline:</p><p className="text-xl font-bold">1900 1234</p></div>
                <div><p className="text-white/80 text-sm mb-1">Email hỗ trợ:</p><p>support@nhanam.vn</p></div>
                <div className="pt-3 border-t border-white/20"><p className="text-white/80 text-sm">Thời gian hỗ trợ:</p><p className="text-sm">8:00 - 21:00 (Thứ 2 - CN)</p></div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-[#1B5E20] mb-4">Kết nối với chúng tôi</h4>
              <div className="space-y-3">
                <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-[#1B5E20] transition-colors">
                  <div className="w-10 h-10 bg-[#1B5E20]/10 rounded-full flex items-center justify-center"><span className="text-sm">f</span></div><span>Facebook</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-[#1B5E20] transition-colors">
                  <div className="w-10 h-10 bg-[#1B5E20]/10 rounded-full flex items-center justify-center"><span className="text-sm">ig</span></div><span>Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-[#1B5E20] transition-colors">
                  <div className="w-10 h-10 bg-[#1B5E20]/10 rounded-full flex items-center justify-center"><span className="text-sm">yt</span></div><span>YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
