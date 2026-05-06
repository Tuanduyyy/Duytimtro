import React, { useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useRooms } from '../context/RoomContext';
import { MapPin, Phone, CheckCircle2, ChevronLeft, ChevronRight, Share2, Heart, ShieldCheck, Sparkles, X, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import RoomCard from '../components/RoomCard';
import { CONTACT_INFO } from '../constants';

export default function RoomDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { rooms, addMessage, favorites, toggleFavorite, settings } = useRooms();
  const room = rooms.find((r) => r.id === id);
  const [activeImage, setActiveImage] = useState(0);
  const isFavorite = id ? favorites.includes(id) : false;
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const similarRooms = useMemo(() => {
    if (!room) return [];
    return rooms
      .filter(r => r.id !== room.id && (r.district === room.district || Math.abs(r.price - room.price) < 1000000))
      .slice(0, 3);
  }, [rooms, room]);

  if (!room) {
    const fromFavorites = (location.state as any)?.from === 'favorites';
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h2 className="text-3xl font-serif font-bold text-primary mb-6">Không tìm thấy phòng trọ</h2>
        <Link 
          to={fromFavorites ? "/favorites" : "/rooms"} 
          state={fromFavorites ? { fromDetail: true } : { fromDetail: true }} 
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold"
        >
          {fromFavorites ? "Quay lại danh sách yêu thích" : "Quay lại danh sách"}
        </Link>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleContact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const phoneRegex = /^0\d{9,10}$/;

    if (!name.trim()) {
      toast.error('Vui lòng nhập họ tên');
      return;
    }

    if (!phoneRegex.test(phone)) {
      toast.error('Số điện thoại không hợp lệ (10-11 số, bắt đầu bằng 0)');
      return;
    }

    setFormStatus('submitting');
    
    try {
      await addMessage({
        name,
        phone,
        email: formData.get('email') as string,
        content: `Tôi quan tâm đến phòng: ${room.title}. Vui lòng tư vấn thêm.`,
        roomId: room.id,
      });
      setFormStatus('success');
    } catch (error) {
      console.error("Error sending message:", error);
      setFormStatus('idle');
      toast.error('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `Duy Tìm Trọ - ${room.title}`,
      text: `Xem ngay phòng trọ cực đẹp tại ${room.district}: ${room.title}. Giá chỉ ${formatPrice(room.price)}/tháng.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Handle cancellation silently
        if (err instanceof Error && (err.name === 'AbortError' || err.message.includes('Abort due to cancellation'))) {
          return;
        }
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết phòng trọ!');
    }
  };

  return (
    <div className="pb-24">
      {/* Breadcrumbs & Actions */}
      <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24 py-8 flex justify-between items-center">
        {(() => {
          const fromFavorites = (location.state as any)?.from === 'favorites';
          return (
            <Link 
              to={fromFavorites ? "/favorites" : "/rooms"} 
              state={{ fromDetail: true }} 
              className="flex items-center space-x-2 text-gray-400 hover:text-accent font-bold text-sm transition-colors"
            >
              <ChevronLeft size={20} />
              <span>{fromFavorites ? "Quay lại danh sách phòng yêu thích" : "Quay lại danh sách"}</span>
            </Link>
          );
        })()}
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleShare}
            className="w-12 h-12 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-accent hover:border-accent hover:scale-110 active:scale-95 transition-all shadow-lg shadow-black/5 flex items-center justify-center"
            title="Chia sẻ phòng này"
          >
            <Share2 size={22} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => room && toggleFavorite(room.id)}
            className={`w-12 h-12 bg-white border rounded-2xl transition-all shadow-lg hover:scale-110 active:scale-95 flex items-center justify-center ${
              isFavorite 
                ? 'text-red-500 border-red-100 shadow-red-500/10' 
                : 'text-gray-400 border-gray-100 hover:text-red-500 hover:border-red-100 shadow-black/5'
            }`}
          >
            <Heart size={22} fill={isFavorite ? 'currentColor' : 'none'} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Images & Info */}
          <div className="lg:col-span-8 space-y-12">
            {/* Image Gallery */}
            <div className="space-y-6">
              <div 
                className="relative aspect-[16/9] rounded-[3rem] overflow-hidden shadow-2xl cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              >
                <img
                  src={room.images[activeImage]}
                  alt={room.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {room.isFeatured && (
                  <div className="absolute top-8 left-8 bg-accent text-white text-xs font-bold uppercase tracking-[0.3em] px-5 py-2 rounded-full shadow-xl">
                    Premium Space
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                {room.images.map((img, idx) => (
                  <button
                    key={`gallery-${idx}`}
                    onClick={() => setActiveImage(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-accent scale-95 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Stats */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-accent/10 text-accent px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest">{room.district}</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 text-sm font-medium">Đăng ngày {new Date(room.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-8 leading-tight">{room.title}</h1>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8 border-y border-gray-50">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Giá thuê</p>
                  <p className="text-2xl font-bold text-accent">{formatPrice(room.price)}</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Diện tích</p>
                  <p className="text-2xl font-bold text-primary">{room.area} m²</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tiện ích</p>
                  <p className="text-2xl font-bold text-primary">{room.amenities.length}+</p>
                </div>
                <div className="text-center sm:text-left">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Trạng thái</p>
                   <p className={`text-lg font-bold flex items-center justify-center sm:justify-start space-x-1 ${
                     room.status === 'available' ? 'text-green-500' : 'text-red-500'
                   }`}>
                     {room.status === 'available' ? (
                       <>
                         <CheckCircle2 size={18} />
                         <span>Còn phòng</span>
                       </>
                     ) : (
                       <>
                         <X size={18} />
                         <span>Hết phòng</span>
                       </>
                     )}
                   </p>
                </div>
              </div>

              <div className="mt-10 flex items-start space-x-4 text-gray-600">
                <div className="w-12 h-12 bg-paper rounded-2xl flex items-center justify-center text-accent shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="font-bold text-primary mb-1">Vị trí không gian</p>
                  <p className="text-lg font-light leading-relaxed">{room.address}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-primary mb-8 flex items-center space-x-3">
                <Sparkles className="text-accent" size={24} />
                <span>Mô tả chi tiết</span>
              </h2>
              <div className="prose prose-lg text-gray-500 font-light leading-relaxed max-w-none">
                {room.description.split('\n').map((para, i) => (para ? <p key={`desc-para-${i}`} className="mb-4">{para}</p> : null))}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-primary mb-8">Tiện ích đẳng cấp</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {room.amenities.map((item) => (
                  <div key={`amenity-${item}`} className="flex items-center space-x-4 p-4 bg-paper rounded-2xl group hover:bg-accent transition-all">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-accent group-hover:text-primary transition-colors shadow-sm">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-white transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Contact Card */}
              <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                
                <h3 className="text-xl font-serif font-bold mb-6 relative z-10">Liên hệ đặt phòng</h3>
                
                {formStatus === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-accent/20">
                      <CheckCircle2 size={40} />
                    </div>
                    <h4 className="text-xl font-bold mb-2">Gửi thành công!</h4>
                    <p className="text-white/60 font-light">Duy sẽ liên hệ với bạn sớm nhất có thể.</p>
                    <button 
                      onClick={() => setFormStatus('idle')}
                      className="mt-8 text-accent font-bold hover:underline"
                    >
                      Gửi yêu cầu khác
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContact} className="space-y-4 relative z-10">
                    <div>
                      <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Họ và tên *</label>
                      <input
                        name="name"
                        required
                        type="text"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                      <div>
                        <label className="block text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Số điện thoại *</label>
                        <input
                          name="phone"
                          required
                          type="tel"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                          placeholder="0901 234 567"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={formStatus === 'submitting'}
                        className="w-full bg-accent hover:bg-white hover:text-primary text-white py-4 rounded-xl font-bold text-base transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
                      >
                        {formStatus === 'submitting' ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
                      </button>
                  </form>
                )}

                <div className="mt-10 pt-10 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-accent">
                      <Phone size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Hotline 24/7</p>
                      <a href={`tel:${settings.hotline}`} className="text-lg font-bold hover:text-accent transition-colors">{settings.hotline}</a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="bg-paper p-8 rounded-[2.5rem] border border-gray-100 flex items-center space-x-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-accent shadow-sm">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <p className="font-bold text-primary">Đảm bảo an toàn</p>
                  <p className="text-xs text-gray-500 font-light">Hợp đồng minh bạch, hỗ trợ cư dân trọn đời.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Rooms Section */}
        {similarRooms.length > 0 && (
          <div className="mt-32">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-2xl">
                <span className="text-accent font-bold text-sm uppercase tracking-[0.4em] mb-4 block">Xem thêm lựa chọn</span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight italic">Những căn phòng tương tự</h2>
              </div>
              <Link to="/rooms" className="text-primary font-bold hover:text-accent transition-colors flex items-center gap-2 group">
                <span>Khám phá tất cả</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {similarRooms.map((similarRoom) => (
                <div key={similarRoom.id}>
                  <RoomCard room={similarRoom} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-6xl h-full flex items-center justify-center"
            >
              <button 
                onClick={() => setIsLightboxOpen(false)}
                className="absolute top-0 right-0 m-4 p-3 bg-white/10 text-white rounded-full hover:bg-accent transition-colors z-10"
              >
                <X size={24} />
              </button>
              
              <button 
                onClick={() => setActiveImage(prev => (prev === 0 ? room.images.length - 1 : prev - 1))}
                className="absolute left-0 p-4 bg-white/10 text-white rounded-full hover:bg-accent transition-colors"
              >
                <ChevronLeft size={32} />
              </button>
              
              <img 
                src={room.images[activeImage]} 
                alt={room.title}
                className="max-w-full max-h-full object-contain shadow-2xl"
                referrerPolicy="no-referrer"
              />
              
              <button 
                onClick={() => setActiveImage(prev => (prev === room.images.length - 1 ? 0 : prev + 1))}
                className="absolute right-0 p-4 bg-white/10 text-white rounded-full hover:bg-accent transition-colors"
              >
                <ChevronRight size={32} />
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {room.images.map((_, i) => (
                  <div 
                    key={`dot-${i}`} 
                    className={`w-2 h-2 rounded-full ${i === activeImage ? 'bg-accent' : 'bg-white/20'}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sticky Mobile Contact Bar */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50 flex gap-3">
        <a
          href={`tel:${settings.hotline}`}
          className="flex-1 bg-primary text-white flex items-center justify-center gap-3 py-4 rounded-2xl font-bold shadow-2xl shadow-primary/30 active:scale-95 transition-all"
        >
          <Phone size={20} />
          <span>Gọi ngay</span>
        </a>
        <a
          href={settings.zalo}
          target="_blank"
          rel="noreferrer"
          className="bg-blue-500 text-white flex items-center justify-center p-4 rounded-2xl shadow-2xl shadow-blue-500/30 active:scale-95 transition-all"
        >
          <MessageCircle size={24} />
        </a>
      </div>
    </div>
  );
}
