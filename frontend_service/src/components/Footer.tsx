import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#1B5E20] text-white mt-20">
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1 - Contact Info */}
          <div>
            <h4 className="font-semibold text-white mb-4">UIT</h4>
            <div className="space-y-2 text-sm text-white/90">
              <p>📍 59 Đỗ Quang, Trung Hoà, Cầu Giấy, Hà Nội</p>
              <p>📧 contact@nhanam.vn</p>
              <p>📞 024 3512 3456</p>
            </div>
          </div>

          {/* Column 2 - About */}
          <div>
            <h5 className="font-semibold text-white mb-4">Giới thiệu</h5>
            <ul className="space-y-2 text-sm text-white/90">
              <li><Link to="/about" className="hover:text-white transition-colors">Về UIT</Link></li>
              <li><Link to="/stores" className="hover:text-white transition-colors">Hệ thống hiệu sách</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Tuyển dụng</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Column 3 - Policies */}
          <div>
            <h5 className="font-semibold text-white mb-4">Chính sách</h5>
            <ul className="space-y-2 text-sm text-white/90">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/return-policy" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/shipping-payment" className="hover:text-white transition-colors">Thanh toán & vận chuyển</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm text-white/80">
          <p>© 2025 UIT. Bởi vì sách là thế giới.</p>
        </div>
      </div>
    </footer>
  );
}
