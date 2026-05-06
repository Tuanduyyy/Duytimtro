import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useRooms } from '../context/RoomContext';
import RoomCard from '../components/RoomCard';
import { Search, Filter, X, ChevronDown, MapPin, Clock, ArrowDownWideNarrow, ArrowUpWideNarrow, Maximize, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, CheckCircle2, Phone, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { COMMON_AMENITIES } from '../constants';
import { Slider } from '@/components/ui/slider';
import { Room } from '../types';
import { Link, useLocation, useNavigationType } from 'react-router-dom';

export default function RoomList() {
  const { rooms, amenities, settings } = useRooms();
  const location = useLocation();
  const navType = useNavigationType();
  const roomListRef = useRef<HTMLDivElement>(null);
  
  // Helper to get initial state from sessionStorage if returning
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    const isReturning = (location.state as any)?.fromDetail || navType === 'POP';
    if (isReturning) {
      const saved = sessionStorage.getItem(key);
      if (saved) {
        try {
          return JSON.parse(saved) as T;
        } catch (e) {
          return defaultValue;
        }
      }
    }
    return defaultValue;
  };

  const [searchTerm, setSearchTerm] = useState(() => getInitialState('roomsSearchTerm', ''));
  const [districtFilter, setDistrictFilter] = useState<string>(() => getInitialState('roomsDistrictFilter', 'All'));
  const [wardFilter, setWardFilter] = useState<string>(() => getInitialState('roomsWardFilter', 'All'));
  const [streetFilter, setStreetFilter] = useState<string>(() => getInitialState('roomsStreetFilter', 'All'));
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => getInitialState('roomsSelectedAmenities', []));
  const [priceRange, setPriceRange] = useState<[number, number]>(() => getInitialState('roomsPriceRange', [0, 20000000]));
  const [sortBy, setSortBy] = useState<string>(() => getInitialState('roomsSortBy', 'newest'));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Initialize currentPage from sessionStorage if returning from detail or back button
  const [currentPage, setCurrentPage] = useState(() => {
    const isReturning = (location.state as any)?.fromDetail || navType === 'POP';
    if (isReturning) {
      const savedPage = sessionStorage.getItem('roomsCurrentPage');
      return savedPage ? parseInt(savedPage, 10) : 1;
    }
    return 1;
  });

  const [isRestoring, setIsRestoring] = useState(() => (location.state as any)?.fromDetail || navType === 'POP');
  const [quickViewRoom, setQuickViewRoom] = useState<Room | null>(null);
  const hasRestoredScroll = useRef(false);

  // Force grid view on mobile
  useEffect(() => {
    const checkViewport = () => {
      if (window.innerWidth < 768 && viewMode === 'list') {
        setViewMode('grid');
      }
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, [viewMode]);

  // Update restoration flag on navigation
  useEffect(() => {
    const returning = (location.state as any)?.fromDetail || navType === 'POP';
    setIsRestoring(returning);
    if (!returning) {
      hasRestoredScroll.current = false;
    }
  }, [location.key, navType, location.state]);
  
  const roomsPerPage = useMemo(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 5;
    }
    return 15;
  }, []);

  const [currentRoomsPerPage, setCurrentRoomsPerPage] = useState(roomsPerPage);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCurrentRoomsPerPage(5);
      } else {
        setCurrentRoomsPerPage(15);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const uniqueWards = useMemo(() => {
    const wards = rooms
      .filter(r => districtFilter === 'All' || r.district === districtFilter)
      .map(r => r.ward)
      .filter(Boolean);
    return ['All', ...new Set(wards)];
  }, [rooms, districtFilter]);

  const uniqueStreets = useMemo(() => {
    const streets = rooms
      .filter(r => (districtFilter === 'All' || r.district === districtFilter) && (wardFilter === 'All' || r.ward === wardFilter))
      .map(r => r.street)
      .filter(Boolean);
    return ['All', ...new Set(streets)];
  }, [rooms, districtFilter, wardFilter]);

  const filteredRooms = useMemo(() => {
    let result = rooms.filter((room) => {
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
          const getTime = (val: any) => {
            if (!val) return 0;
            if (val.seconds) return val.seconds * 1000;
            const date = new Date(val);
            return isNaN(date.getTime()) ? 0 : date.getTime();
          };
          return getTime(b.createdAt) - getTime(a.createdAt);
        });
    }
  }, [rooms, searchTerm, districtFilter, wardFilter, streetFilter, priceRange, selectedAmenities, sortBy]);

  const districts = ['All', 'Tân Phú', 'Tân Bình', 'Bình Tân'];

  const totalPages = Math.ceil(filteredRooms.length / currentRoomsPerPage);

  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * currentRoomsPerPage;
    return filteredRooms.slice(startIndex, startIndex + currentRoomsPerPage);
  }, [filteredRooms, currentPage, currentRoomsPerPage]);

  // Reset to first page when filters or rooms change
  useEffect(() => {
    // Skip reset if we are currently restoring state from a previous session
    if (isRestoring) {
      return;
    }

    setCurrentPage(1);
    sessionStorage.setItem('roomsCurrentPage', '1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, searchTerm, districtFilter, wardFilter, streetFilter, priceRange, selectedAmenities, sortBy]);

  // Safety check: Ensure currentPage is never out of bounds
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Persist currentPage to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('roomsCurrentPage', currentPage.toString());
  }, [currentPage]);

  // Arm restoration logic (allow page resets again after initial mount)
  useEffect(() => {
    if (isRestoring) {
      const timer = setTimeout(() => {
        setIsRestoring(false);
      }, 300); // Give enough time for scroll restoration to happen
      return () => clearTimeout(timer);
    }
  }, []);

  // Persist filters to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('roomsSearchTerm', JSON.stringify(searchTerm));
    sessionStorage.setItem('roomsDistrictFilter', JSON.stringify(districtFilter));
    sessionStorage.setItem('roomsWardFilter', JSON.stringify(wardFilter));
    sessionStorage.setItem('roomsStreetFilter', JSON.stringify(streetFilter));
    sessionStorage.setItem('roomsSelectedAmenities', JSON.stringify(selectedAmenities));
    sessionStorage.setItem('roomsPriceRange', JSON.stringify(priceRange));
    sessionStorage.setItem('roomsSortBy', JSON.stringify(sortBy));
  }, [searchTerm, districtFilter, wardFilter, streetFilter, selectedAmenities, priceRange, sortBy]);

  // Handle scroll restoration
  useEffect(() => {
    const isReturning = (location.state as any)?.fromDetail || navType === 'POP';
    if (isReturning && !hasRestoredScroll.current && paginatedRooms.length > 0) {
      const savedPos = sessionStorage.getItem('roomsScrollPos');
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
            // Keep trying - DOM might still be settling
            requestAnimationFrame(() => restore(attempts + 1));
          }
        };
        
        // Use requestAnimationFrame for the first attempt to be as fast as possible
        requestAnimationFrame(() => restore(0));
      }
    }
  }, [location.key, navType, location.state, paginatedRooms]);

  // Reset page when navigating via Navbar (new key without restoration state)
  useEffect(() => {
    const isReturning = (location.state as any)?.fromDetail || navType === 'POP';
    if (!isReturning && location.pathname === '/rooms') {
      setCurrentPage(1);
      setSearchTerm('');
      setDistrictFilter('All');
      setWardFilter('All');
      setStreetFilter('All');
      setSelectedAmenities([]);
      setPriceRange([0, 20000000]);
      setSortBy('newest');
      
      sessionStorage.setItem('roomsCurrentPage', '1');
      sessionStorage.removeItem('lastVisitedRoomId');
      sessionStorage.removeItem('roomsSearchTerm');
      sessionStorage.removeItem('roomsDistrictFilter');
      sessionStorage.removeItem('roomsWardFilter');
      sessionStorage.removeItem('roomsStreetFilter');
      sessionStorage.removeItem('roomsSelectedAmenities');
      sessionStorage.removeItem('roomsPriceRange');
      sessionStorage.removeItem('roomsSortBy');
      
      window.scrollTo(0, 0);
      hasRestoredScroll.current = false;
    }
  }, [location.key, location.pathname, location.state, navType]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Use a small timeout to ensure the DOM has updated with new content
    setTimeout(() => {
      if (roomListRef.current) {
        const yOffset = -120; // Offset for sticky header
        const y = roomListRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 10);
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24 py-16">
      <div className="mb-20 text-center">
        <span className="text-accent font-bold text-sm uppercase tracking-[0.4em] mb-6 block">Khám phá không gian</span>
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-primary mb-8 tracking-tighter">Danh sách phòng trọ</h1>
        <p className="text-xl text-gray-500 font-light max-w-3xl mx-auto leading-relaxed">
          Tìm kiếm nơi an cư lý tưởng với bộ sưu tập phòng trọ cao cấp, hiện đại và đầy đủ tiện nghi nhất khu vực.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <div className="flex-grow relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, địa chỉ..."
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

      {/* Filter Panel (Advanced) */}
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
                {/* Location & Quick Filters */}
                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Khu vực & Địa điểm</h3>
                    <div className="flex flex-wrap gap-3">
                      {/* District Quick Filter */}
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

                      {/* Ward Quick Filter */}
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

                      {/* Street Quick Filter */}
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

                {/* Range Filters */}
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
                    <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                      <span>0đ</span>
                      <span>20tr+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="pt-10 border-t border-gray-50">
                <label className="block text-xs font-bold text-gray-500 mb-6 uppercase tracking-widest">Tiện ích phòng</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {amenities.map((amenity, idx) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={`filter-amenity-${amenity}-${idx}`}
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

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewRoom && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewRoom(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <button
                onClick={() => setQuickViewRoom(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-md rounded-full text-primary hover:text-accent transition-all shadow-lg"
              >
                <X size={20} />
              </button>

              {/* Image Section */}
              <div className="md:w-1/2 relative h-64 md:h-auto overflow-hidden">
                <img
                  src={quickViewRoom.images[0]}
                  alt={quickViewRoom.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  {quickViewRoom.isFeatured && (
                    <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      Premium
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg ${
                    quickViewRoom.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {quickViewRoom.status === 'available' ? 'Còn phòng' : 'Hết phòng'}
                  </span>
                </div>
              </div>

              {/* Info Section */}
              <div className="md:w-1/2 p-8 md:p-12 overflow-y-auto">
                <div className="flex items-center space-x-2 text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
                  <span>{quickViewRoom.district}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{quickViewRoom.ward}</span>
                </div>
                <h2 className="text-3xl font-serif font-bold text-primary mb-6 leading-tight">
                  {quickViewRoom.title}
                </h2>
                
                <div className="flex items-baseline space-x-2 mb-8">
                  <span className="text-3xl font-bold text-accent">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quickViewRoom.price)}
                  </span>
                  <span className="text-gray-400 text-sm">/tháng</span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-10 h-10 bg-paper rounded-xl flex items-center justify-center text-accent shrink-0">
                      <Maximize size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Diện tích</p>
                      <p className="font-bold">{quickViewRoom.area} m²</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-10 h-10 bg-paper rounded-xl flex items-center justify-center text-accent shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khu vực</p>
                      <p className="font-bold truncate">{quickViewRoom.district}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-10">
                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed italic">
                    {quickViewRoom.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to={`/rooms/${quickViewRoom.id}`}
                    onClick={() => setQuickViewRoom(null)}
                    className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold text-center hover:bg-accent transition-all shadow-xl shadow-primary/10"
                  >
                    Xem chi tiết
                  </Link>
                  <a
                    href={`tel:${settings.hotline}`}
                    className="flex-1 bg-paper text-primary py-4 rounded-2xl font-bold text-center hover:bg-gray-100 transition-all flex items-center justify-center space-x-2"
                  >
                    <span>Gọi ngay</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Results Grid/List */}
      <div ref={roomListRef} className="scroll-mt-32 min-h-[400px]">
        {paginatedRooms.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${currentPage}-${viewMode}-${sortBy}-${districtFilter}-${wardFilter}-${streetFilter}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8" : "space-y-8"}
              >
                {paginatedRooms.map((room) => (
                  <div key={room.id} id={`room-card-${room.id}`}>
                    <RoomCard 
                      room={room} 
                      onQuickView={(r) => setQuickViewRoom(r)} 
                      viewMode={viewMode}
                      disableAnimation={isRestoring} 
                    />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Pagination UI */}
            {totalPages > 1 && (
            <div className="mt-16 flex flex-col items-center space-y-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  {(() => {
                    const pages = [];
                    for (let i = 1; i <= totalPages; i++) {
                      if (
                        i === 1 ||
                        i === totalPages ||
                        (i >= currentPage - 1 && i <= currentPage + 1)
                      ) {
                        pages.push(
                          <button
                            key={`roomlist-page-btn-${i}`}
                            onClick={() => handlePageChange(i)}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all ${
                              currentPage === i
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white text-gray-400 border border-gray-100 hover:border-primary hover:text-primary shadow-sm'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      } else if (
                        i === currentPage - 2 ||
                        i === currentPage + 2
                      ) {
                        pages.push(
                          <span key={`roomlist-page-dots-${i}`} className="text-gray-300 px-1">...</span>
                        );
                      }
                    }
                    return pages;
                  })()}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-primary hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  aria-label="Trang sau"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                Trang <span className="text-primary">{currentPage}</span> trên <span className="text-primary">{totalPages}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-32 bg-paper rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200 shadow-inner">
            <Search size={40} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-primary mb-3">Không tìm thấy phòng phù hợp</h3>
          <p className="text-gray-500 font-light mb-10">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setDistrictFilter('All');
              setWardFilter('All');
              setStreetFilter('All');
              setSelectedAmenities([]);
              setPriceRange([0, 20000000]);
              setSortBy('newest');
              sessionStorage.removeItem('lastVisitedRoomId');
              sessionStorage.removeItem('roomsSearchTerm');
              sessionStorage.removeItem('roomsDistrictFilter');
              sessionStorage.removeItem('roomsWardFilter');
              sessionStorage.removeItem('roomsStreetFilter');
              sessionStorage.removeItem('roomsSelectedAmenities');
              sessionStorage.removeItem('roomsPriceRange');
              sessionStorage.removeItem('roomsSortBy');
            }}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-accent transition-all shadow-xl shadow-primary/10"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
