import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRooms } from '../context/RoomContext';
import RoomCard from '../components/RoomCard';
import { 
  Heart, 
  Search, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  X, 
  ChevronDown, 
  Clock, 
  ArrowUpWideNarrow, 
  ArrowDownWideNarrow, 
  Maximize,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { Link, useLocation, useNavigationType } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { COMMON_AMENITIES } from '../constants';
import { Slider } from '@/components/ui/slider';

export default function Favorites() {
  const { rooms, favorites, amenities } = useRooms();
  const location = useLocation();
  const navType = useNavigationType();

  // Restoration states
  const hasRestoredScroll = useRef(false);
  const [isRestoring, setIsRestoring] = useState(() => (location.state as any)?.fromDetail || navType === 'POP');

  const [searchTerm, setSearchTerm] = useState(() => {
    const saved = sessionStorage.getItem('favoritesSearchTerm');
    return saved ? JSON.parse(saved) : '';
  });
  const [districtFilter, setDistrictFilter] = useState(() => {
    const saved = sessionStorage.getItem('favoritesDistrictFilter');
    return saved ? JSON.parse(saved) : 'All';
  });
  const [wardFilter, setWardFilter] = useState(() => {
    const saved = sessionStorage.getItem('favoritesWardFilter');
    return saved ? JSON.parse(saved) : 'All';
  });
  const [streetFilter, setStreetFilter] = useState(() => {
    const saved = sessionStorage.getItem('favoritesStreetFilter');
    return saved ? JSON.parse(saved) : 'All';
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('favoritesSelectedAmenities');
    return saved ? JSON.parse(saved) : [];
  });
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const saved = sessionStorage.getItem('favoritesPriceRange');
    return saved ? JSON.parse(saved) : [0, 20000000];
  });
  const [sortBy, setSortBy] = useState(() => {
    const saved = sessionStorage.getItem('favoritesSortBy');
    return saved ? JSON.parse(saved) : 'newest';
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = sessionStorage.getItem('favoritesViewMode');
    return (saved as 'grid' | 'list') || 'grid';
  });
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem('favoritesCurrentPage');
    return saved ? parseInt(saved, 10) : 1;
  });
  const favoritesRef = useRef<HTMLDivElement>(null);
  
  const roomsPerPage = 5;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === 'list') {
        setViewMode('grid');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const uniqueWards = useMemo(() => {
    const favoriteRooms = rooms.filter(r => favorites.includes(r.id));
    const wards = favoriteRooms
      .filter(r => districtFilter === 'All' || r.district === districtFilter)
      .map(r => r.ward)
      .filter(Boolean);
    return ['All', ...new Set(wards)];
  }, [rooms, favorites, districtFilter]);

  const uniqueStreets = useMemo(() => {
    const favoriteRooms = rooms.filter(r => favorites.includes(r.id));
    const streets = favoriteRooms
      .filter(r => (districtFilter === 'All' || r.district === districtFilter) && (wardFilter === 'All' || r.ward === wardFilter))
      .map(r => r.street)
      .filter(Boolean);
    return ['All', ...new Set(streets)];
  }, [rooms, favorites, districtFilter, wardFilter]);

  const filteredFavoriteRooms = useMemo(() => {
    let result = rooms.filter(room => favorites.includes(room.id));
    
    result = result.filter((room) => {
      const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          room.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDistrict = districtFilter === 'All' || room.district === districtFilter;
      const matchesWard = wardFilter === 'All' || room.ward === wardFilter;
      const matchesStreet = streetFilter === 'All' || room.street === streetFilter;
      const matchesPrice = room.price >= priceRange[0] && room.price <= priceRange[1];
      const matchesAmenities = selectedAmenities.length === 0 || selectedAmenities.every(a => room.amenities.includes(a));
      
      return matchesSearch && matchesDistrict && matchesWard && matchesStreet && matchesPrice && matchesAmenities;
    });

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        return [...result].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...result].sort((a, b) => b.price - a.price);
      case 'area-desc':
        return [...result].sort((a, b) => b.area - a.area);
      case 'newest':
      default:
        return [...result].sort((a, b) => {
          const dateA = a.createdAt?.seconds ? a.createdAt.seconds : new Date(a.createdAt).getTime();
          const dateB = b.createdAt?.seconds ? b.createdAt.seconds : new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
    }
  }, [rooms, favorites, searchTerm, districtFilter, wardFilter, streetFilter, priceRange, selectedAmenities, sortBy]);

  const totalPages = Math.ceil(filteredFavoriteRooms.length / roomsPerPage);
  
  const paginatedFavoriteRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * roomsPerPage;
    return filteredFavoriteRooms.slice(startIndex, startIndex + roomsPerPage);
  }, [filteredFavoriteRooms, currentPage, roomsPerPage]);

  // Handle scroll restoration
  useEffect(() => {
    const isReturning = (location.state as any)?.fromDetail || navType === 'POP';
    if (isReturning && !hasRestoredScroll.current && paginatedFavoriteRooms.length > 0) {
      const savedPos = sessionStorage.getItem('favoritesScrollPos');
      const lastRoomId = sessionStorage.getItem('lastVisitedRoomId');
      
      if (savedPos || lastRoomId) {
        const restore = (attempts = 0) => {
          // Try to find the specific room card first for precision
          const targetCard = lastRoomId ? document.getElementById(`room-card-${lastRoomId}`) : null;
          
          if (targetCard) {
            const headerOffset = 140;
            const elementPosition = targetCard.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'auto' });
            hasRestoredScroll.current = true;
          } else if (attempts > 30 && savedPos) {
            // Fallback to pixel position
            window.scrollTo(0, parseInt(savedPos, 10));
            hasRestoredScroll.current = true;
          } else if (attempts < 60) {
            // Keep trying - DOM might still be settling or images loading
            requestAnimationFrame(() => restore(attempts + 1));
          }
        };
        
        // Use requestAnimationFrame for the first attempt to be as fast as possible
        requestAnimationFrame(() => restore(0));
      }
    }
  }, [location.key, navType, location.state, paginatedFavoriteRooms]);

  // Persist state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('favoritesCurrentPage', currentPage.toString());
  }, [currentPage]);

  // Arm restoration logic (allow page resets again after initial mount)
  useEffect(() => {
    if (isRestoring) {
      // Small delay to ensure any multiple synchronous mount effects finish
      const timer = setTimeout(() => {
        setIsRestoring(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('favoritesSearchTerm', JSON.stringify(searchTerm));
    sessionStorage.setItem('favoritesDistrictFilter', JSON.stringify(districtFilter));
    sessionStorage.setItem('favoritesWardFilter', JSON.stringify(wardFilter));
    sessionStorage.setItem('favoritesStreetFilter', JSON.stringify(streetFilter));
    sessionStorage.setItem('favoritesSelectedAmenities', JSON.stringify(selectedAmenities));
    sessionStorage.setItem('favoritesPriceRange', JSON.stringify(priceRange));
    sessionStorage.setItem('favoritesSortBy', JSON.stringify(sortBy));
    sessionStorage.setItem('favoritesViewMode', viewMode);
  }, [searchTerm, districtFilter, wardFilter, streetFilter, selectedAmenities, priceRange, sortBy, viewMode]);

  // Reset to first page when filters change
  useEffect(() => {
    if (isRestoring) {
      return;
    }
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, districtFilter, wardFilter, streetFilter, priceRange, selectedAmenities, sortBy]);

  // Handle Navbar navigation (reset state)
  useEffect(() => {
    const isReturning = (location.state as any)?.fromDetail || navType === 'POP';
    if (!isReturning && location.pathname === '/favorites') {
      setCurrentPage(1);
      setSearchTerm('');
      setDistrictFilter('All');
      setWardFilter('All');
      setStreetFilter('All');
      setSelectedAmenities([]);
      setPriceRange([0, 20000000]);
      setSortBy('newest');
      
      sessionStorage.setItem('favoritesCurrentPage', '1');
      sessionStorage.removeItem('favoritesScrollPos');
      sessionStorage.removeItem('lastVisitedRoomId');
      sessionStorage.removeItem('favoritesSearchTerm');
      sessionStorage.removeItem('favoritesDistrictFilter');
      sessionStorage.removeItem('favoritesWardFilter');
      sessionStorage.removeItem('favoritesStreetFilter');
      sessionStorage.removeItem('favoritesSelectedAmenities');
      sessionStorage.removeItem('favoritesPriceRange');
      sessionStorage.removeItem('favoritesSortBy');
      
      window.scrollTo(0, 0);
      hasRestoredScroll.current = false;
    }
  }, [location.key, location.pathname, location.state, navType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setTimeout(() => {
      if (favoritesRef.current) {
        const yOffset = -120;
        const y = favoritesRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 10);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const districts = ['All', 'Tân Phú', 'Tân Bình', 'Bình Tân'];

  return (
    <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24 py-16 md:py-24">
      <div className="mb-16">
        <span className="text-accent font-bold text-sm uppercase tracking-[0.4em] mb-4 block">Bộ sưu tập của bạn</span>
        <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary mb-6 tracking-tighter">Phòng trọ yêu thích</h1>
        <p className="text-xl text-gray-500 font-light max-w-2xl leading-relaxed">
          Danh sách các phòng trọ bạn đã lưu để xem lại sau. Hãy nhanh tay liên hệ trước khi phòng được thuê hết nhé!
        </p>
      </div>

      {favorites.length > 0 ? (
        <div ref={favoritesRef}>
          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-12">
            <div className="flex-grow relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm trong danh sách yêu thích..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all outline-none"
              />
            </div>
            <div className="flex gap-3">
              <div className="hidden md:flex bg-white p-1.5 rounded-[2rem] border border-gray-100 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3.5 rounded-full transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-primary'}`}
                  title="Xem dạng lưới"
                >
                  <LayoutGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3.5 rounded-full transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-primary'}`}
                  title="Xem dạng danh sách"
                >
                  <ListIcon size={20} />
                </button>
              </div>
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center justify-center space-x-3 px-6 py-4 sm:px-10 sm:py-5 rounded-[2rem] font-bold transition-all border ${
                  isFilterOpen ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20' : 'bg-white text-primary border-gray-100 shadow-sm hover:bg-paper'
                }`}
              >
                <Filter size={20} />
                <span>Bộ lọc</span>
                <ChevronDown size={18} className={`transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-12"
              >
                <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-gray-100 shadow-xl shadow-primary/5 space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-8">
                      <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Khu vực & Địa điểm</h3>
                        <div className="flex flex-wrap gap-3">
                          <div className="relative group">
                            <button className="flex items-center space-x-2 px-5 py-3 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                              <span>Quận: {districtFilter === 'All' ? 'Tất cả' : districtFilter}</span>
                              <ChevronDown size={14} />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2">
                              {districts.map(d => (
                                <button
                                  key={d}
                                  onClick={() => {
                                    setDistrictFilter(d);
                                    setWardFilter('All');
                                    setStreetFilter('All');
                                  }}
                                  className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                    districtFilter === d ? 'bg-accent/10 text-accent' : 'hover:bg-gray-50 text-gray-600'
                                  }`}
                                >
                                  {d === 'All' ? 'Tất cả quận' : d}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="relative group">
                            <button className="flex items-center space-x-2 px-5 py-3 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                              <span>Phường: {wardFilter === 'All' ? 'Tất cả' : wardFilter}</span>
                              <ChevronDown size={14} />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 max-h-60 overflow-y-auto">
                              {uniqueWards.map(w => (
                                <button
                                  key={w}
                                  onClick={() => {
                                    setWardFilter(w);
                                    setStreetFilter('All');
                                  }}
                                  className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                    wardFilter === w ? 'bg-accent/10 text-accent' : 'hover:bg-gray-50 text-gray-600'
                                  }`}
                                >
                                  {w === 'All' ? 'Tất cả phường' : w}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="relative group">
                            <button className="flex items-center space-x-2 px-5 py-3 bg-gray-50 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                              <span>Đường: {streetFilter === 'All' ? 'Tất cả' : streetFilter}</span>
                              <ChevronDown size={14} />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 max-h-60 overflow-y-auto">
                              {uniqueStreets.map(s => (
                                <button
                                  key={s}
                                  onClick={() => setStreetFilter(s)}
                                  className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                                    streetFilter === s ? 'bg-accent/10 text-accent' : 'hover:bg-gray-50 text-gray-600'
                                  }`}
                                >
                                  {s === 'All' ? 'Tất cả đường' : s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Sắp xếp theo</h3>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { id: 'newest', label: 'Mới nhất', icon: Clock },
                            { id: 'price-asc', label: 'Giá Thấp - Cao', icon: ArrowUpWideNarrow },
                            { id: 'price-desc', label: 'Giá Cao - Thấp', icon: ArrowDownWideNarrow },
                            { id: 'area-desc', label: 'Diện tích lớn nhất', icon: Maximize },
                          ].map(sort => (
                            <button
                              key={sort.id}
                              onClick={() => setSortBy(sort.id)}
                              className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                                sortBy === sort.id 
                                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              <sort.icon size={16} />
                              <span>{sort.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-10">
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Khoảng giá (VNĐ)</label>
                          <div className="text-xs font-bold text-accent">
                            {new Intl.NumberFormat('vi-VN').format(priceRange[0])}đ - {new Intl.NumberFormat('vi-VN').format(priceRange[1])}đ
                          </div>
                        </div>
                        <div className="px-2">
                          <Slider
                            defaultValue={[0, 20000000]}
                            max={20000000}
                            step={500000}
                            value={priceRange}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                            className="py-4"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-50">
                    <label className="block text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">Tiện ích phòng</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {amenities.map((amenity, idx) => {
                        const isSelected = selectedAmenities.includes(amenity);
                        return (
                          <button
                            key={`fav-amenity-${amenity}-${idx}`}
                            onClick={() => toggleAmenity(amenity)}
                            className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                              isSelected 
                                ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' 
                                : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            {amenity}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-8 border-t border-gray-50">
                    <button
                      onClick={() => {
                        setDistrictFilter('All');
                        setWardFilter('All');
                        setStreetFilter('All');
                        setSelectedAmenities([]);
                        setPriceRange([0, 20000000]);
                        setSortBy('newest');
                      }}
                      className="text-xs font-bold text-gray-400 hover:text-accent transition-colors flex items-center space-x-2"
                    >
                      <X size={16} />
                      <span>Xóa tất cả bộ lọc</span>
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all"
                    >
                      Áp dụng bộ lọc
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {paginatedFavoriteRooms.length > 0 ? (
            <>
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" : "space-y-8"}>
                {paginatedFavoriteRooms.map((room) => (
                  <div key={room.id} id={`room-card-${room.id}`}>
                    <RoomCard 
                      room={room} 
                      viewMode={viewMode} 
                      linkState={{ from: 'favorites' }} 
                      disableAnimation={isRestoring}
                    />
                  </div>
                ))}
              </div>

              {/* Pagination UI */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-4 rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-primary hover:border-primary disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={`fav-page-btn-${page}`}
                            onClick={() => handlePageChange(page)}
                            className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all ${
                              currentPage === page
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white text-gray-400 border border-gray-100 hover:border-primary hover:text-primary shadow-sm'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={`fav-page-dots-${page}`} className="text-gray-300">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-4 rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-primary hover:border-primary disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:border-gray-100 transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-paper rounded-[3rem] border border-dashed border-gray-200">
              <Search className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-xl font-bold text-primary mb-2">Không tìm thấy kết quả</h3>
              <p className="text-gray-500">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-32 bg-paper rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200 shadow-inner">
            <Heart size={40} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-primary mb-3">Chưa có phòng yêu thích</h3>
          <p className="text-gray-500 font-light mb-10">Hãy khám phá danh sách phòng và nhấn vào biểu tượng trái tim để lưu lại.</p>
          <Link
            to="/rooms"
            className="inline-flex items-center space-x-3 bg-primary text-white px-10 py-5 rounded-2xl font-bold hover:bg-accent transition-all shadow-xl shadow-primary/10 group"
          >
            <span>Khám phá ngay</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
