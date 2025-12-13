import { ChevronRight, MapPin, Phone, Clock } from 'lucide-react';
import { useState } from 'react';

interface StoresPageProps {
  onNavigate: (page: string) => void;
}

const stores = [
  {
    id: 1,
    name: 'Nhã Nam - Cầu Giấy',
    address: '59 Đỗ Quang, Trung Hoà, Cầu Giấy, Hà Nội',
    phone: '024 3512 3456',
    hours: 'Thứ 2 - CN: 8:00 - 21:00',
    city: 'Hà Nội',
  },
  {
    id: 2,
    name: 'Nhã Nam - Hoàn Kiếm',
    address: '45 Tràng Tiền, Hoàn Kiếm, Hà Nội',
    phone: '024 3826 7890',
    hours: 'Thứ 2 - CN: 9:00 - 21:00',
    city: 'Hà Nội',
  },
  {
    id: 3,
    name: 'Nhã Nam - Đống Đa',
    address: '125 Láng Hạ, Đống Đa, Hà Nội',
    phone: '024 3514 2468',
    hours: 'Thứ 2 - CN: 8:30 - 20:30',
    city: 'Hà Nội',
  },
  {
    id: 4,
    name: 'Nhã Nam - Quận 1',
    address: '185 Bà Huyện Thanh Quan, Quận 3, TP. Hồ Chí Minh',
    phone: '028 3930 1234',
    hours: 'Thứ 2 - CN: 8:00 - 21:30',
    city: 'TP. Hồ Chí Minh',
  },
  {
    id: 5,
    name: 'Nhã Nam - Bình Thạnh',
    address: '280 Điện Biên Phủ, Bình Thạnh, TP. Hồ Chí Minh',
    phone: '028 3512 5678',
    hours: 'Thứ 2 - CN: 8:00 - 21:00',
    city: 'TP. Hồ Chí Minh',
  },
  {
    id: 6,
    name: 'Nhã Nam - Thủ Đức',
    address: '15 Võ Văn Ngân, Thủ Đức, TP. Hồ Chí Minh',
    phone: '028 3897 4321',
    hours: 'Thứ 2 - CN: 9:00 - 21:00',
    city: 'TP. Hồ Chí Minh',
  },
  {
    id: 7,
    name: 'Nhã Nam - Đà Nẵng',
    address: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    phone: '0236 3654 789',
    hours: 'Thứ 2 - CN: 8:30 - 21:00',
    city: 'Đà Nẵng',
  },
  {
    id: 8,
    name: 'Nhã Nam - Cần Thơ',
    address: '67 Mậu Thân, Ninh Kiều, Cần Thơ',
    phone: '0292 3821 654',
    hours: 'Thứ 2 - CN: 8:00 - 20:30',
    city: 'Cần Thơ',
  },
];

const cities = ['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'];

export function StoresPage({ onNavigate }: StoresPageProps) {
  const [selectedCity, setSelectedCity] = useState('Tất cả');

  const filteredStores = selectedCity === 'Tất cả' 
    ? stores 
    : stores.filter(store => store.city === selectedCity);

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
            <span className="text-gray-900">Hệ thống hiệu sách</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-white mb-4">Hệ thống hiệu sách</h1>
          <p className="text-xl text-white/90 max-w-[800px]">
            Với {stores.length} cửa hàng trên toàn quốc, Nhã Nam luôn sẵn sàng phục vụ bạn
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Filter by City */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCity === city
                    ? 'bg-[#1B5E20] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredStores.map(store => (
            <div key={store.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-[#1B5E20] mb-4">{store.name}</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <p className="text-gray-700">{store.address}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                  <p className="text-gray-700">{store.phone}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                  <p className="text-gray-700">{store.hours}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-[#1B5E20] hover:underline text-sm">
                  Xem bản đồ →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-gray-50 p-8 rounded-lg">
          <h3 className="text-[#1B5E20] mb-4">Lưu ý khi đến cửa hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div>
              <h5 className="text-gray-900 mb-2">Đặt sách trước</h5>
              <p className="text-sm">
                Để đảm bảo sách có sẵn, bạn có thể gọi điện đặt trước hoặc đặt hàng online và nhận tại cửa hàng.
              </p>
            </div>
            <div>
              <h5 className="text-gray-900 mb-2">Tư vấn miễn phí</h5>
              <p className="text-sm">
                Đội ngũ nhân viên của chúng tôi luôn sẵn sàng tư vấn và giới thiệu sách phù hợp với nhu cầu của bạn.
              </p>
            </div>
            <div>
              <h5 className="text-gray-900 mb-2">Không gian đọc sách</h5>
              <p className="text-sm">
                Các cửa hàng đều có không gian thoải mái để bạn có thể ngồi đọc thử sách trước khi quyết định mua.
              </p>
            </div>
            <div>
              <h5 className="text-gray-900 mb-2">Sự kiện giao lưu</h5>
              <p className="text-sm">
                Thường xuyên tổ chức các buổi giao lưu với tác giả, ký tặng sách và các hoạt động văn hóa khác.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
