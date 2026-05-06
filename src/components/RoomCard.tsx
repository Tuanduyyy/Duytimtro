import { Link } from 'react-router-dom';
import { MapPin, Maximize, Heart, ChevronRight } from 'lucide-react';
import { Room } from '../types';
import { motion } from 'motion/react';
import { useRooms } from '../context/RoomContext';

interface RoomCardProps {
  room: Room;
  onQuickView?: (room: Room) => void;
  viewMode?: 'grid' | 'list';
  linkState?: any;
  disableAnimation?: boolean;
}

export default function RoomCard({ room, onQuickView, viewMode = 'grid', linkState = { fromDetail: true }, disableAnimation = false }: RoomCardProps) {
  const { favorites, toggleFavorite } = useRooms();
  const isFavorite = favorites.includes(room.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        id={`room-card-${room.id}`}
        initial={disableAnimation ? false : { opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row relative"
      >
        <div className="md:w-1/3 lg:w-1/4 relative aspect-video md:aspect-auto overflow-hidden">
          <Link to={`/rooms/${room.id}`} state={linkState} className="block w-full h-full">
            <img
              src={room.images[0]}
              alt={room.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
          </Link>
          {room.isFeatured && (
            <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
              Premium
            </div>
          )}
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(room.id);
              }}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 ${
                isFavorite 
                  ? 'bg-accent text-white shadow-accent/30' 
                  : 'bg-white text-gray-400 hover:text-accent shadow-black/10'
              }`}
            >
              <Heart size={19} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <div className="flex-1 p-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2 text-accent text-[10px] font-bold uppercase tracking-widest">
                <span>{room.district}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span>{room.ward}</span>
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${
                room.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              }`}>
                {room.status === 'available' ? 'Còn phòng' : 'Hết phòng'}
              </div>
            </div>
            <Link to={`/rooms/${room.id}`} state={linkState}>
              <h3 className="text-2xl font-serif font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                {room.title}
              </h3>
            </Link>
            <div className="flex flex-wrap gap-2 mb-6">
              {room.amenities.slice(0, 4).map((amenity) => (
                <span key={amenity} className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 4 && (
                <span className="text-[10px] font-bold text-gray-300 px-2 py-1">+{room.amenities.length - 4}</span>
              )}
            </div>
            <div className="flex items-start space-x-2 text-gray-500 text-sm mb-6">
              <MapPin size={16} className="text-accent shrink-0 mt-0.5" />
              <p className="font-medium">{room.address}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-gray-50">
            <div className="flex items-center space-x-6">
              <div className="flex items-baseline space-x-1.5">
                <span className="text-accent font-bold text-2xl">
                  {formatPrice(room.price)}
                </span>
                <span className="text-gray-400 text-xs">/tháng</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <Maximize size={16} className="text-accent" />
                <span>{room.area}m²</span>
              </div>
            </div>
            <Link
              to={`/rooms/${room.id}`}
              state={linkState}
              className="bg-primary hover:bg-accent text-white px-8 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary/10"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      id={`room-card-${room.id}`}
      initial={disableAnimation ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative"
    >
      <div className="block relative aspect-[4/5] overflow-hidden">
        <Link to={`/rooms/${room.id}`} state={linkState} className="block w-full h-full">
          <img
            src={room.images[0]}
            alt={room.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none"></div>
        
        <div className="absolute top-4 left-4 flex flex-col items-start space-y-2 z-10">
          {room.isFeatured && (
            <div className="bg-accent text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
              Premium
            </div>
          )}
          <div className={`text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg ${
            room.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {room.status === 'available' ? 'Còn phòng' : 'Hết phòng'}
          </div>
        </div>

        <div className="absolute top-4 right-4 flex flex-col space-y-3 z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(room.id);
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-110 active:scale-95 ${
              isFavorite 
                ? 'bg-accent text-white shadow-accent/30' 
                : 'bg-white text-gray-400 hover:text-accent shadow-black/10'
            }`}
          >
            <Heart size={19} fill={isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
          </button>
          
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(room);
              }}
              className="w-10 h-10 bg-white text-primary rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-all shadow-xl shadow-black/10 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 hover:scale-110 active:scale-95 duration-300"
              title="Xem nhanh"
            >
              <Maximize size={17} strokeWidth={2.5} />
            </button>
          )}
        </div>
        
        <Link to={`/rooms/${room.id}`} state={linkState} className="absolute bottom-5 left-5 right-5 z-10">
          <div className="flex items-center space-x-2 text-white/80 text-[9px] font-bold uppercase tracking-widest mb-1.5">
            <span>{room.district}</span>
            <span className="w-1 h-1 bg-accent rounded-full"></span>
            <span>{room.area} m²</span>
          </div>
          <h3 className="text-lg font-serif font-bold text-white truncate leading-tight mb-1.5">
            {room.title}
          </h3>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-accent font-bold text-base">{formatPrice(room.price)}</span>
            <span className="text-white/60 text-[10px]">/tháng</span>
          </div>
        </Link>
      </div>

      <div className="p-5 bg-white">
        <div className="flex items-start space-x-2 text-gray-500 text-xs mb-4 min-h-[32px]">
          <MapPin size={14} className="text-accent shrink-0 mt-0.5" />
          <p className="truncate leading-snug font-medium">{room.address}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          <div className="flex items-center space-x-1.5 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            <Maximize size={12} className="text-accent" />
            <span>{room.area}m² Diện tích</span>
          </div>
          <Link
            to={`/rooms/${room.id}`}
            state={linkState}
            className="text-primary font-bold text-xs hover:text-accent transition-colors flex items-center space-x-1"
          >
            <span>Chi tiết</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

