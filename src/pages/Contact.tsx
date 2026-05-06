import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRooms } from '../context/RoomContext';
import { Facebook, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { CONTACT_INFO } from '../constants';

export default function Contact() {
  const location = useLocation();
  const { addMessage, settings } = useRooms();
  const state = location.state as { roomId?: string; roomTitle?: string } | null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    content: state?.roomTitle ? `Tôi muốn hỏi về phòng: ${state.roomTitle}` : '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập họ tên';
    
    const phoneRegex = /^0\d{9,10}$/;
    if (!formData.phone) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.content.trim()) newErrors.content = 'Vui lòng nhập nội dung';

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await addMessage({
        ...formData,
        roomId: state?.roomId,
      });

      setIsSubmitted(true);
      setFormData({ name: '', phone: '', email: '', content: '' });
      setErrors({});
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24 py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Contact Info */}
        <div>
          <span className="text-orange-500 font-bold text-sm uppercase tracking-widest">Liên hệ với chúng tôi</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-8 leading-tight">
            Bạn cần hỗ trợ? <br /> Đừng ngần ngại liên hệ.
          </h1>
          <p className="text-lg text-gray-500 mb-12 leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn về dịch vụ tìm phòng trọ.
          </p>

          <div className="space-y-8">
            <div className="flex items-start space-x-6">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center text-orange-500 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Điện thoại</p>
                <p className="text-xl font-bold text-gray-900">{settings.hotline}</p>
              </div>
            </div>

            <div className="flex items-start space-x-6 min-w-0">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center text-orange-500 shrink-0">
                <Facebook size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Facebook</p>
                <a 
                  href={settings.fanpage} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xl font-bold text-gray-900 break-all hover:text-orange-500 transition-colors"
                >
                  Kết nối Facebook
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center text-orange-500 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Văn phòng</p>
                <p className="text-xl font-bold text-gray-900">{CONTACT_INFO.address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:max-w-xl">
          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-orange-500/5 border border-gray-100">
            {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Gửi yêu cầu thành công!</h3>
              <p className="text-gray-500 mb-8">
                Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi lại bạn trong thời gian sớm nhất.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-orange-500 font-bold hover:underline"
              >
                Gửi thêm yêu cầu khác
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Họ và tên *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all text-sm ${
                      errors.name ? 'border-red-500 focus:ring-red-100' : 'border-transparent focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500'
                    }`}
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">Số điện thoại *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all text-sm ${
                      errors.phone ? 'border-red-500 focus:ring-red-100' : 'border-transparent focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500'
                    }`}
                    placeholder="0901234567"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Email (không bắt buộc)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all text-sm ${
                    errors.email ? 'border-red-500 focus:ring-red-100' : 'border-transparent focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500'
                  }`}
                  placeholder="email@example.com"
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Nội dung yêu cầu *</label>
                <textarea
                  rows={3}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all resize-none text-sm ${
                    errors.content ? 'border-red-500 focus:ring-red-100' : 'border-transparent focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500'
                  }`}
                  placeholder="Tôi muốn xem phòng..."
                ></textarea>
                {errors.content && <p className="text-red-500 text-[10px] mt-1 font-medium">{errors.content}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-base transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center space-x-3"
              >
                <Send size={20} />
                <span>Gửi tin nhắn</span>
              </button>
            </form>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
