import { ChevronRight, MapPin, Briefcase, Clock, Users } from 'lucide-react';
import { useState } from 'react';

interface CareersPageProps {
  onNavigate: (page: string) => void;
}

const jobPostings = [
  {
    id: 1,
    title: 'Biên tập viên Văn học',
    department: 'Biên tập',
    location: 'Hà Nội',
    type: 'Full-time',
    experience: '2-3 năm',
    description: 'Tìm kiếm biên tập viên có đam mê văn học, am hiểu về xu hướng xuất bản và có khả năng làm việc với tác giả.',
  },
  {
    id: 2,
    title: 'Nhân viên Marketing Online',
    department: 'Marketing',
    location: 'TP. Hồ Chí Minh',
    type: 'Full-time',
    experience: '1-2 năm',
    description: 'Chịu trách nhiệm quản lý các kênh social media, lập kế hoạch marketing và tổ chức sự kiện online.',
  },
  {
    id: 3,
    title: 'Nhân viên Bán hàng Hiệu sách',
    department: 'Bán hàng',
    location: 'Đà Nẵng',
    type: 'Full-time',
    experience: 'Không yêu cầu',
    description: 'Tư vấn khách hàng, quản lý sách tại hiệu sách và tham gia các hoạt động bán hàng.',
  },
  {
    id: 4,
    title: 'Graphic Designer',
    department: 'Thiết kế',
    location: 'Hà Nội',
    type: 'Full-time',
    experience: '2+ năm',
    description: 'Thiết kế bìa sách, layout, và các tài liệu marketing. Yêu cầu có portfolio ấn tượng.',
  },
  {
    id: 5,
    title: 'Content Writer',
    department: 'Nội dung',
    location: 'Remote',
    type: 'Part-time',
    experience: '1+ năm',
    description: 'Viết bài review sách, bài blog về văn học và tạo nội dung cho các kênh truyền thông.',
  },
  {
    id: 6,
    title: 'Chuyên viên Kho vận',
    department: 'Vận hành',
    location: 'Hà Nội',
    type: 'Full-time',
    experience: '1-2 năm',
    description: 'Quản lý hàng hóa, kiểm soát tồn kho và điều phối vận chuyển sách.',
  },
];

const departments = ['Tất cả', 'Biên tập', 'Marketing', 'Bán hàng', 'Thiết kế', 'Nội dung', 'Vận hành'];

export function CareersPage({ onNavigate }: CareersPageProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('Tất cả');
  const [selectedJob, setSelectedJob] = useState<number | null>(null);

  const filteredJobs = selectedDepartment === 'Tất cả' 
    ? jobPostings 
    : jobPostings.filter(job => job.department === selectedDepartment);

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
            <span className="text-gray-900">Tuyển dụng</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#1B5E20] text-white py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h1 className="text-white mb-4">Cơ hội nghề nghiệp</h1>
          <p className="text-xl text-white/90 max-w-[800px]">
            Gia nhập đội ngũ Nhã Nam - Nơi đam mê văn hóa đọc được nuôi dưỡng
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Why Join Us */}
        <div className="mb-12">
          <h2 className="text-[#1B5E20] mb-6">Tại sao chọn Nhã Nam?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#1B5E20]" />
              </div>
              <h4 className="text-gray-900 mb-2">Môi trường sáng tạo</h4>
              <p className="text-sm text-gray-700">
                Làm việc trong môi trường năng động, sáng tạo và đầy cảm hứng
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="w-6 h-6 text-[#1B5E20]" />
              </div>
              <h4 className="text-gray-900 mb-2">Phát triển nghề nghiệp</h4>
              <p className="text-sm text-gray-700">
                Cơ hội thăng tiến rõ ràng và đào tạo chuyên môn liên tục
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h4 className="text-gray-900 mb-2">Đam mê sách</h4>
              <p className="text-sm text-gray-700">
                Làm việc với những cuốn sách hay nhất và gặp gỡ tác giả nổi tiếng
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h4 className="text-gray-900 mb-2">Lương thưởng hấp dẫn</h4>
              <p className="text-sm text-gray-700">
                Thu nhập cạnh tranh và các chế độ phúc lợi đầy đủ
              </p>
            </div>
          </div>
        </div>

        {/* Job Filter */}
        <div className="mb-8">
          <h3 className="text-[#1B5E20] mb-4">Vị trí đang tuyển ({filteredJobs.length})</h3>
          <div className="flex flex-wrap gap-3">
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-[#1B5E20] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-4 mb-12">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div 
                className="p-6 cursor-pointer"
                onClick={() => setSelectedJob(selectedJob === job.id ? null : job.id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-gray-900 mb-2">{job.title}</h4>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        <span>{job.department}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-[#1B5E20] text-white px-6 py-2 rounded-lg hover:bg-[#145016] transition-colors self-start md:self-center">
                    Ứng tuyển
                  </button>
                </div>
                
                {selectedJob === job.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-700 mb-4">{job.description}</p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h5 className="text-gray-900 mb-2">Yêu cầu kinh nghiệm:</h5>
                      <p className="text-sm text-gray-700">{job.experience}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Application Process */}
        <div className="bg-gray-50 p-8 rounded-lg">
          <h3 className="text-[#1B5E20] mb-6">Quy trình tuyển dụng</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1B5E20] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">1</span>
              </div>
              <h5 className="text-gray-900 mb-2">Nộp hồ sơ</h5>
              <p className="text-sm text-gray-700">
                Gửi CV và thư xin việc qua email
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1B5E20] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">2</span>
              </div>
              <h5 className="text-gray-900 mb-2">Sơ tuyển</h5>
              <p className="text-sm text-gray-700">
                Xét duyệt hồ sơ trong 3-5 ngày
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1B5E20] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">3</span>
              </div>
              <h5 className="text-gray-900 mb-2">Phỏng vấn</h5>
              <p className="text-sm text-gray-700">
                Phỏng vấn trực tiếp hoặc online
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#1B5E20] text-white rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">4</span>
              </div>
              <h5 className="text-gray-900 mb-2">Nhận việc</h5>
              <p className="text-sm text-gray-700">
                Nhận offer và bắt đầu làm việc
              </p>
            </div>
          </div>
        </div>

        {/* Contact for Application */}
        <div className="mt-8 bg-[#1B5E20] text-white p-8 rounded-lg">
          <h3 className="text-white mb-4">Gửi hồ sơ ứng tuyển</h3>
          <p className="text-white/90 mb-4">
            Vui lòng gửi CV và thư xin việc về email: <strong>tuyendung@nhanam.vn</strong>
          </p>
          <p className="text-sm text-white/80">
            Tiêu đề email: [Vị trí ứng tuyển] - Họ và tên
          </p>
        </div>
      </div>
    </div>
  );
}
