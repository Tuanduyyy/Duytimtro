import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, MapPin } from 'lucide-react';
import { CONTACT_INFO } from '../constants';
import { useRooms } from '../context/RoomContext';

export default function Footer() {
  const { settings } = useRooms();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                D
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Duy <span className="text-orange-500">Tìm Trọ</span>
              </span>
            </Link>
            <p className="text-gray-500 max-w-sm leading-relaxed">
              Chúng tôi cung cấp giải pháp tìm kiếm phòng trọ nhanh chóng, minh bạch và uy tín tại khu vực TP.HCM. Cam kết mang lại không gian sống tốt nhất cho bạn.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href={settings.fanpage} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6">Liên kết</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-500 hover:text-orange-500 transition-colors">Trang chủ</Link></li>
              <li><Link to="/rooms" className="text-gray-500 hover:text-orange-500 transition-colors">Danh sách phòng</Link></li>
              <li><Link to="/about" className="text-gray-500 hover:text-orange-500 transition-colors">Giới thiệu</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-orange-500 transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6">Dịch vụ</h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">Tìm phòng trọ</a></li>
              <li><a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">Đăng tin cho thuê</a></li>
              <li><a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">Tư vấn pháp lý</a></li>
              <li><a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">Hỗ trợ 24/7</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 mb-6">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-500">
                <MapPin size={18} className="text-orange-500 shrink-0 mt-1" />
                <span>{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-500">
                <Phone size={18} className="text-orange-500 shrink-0" />
                <a href={`tel:${settings.hotline}`} className="hover:text-orange-500 transition-colors uppercase">{settings.hotline}</a>
              </li>
              <li className="flex items-center space-x-3 text-gray-500 min-w-0">
                <Facebook size={18} className="text-orange-500 shrink-0" />
                <a href={settings.fanpage} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors truncate">Facebook Duy Tìm Trọ</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Duy Tìm Trọ. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Chính sách bảo mật</a>
            <a href="#" className="text-gray-400 hover:text-gray-600 text-sm">Điều khoản dịch vụ</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
