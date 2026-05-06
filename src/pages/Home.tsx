import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useRooms } from '../context/RoomContext';
import RoomCard from '../components/RoomCard';
import { toast } from 'sonner';
import { 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Users, 
  Building2, 
  Star,
  Quote,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Zap,
  Shield
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import Contact from './Contact';
import { DISTRICTS } from '../constants';

const StatItem = ({ icon: Icon, label, value, suffix = "" }: { icon: any, label: string, value: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    let totalMiliseconds = 2000;
    let incrementTime = (totalMiliseconds / end);

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex flex-col items-center text-center p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
      <div className="w-16 h-16 bg-paper rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform duration-500">
        <Icon size={32} />
      </div>
      <span className="text-4xl md:text-5xl font-serif font-bold text-primary mb-2">
        {count}{suffix}
      </span>
      <span className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
};

const DEFAULT_TESTIMONIALS = [
  {
    id: 'default-1',
    name: "Nguyễn Minh Anh",
    role: "Sinh viên ĐH Công Thương",
    content: "Phòng ở đây thực sự rất mới và hiện đại. Anh Duy hỗ trợ nhiệt tình, thủ tục nhanh gọn. Rất hài lòng!",
    avatar: "https://picsum.photos/seed/student1/100/100",
    rating: 5
  },
  {
    id: 'default-2',
    name: "Trần Hoàng Nam",
    role: "Nhân viên văn phòng",
    content: "An ninh cực kỳ tốt, khóa vân tay và camera 24/7 khiến mình rất yên tâm khi đi làm xa. Giá cả hợp lý so với chất lượng.",
    avatar: "https://picsum.photos/seed/office-worker1/100/100",
    rating: 5
  },
  {
    id: 'default-3',
    name: "Lê Thị Thu Thảo",
    role: "Người mẫu tự do",
    content: "Không gian thiết kế rất có gu, ánh sáng tự nhiên tràn ngập. Đây là nơi mình có thể nghỉ ngơi thực sự sau ngày dài.",
    avatar: "https://picsum.photos/seed/girl1/100/100",
    rating: 5
  }
];

export default function Home() {
  const { rooms, reviews } = useRooms();
  const { scrollY } = useScroll();
  
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const featuredRooms = rooms.filter((r) => r.isFeatured).slice(0, 5);

  const approvedReviews = reviews.filter(r => r.status === 'approved');

  const allTestimonials = approvedReviews.length > 0 ? approvedReviews : DEFAULT_TESTIMONIALS;
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      setItemsToShow(window.innerWidth < 768 ? 1 : 3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => 
      prev + 1 >= allTestimonials.length ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setTestimonialIndex((prev) => 
      prev - 1 < 0 ? allTestimonials.length - 1 : prev - 1
    );
  };

  // Helper to get circular slice of testimonials
  const visibleTestimonials = Array.from({ length: itemsToShow }).map((_, i) => {
    const index = (testimonialIndex + i) % allTestimonials.length;
    return allTestimonials[index];
  });

  return (
    <div className="space-y-0 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            style={{ y: heroY, opacity: heroOpacity }}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Hero"
            className="w-full h-full object-cover brightness-[0.4]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-primary/80"></div>
        </div>
        
        <div className="relative z-10 max-w-full mx-auto px-6 sm:px-12 lg:px-24 w-full py-32 md:py-0">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex items-center space-x-3 text-accent font-bold tracking-[0.4em] uppercase text-[10px] mb-8 bg-accent/10 px-4 py-2 rounded-full backdrop-blur-md border border-accent/20">
                <Sparkles size={12} />
                <span>Nâng tầm chuẩn sống mới</span>
              </span>
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-[0.9] tracking-tighter mb-10">
                Duy <br className="hidden sm:block" />
                <span className="text-accent italic">Tìm Trọ.</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <p className="text-lg md:text-xl text-white/70 mb-12 leading-relaxed font-light">
                Hệ thống quản lý và cho thuê phòng trọ cao cấp hàng đầu khu vực Tân Phú, Tân Bình. Nơi khởi đầu cho cuộc sống hiện đại và tiện nghi của bạn.
              </p>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to="/rooms"
                  className="group relative bg-accent hover:bg-white text-white hover:text-primary px-12 py-6 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-accent/20 flex items-center justify-center space-x-3 overflow-hidden"
                >
                  <span className="relative z-10">Khám phá phòng ngay</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                </Link>
                <a
                  href="#contact"
                  className="bg-white/5 hover:bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-6 rounded-2xl font-bold text-lg transition-all flex items-center justify-center"
                >
                  Liên hệ tư vấn
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating Badges */}
        <div className="absolute right-12 bottom-24 hidden xl:block">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-[3rem] shadow-2xl max-w-xs"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white">
                <Shield size={24} />
              </div>
              <span className="text-white font-bold">An ninh tuyệt đối</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">Hệ thống khóa vân tay, camera 24/7 và quản lý chuyên nghiệp.</p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-3 text-white/30"
        >
           <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Cuộn xuống</span>
           <div className="w-px h-16 bg-gradient-to-b from-white/30 to-transparent"></div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white relative z-20 -mt-12 rounded-t-[4rem]">
        <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatItem icon={Building2} label="Phòng trọ cao cấp" value={150} suffix="+" />
            <StatItem icon={Users} label="Khách hàng tin dùng" value={500} suffix="+" />
            <StatItem icon={MapPin} label="Khu vực trọng điểm" value={3} />
            <StatItem icon={Star} label="Tỷ lệ hài lòng" value={98} suffix="%" />
          </div>
        </div>
      </section>

      {/* Districts Section */}
      <section className="py-32 bg-paper overflow-hidden">
        <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24">
          <div className="text-center mb-20">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-accent font-bold text-xs uppercase tracking-[0.4em] mb-4 block"
            >
              Vị trí đắc địa
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-serif font-bold text-primary mb-6"
            >
              Khu vực <span className="italic text-accent">Trọng điểm</span>
            </motion.h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg font-light">
              Chúng tôi tập trung phát triển tại các khu vực sầm uất, thuận tiện giao thông và đầy đủ tiện ích ngoại khu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {DISTRICTS.map((district, idx) => {
              const districtImages: Record<string, string> = {
                'Tân Phú': 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80',
                'Tân Bình': 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
                'Bình Tân': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
              };
              
              return (
                <motion.div
                  key={district}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative h-[500px] rounded-[3rem] overflow-hidden cursor-pointer shadow-xl"
                >
                  <img
                    src={districtImages[district] || `https://picsum.photos/seed/${district}-apartment/800/1000`}
                    alt={district}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute bottom-10 left-10 right-10">
                    <h3 className="text-3xl font-serif font-bold text-white mb-4">Quận {district}</h3>
                    <p className="text-white/60 mb-6 line-clamp-2 text-sm leading-relaxed">Khu vực năng động với nhiều tiện ích, trường học và trung tâm mua sắm sầm uất.</p>
                    <Link
                      to={`/rooms?district=${district}`}
                      className="inline-flex items-center space-x-3 text-accent font-bold text-sm uppercase tracking-widest group/btn"
                    >
                      <span>Xem phòng tại đây</span>
                      <ChevronRight size={16} className="group-hover/btn:translate-x-2 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section id="rooms" className="py-32 bg-white">
        <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
            <div className="max-w-2xl">
              <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Sản phẩm đặc quyền</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary leading-tight">
                Không gian sống <br /> <span className="italic text-accent">Đáng mơ ước</span>
              </h2>
            </div>
            <Link to="/rooms" className="group flex items-center space-x-4 text-primary font-bold hover:text-accent transition-all">
              <span className="text-xl">Tất cả phòng trọ</span>
              <div className="w-14 h-14 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-accent group-hover:border-accent group-hover:text-white transition-all shadow-lg">
                <ArrowRight size={24} />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {featuredRooms.map((room, idx) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                viewport={{ once: true }}
              >
                <RoomCard room={room} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-accent via-transparent to-transparent"></div>
        </div>
        
        <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] mb-6 block">Tại sao chọn chúng tôi?</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-10 leading-tight">
                Chúng tôi mang lại <br /> <span className="italic text-accent">Giá trị thật</span>
              </h2>
              
              <div className="space-y-10">
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                    <Zap size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Tiện nghi hiện đại</h4>
                    <p className="text-white/50 leading-relaxed">Full nội thất cao cấp, máy lạnh, tủ lạnh, máy giặt riêng biệt cho từng phòng.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">An ninh 24/7</h4>
                    <p className="text-white/50 leading-relaxed">Hệ thống camera giám sát, khóa vân tay và quản lý tòa nhà chuyên nghiệp.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-6">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-accent shrink-0">
                    <Clock size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-2">Hỗ trợ tức thì</h4>
                    <p className="text-white/50 leading-relaxed">Đội ngũ kỹ thuật và CSKH luôn sẵn sàng xử lý mọi vấn đề trong vòng 2h.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, rotate: 5, scale: 0.9 }}
                whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white/5"
              >
                <img
                  src="https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=1000"
                  alt="Interior"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-white relative">
        <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24">
          <div className="flex flex-col md:flex-row justify-between items-center mb-20 gap-8">
            <div className="text-center md:text-left">
              <span className="text-accent font-bold text-xs uppercase tracking-[0.4em] mb-4 block">Tiếng nói khách hàng</span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary">Trải nghiệm <span className="italic text-accent">Thực tế</span></h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={prevTestimonial}
                className="w-14 h-14 rounded-full border border-primary/10 flex items-center justify-center text-primary hover:bg-accent hover:border-accent hover:text-white transition-all shadow-lg active:scale-95"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextTestimonial}
                className="w-14 h-14 rounded-full border border-primary/10 flex items-center justify-center text-primary hover:bg-accent hover:border-accent hover:text-white transition-all shadow-lg active:scale-95"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <AnimatePresence mode="popLayout" initial={false}>
                {visibleTestimonials.map((t, idx) => (
                  <motion.div
                    key={`testimonial-${t.name}-${idx}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-paper p-12 rounded-[3rem] relative border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full"
                  >
                    <Quote className="text-accent/20 absolute top-10 right-10" size={60} />
                    <div className="flex items-center space-x-4 mb-8">
                      <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-2xl object-cover shadow-lg" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="font-bold text-primary">{t.name}</h4>
                        <p className="text-xs text-gray-400 font-medium">{t.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed italic flex-grow">"{t.content}"</p>
                    <div className="flex space-x-1 mt-6">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={`testimonial-star-${t.name}-${i}`} 
                          size={14} 
                          className={(t.rating ? i < t.rating : true) ? 'fill-accent text-accent' : 'text-gray-200'} 
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Dots Pagination indicator */}
            <div className="flex justify-center mt-16 space-x-3">
              {allTestimonials.map((_, idx) => (
                <button
                  key={`testimonial-dot-${idx}`}
                  onClick={() => setTestimonialIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    testimonialIndex === idx ? 'w-10 bg-accent' : 'w-2 bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section Integration */}
      <section id="contact" className="bg-paper py-32">
        <Contact />
      </section>

      {/* Customer Review Section */}
      <section className="py-32 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-accent/5 skew-x-12 translate-x-1/4"></div>
        <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-10 leading-[0.9] tracking-tighter">
                Chia sẻ <br /> <span className="text-accent italic">Trải nghiệm của bạn.</span>
              </h2>
              <p className="text-xl md:text-2xl text-white/50 mb-14 font-light leading-relaxed">
                Ý kiến của bạn giúp Duy Tìm Trọ hoàn thiện hơn mỗi ngày. Hãy chia sẻ cảm nhận của bạn về dịch vụ của chúng tôi.
              </p>
              
              <div className="flex items-center space-x-4 text-white/30">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => <Star key={`trust-star-${i}`} size={20} className="fill-accent text-accent" />)}
                </div>
                <span className="text-sm font-medium uppercase tracking-widest">Hơn 500+ khách hàng tin dùng</span>
              </div>
            </div>

            <ReviewForm />
          </div>
        </div>
      </section>
    </div>
  );
}

const ReviewForm = () => {
  const { addReview } = useRooms();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const content = formData.get('content') as string;
    const role = formData.get('role') as string;

    if (!name.trim() || !content.trim()) {
      toast.error('Vui lòng nhập đầy đủ họ tên và nội dung đánh giá');
      return;
    }

    setIsSubmitting(true);
    try {
      await addReview({
        name,
        content,
        role: role || 'Khách hàng',
        rating,
        avatar: `https://picsum.photos/seed/${name}/100/100`
      });
      setIsSuccess(true);
      toast.success('Cảm ơn bạn đã gửi đánh giá! Chúng tôi sẽ kiểm duyệt và hiển thị sớm nhất.');
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] text-center"
      >
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-white mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-serif font-bold text-white mb-4">Gửi đánh giá thành công!</h3>
        <p className="text-white/60 leading-relaxed">
          Cảm ơn bạn đã dành thời gian chia sẻ trải nghiệm. Ý kiến của bạn là động lực để chúng tôi phát triển.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="mt-8 text-accent font-bold uppercase tracking-widest text-sm hover:text-white transition-colors"
        >
          Gửi thêm đánh giá khác
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[3rem] space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-2">Họ và tên *</label>
          <input
            name="name"
            type="text"
            required
            placeholder="Nguyễn Văn A"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-2">Nghề nghiệp/Vai trò</label>
          <input
            name="role"
            type="text"
            placeholder="Sinh viên, Nhân viên..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-2">Đánh giá của bạn *</label>
        <div className="flex space-x-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
              {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                  <button
                    key={`rating-star-${starValue}`}
                    type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(0)}
              >
                <Star
                  size={28}
                  className={`${
                    starValue <= (hover || rating) ? 'fill-accent text-accent' : 'text-white/20'
                  } transition-colors`}
                />
              </button>
            );
          })}
          <span className="ml-4 text-white/60 font-medium self-center">
            {rating}/5 sao
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-white/40 text-xs font-bold uppercase tracking-widest ml-2">Nội dung chia sẻ *</label>
        <textarea
          name="content"
          required
          rows={4}
          placeholder="Hãy chia sẻ cảm nhận của bạn về phòng trọ, dịch vụ hỗ trợ..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-accent hover:bg-white text-white hover:text-primary py-6 rounded-2xl font-bold text-lg transition-all shadow-2xl shadow-accent/20 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <span>Gửi đánh giá ngay</span>
            <ArrowRight size={20} />
          </>
        )}
      </button>
    </form>
  );
};
