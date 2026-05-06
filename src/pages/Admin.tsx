import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRooms } from '../context/RoomContext';
import { Plus, Trash2, Edit2, MessageSquare, LayoutDashboard, X, Check, Eye, Upload, Image as ImageIcon, User, Mail, Phone, Database, CheckCheck, TrendingUp, Home as HomeIcon, AlertCircle, Search as SearchIcon, FileText, Download, ChevronLeft, ChevronRight, BarChart3, PieChart as PieChartIcon, Activity, Star, Clock, Settings, Settings2, Wrench, Sparkles, PhoneCall, Globe, Facebook, Share2, Library } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Room, Review } from '../types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { compressImage } from '../lib/imageUtils';
import { COMMON_AMENITIES } from '../constants';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

export default function Admin() {
  const { rooms, messages, reviews, currentUser, addRoom, updateRoom, deleteRoom, updateMessage, deleteMessage, updateReview, deleteReview, settings, amenities, media, addMedia, deleteMedia, updateSettings, updateAmenities } = useRooms();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rooms' | 'messages' | 'reviews' | 'bulk' | 'settings' | 'amenities' | 'media'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');
  const [filterSTT, setFilterSTT] = useState<string>('');
  const [roomSort, setRoomSort] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [roomStatusFilter, setRoomStatusFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 7;
  const [messagePage, setMessagePage] = useState(1);
  const messagesPerPage = 4;
  const [messageSearch, setMessageSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'processing' | 'completed' | 'cancelled'>('all');
  const [mediaSearch, setMediaSearch] = useState('');
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<any | null>(null);
  const [mediaToAssign, setMediaToAssign] = useState<any | null>(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [assigningRoomId, setAssigningRoomId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Calculate Stable STT based on creation time (Oldest = 1)
  const roomSTTMap = useMemo(() => {
    return [...rooms]
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds || new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.seconds || new Date(b.createdAt).getTime();
        return timeA - timeB;
      })
      .reduce((acc, room, index) => {
        acc[room.id] = index + 1;
        return acc;
      }, {} as Record<string, number>);
  }, [rooms]);

  const mediaSTTMap = useMemo(() => {
    return [...media]
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds || new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.seconds || new Date(b.createdAt).getTime();
        return timeA - timeB;
      })
      .reduce((acc, item, index) => {
        acc[item.id] = index + 1;
        return acc;
      }, {} as Record<string, number>);
  }, [media]);

  const getRoomSTT = (roomId: string) => roomSTTMap[roomId] || 0;
  const getMediaSTT = (mediaId: string) => mediaSTTMap[mediaId] || 0;

  const getRoomsForMedia = (url: string) => {
    return rooms.filter(room => room.images && room.images.includes(url));
  };
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);
  const isFirstMessageRender = useRef(true);

  // Scroll to top on mount and when user role is confirmed
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentUser?.role]);

  // Redirect if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold mb-4">Bạn không có quyền truy cập trang này</h2>
        <button onClick={() => navigate('/duy-dang-nhap')} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm">Đăng nhập với quyền Admin</button>
      </div>
    );
  }

  // Settings local state
  const [tempSettings, setTempSettings] = useState(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await updateSettings(tempSettings);
      toast.success('Đã cập nhật cài đặt hệ thống!');
    } catch (error) {
      toast.error('Không thể cập nhật cài đặt');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Amenities local state
  const [newAmenity, setNewAmenity] = useState('');
  const [tempAmenities, setTempAmenities] = useState<string[]>(amenities);

  useEffect(() => {
    setTempAmenities(amenities);
  }, [amenities]);

  const handleAddAmenity = () => {
    if (!newAmenity.trim()) return;
    if (tempAmenities.includes(newAmenity.trim())) {
      toast.error('Tiện ích này đã tồn tại');
      return;
    }
    setTempAmenities([...tempAmenities, newAmenity.trim()]);
    setNewAmenity('');
  };

  const handleRemoveAmenity = (name: string) => {
    setTempAmenities(tempAmenities.filter(a => a !== name));
  };

  const handleSaveAmenities = async () => {
    try {
      await updateAmenities(tempAmenities);
      toast.success('Đã cập nhật danh sách tiện ích!');
    } catch (error) {
      toast.error('Không thể cập nhật tiện ích');
    }
  };

  const [formData, setFormData] = useState({
    title: '',
    price: 0,
    area: 0,
    district: 'Tân Phú' as Room['district'],
    ward: '',
    street: '',
    address: '',
    description: '',
    amenities: [] as string[],
    images: [] as string[],
    contactPhone: '0901234567',
    isFeatured: false,
    status: 'available' as Room['status'],
  });

  // Auto-generate address for new rooms
  useEffect(() => {
    if (!editingRoom && (formData.street || formData.ward)) {
      const parts = [];
      if (formData.street) parts.push(formData.street);
      if (formData.ward) parts.push(`P. ${formData.ward}`);
      parts.push(`Q. ${formData.district}`);
      setFormData(prev => ({ ...prev, address: parts.join(', ') }));
    }
  }, [formData.street, formData.ward, formData.district, editingRoom]);

  const handleOpenModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        title: room.title,
        price: room.price,
        area: room.area,
        district: room.district,
        ward: room.ward || '',
        street: room.street || '',
        address: room.address,
        description: room.description,
        amenities: room.amenities,
        images: room.images,
        contactPhone: room.contactPhone,
        isFeatured: room.isFeatured || false,
        status: room.status || 'available',
      });
    } else {
      setEditingRoom(null);
      setFormData({
        title: '',
        price: 0,
        area: 0,
        district: 'Tân Phú',
        ward: '',
        street: '',
        address: '',
        description: '',
        amenities: [],
        images: [],
        contactPhone: '0901234567',
        isFeatured: false,
        status: 'available',
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      const fileList = Array.from(files) as File[];
      
      if (formData.images.length + fileList.length > 8) {
        toast.error('Tối đa 8 hình ảnh cho mỗi phòng');
        return;
      }

      toast.info('Đang tối ưu hóa hình ảnh...');
      
      for (const file of fileList) {
        try {
          const compressed = await compressImage(file);
          newImages.push(compressed);
        } catch (error) {
          console.error("Error compressing image:", error);
          toast.error(`Không thể xử lý ảnh: ${file.name}`);
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomData = {
      ...formData,
      coordinates: { lat: 10.8, lng: 106.6 },
    };

    try {
      if (editingRoom) {
        await updateRoom(editingRoom.id, roomData);
        toast.success('Cập nhật phòng thành công!');
      } else {
        await addRoom(roomData);
        // Add images to media library as well
        for (const img of formData.images) {
          await addMedia({
            url: img,
            name: `P-${formData.title}-${Math.random().toString(36).substring(7)}`,
            size: 0,
            type: 'image/jpeg'
          });
        }
        toast.success('Đăng phòng mới thành công!');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving room:", error);
      toast.error('Có lỗi xảy ra khi lưu phòng');
    }
  };

  const toggleRoomStatus = async (room: Room) => {
    const newStatus = room.status === 'available' ? 'unavailable' : 'available';
    try {
      await updateRoom(room.id, { status: newStatus });
      toast.success(`Đã chuyển sang: ${newStatus === 'available' ? 'Còn phòng' : 'Hết phòng'}`);
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const filteredRooms = rooms
    .filter(room => {
      const stt = getRoomSTT(room.id);
      const matchesSTT = filterSTT === '' || (stt && stt.toString() === filterSTT);
      const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           room.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDistrict = filterDistrict === 'all' || room.district === filterDistrict;
      const matchesStatus = roomStatusFilter === 'all' || room.status === roomStatusFilter;
      return matchesSTT && matchesSearch && matchesDistrict && matchesStatus;
    })
    .sort((a, b) => {
      if (roomSort === 'price-asc') return a.price - b.price;
      if (roomSort === 'price-desc') return b.price - a.price;
      if (roomSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);
  const paginatedRooms = filteredRooms.slice(
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDistrict, filterSTT, roomSort, roomStatusFilter]);

  const filteredMessages = messages
    .filter(msg => {
      const matchesSearch = msg.name.toLowerCase().includes(messageSearch.toLowerCase()) || 
                           msg.phone.includes(messageSearch) || 
                           (msg.content && msg.content.toLowerCase().includes(messageSearch.toLowerCase()));
      const matchesFilter = messageFilter === 'all' || 
                           (messageFilter === 'unread' && !msg.isRead) ||
                           (messageFilter !== 'unread' && msg.status === messageFilter);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalMessagePages = Math.ceil(filteredMessages.length / messagesPerPage);
  const paginatedMessages = filteredMessages.slice(
    (messagePage - 1) * messagesPerPage,
    messagePage * messagesPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setMessagePage(1);
  }, [messageSearch, messageFilter]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage]);

  useEffect(() => {
    if (isFirstMessageRender.current) {
      isFirstMessageRender.current = false;
      return;
    }
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [messagePage]);

  const handleRoomPageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleMessagePageChange = (page: number) => {
    setMessagePage(page);
  };

  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [reviewPage, setReviewPage] = useState(1);
  const reviewsPerPage = 6;

  const filteredReviews = reviews
    .filter(rev => {
      const matchesSearch = rev.name.toLowerCase().includes(reviewSearch.toLowerCase()) || 
                           rev.content.toLowerCase().includes(reviewSearch.toLowerCase());
      const matchesFilter = reviewFilter === 'all' || rev.status === reviewFilter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalReviewPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (reviewPage - 1) * reviewsPerPage,
    reviewPage * reviewsPerPage
  );

  const handleApproveReview = async (review: Review) => {
    try {
      // Random avatar if not set
      const randomAvatar = `https://i.pravatar.cc/150?u=${review.id}`;
      await updateReview(review.id, { 
        status: 'approved',
        avatar: review.avatar || randomAvatar
      });
      toast.success('Đã duyệt đánh giá!');
    } catch (error) {
      toast.error('Không thể duyệt đánh giá');
    }
  };

  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };

  const scrollToSection = () => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter(r => r.status === 'available').length,
    unreadMessages: messages.filter(m => !m.isRead).length,
    featuredRooms: rooms.filter(r => r.isFeatured).length
  };

  // Chart Data: Rooms by District
  const districtData = rooms.reduce((acc: any[], room) => {
    const existing = acc.find(d => d.name === room.district);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: room.district, value: 1 });
    }
    return acc;
  }, []);

  // Chart Data: Price Distribution
  const priceRanges = [
    { name: '< 3tr', min: 0, max: 3000000 },
    { name: '3tr - 5tr', min: 3000000, max: 5000000 },
    { name: '5tr - 7tr', min: 5000000, max: 7000000 },
    { name: '7tr - 10tr', min: 7000000, max: 10000000 },
    { name: '> 10tr', min: 10000000, max: Infinity },
  ];

  const priceData = priceRanges.map(range => ({
    name: range.name,
    count: rooms.filter(r => r.price >= range.min && r.price < range.max).length
  }));

  // Chart Data: Messages Trend (Last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }).reverse();

  const messageTrendData = last7Days.map(day => ({
    name: day,
    count: messages.filter(m => {
      const msgDate = new Date(m.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      return msgDate === day;
    }).length
  }));

  const COLORS = ['#FF6B35', '#2563EB', '#10B981', '#F59E0B', '#8B5CF6'];

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const fileName = file.name.toLowerCase();

    const processData = async (data: any[]) => {
      let successCount = 0;
      let errorCount = 0;

      toast.info(`Bắt đầu nhập ${data.length} phòng...`);

      for (const item of data) {
        try {
          // Normalize price (remove dots if any, e.g. 4.500.000 -> 4500000)
          const rawPrice = String(item['Giá thuê (VND)'] || item['Giá'] || item.price || '0');
          const price = Number(rawPrice.replace(/\./g, '').replace(/,/g, '')) || 0;

          // Normalize address and extract district/ward/street
          const fullAddress = String(item['Địa chỉ'] || item['Địa chỉ chi tiết'] || item.address || '');
          
          let district: Room['district'] = 'Tân Phú';
          if (fullAddress.includes('Quận Tân Bình') || fullAddress.includes('Q. Tân Bình')) district = 'Tân Bình';
          if (fullAddress.includes('Quận Bình Tân') || fullAddress.includes('Q. Bình Tân')) district = 'Bình Tân';
          if (fullAddress.includes('Quận Tân Phú') || fullAddress.includes('Q. Tân Phú')) district = 'Tân Phú';

          // Basic ward/street extraction attempt
          let ward = '';
          let street = '';
          const wardMatch = fullAddress.match(/Phường\s+([^,]+)/i) || fullAddress.match(/P\.\s+([^,]+)/i);
          if (wardMatch) ward = wardMatch[1].trim();
          
          const streetParts = fullAddress.split(',');
          if (streetParts.length > 0) {
            street = streetParts[0].trim();
          }

          // Normalize amenities
          const rawAmenities = item['Tiện ích'] || item.amenities || '';
          const amenitiesList = rawAmenities ? String(rawAmenities).split(',').map((s: string) => s.trim()) : [];

          const roomData: Omit<Room, 'id' | 'createdAt'> = {
            title: item['Tiêu đề phòng'] || item['Tên phòng'] || item.title || 'Phòng trọ mới',
            price,
            area: Number(item['Diện tích'] || item.area) || 25, // Default area if missing
            district,
            ward: item['Phường'] || ward || '',
            street: item['Đường'] || street || '',
            address: fullAddress,
            description: item['Mô tả chi tiết'] || item['Mô tả'] || item.description || '',
            amenities: amenitiesList,
            images: item['Hình ảnh'] ? String(item['Hình ảnh']).split(',').map((s: string) => s.trim()) : ['https://picsum.photos/seed/boarding-room/800/600'],
            coordinates: {
              lat: 10.792,
              lng: 106.636,
            },
            contactPhone: String(item['Số điện thoại'] || '0788775937'),
            isFeatured: false,
            status: 'available',
          };
          await addRoom(roomData);
          successCount++;
        } catch (error) {
          console.error("Error importing room:", error);
          errorCount++;
        }
      }

      setIsImporting(false);
      if (successCount > 0) toast.success(`Đã nhập thành công ${successCount} phòng!`);
      if (errorCount > 0) toast.error(`Có ${errorCount} phòng bị lỗi khi nhập.`);
      setActiveTab('rooms');
      e.target.value = '';
    };

    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processData(results.data),
        error: (error: any) => {
          console.error("CSV Parse Error:", error);
          toast.error("Lỗi khi đọc file CSV");
          setIsImporting(false);
        }
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);
          processData(data);
        } catch (error) {
          console.error("Excel Read Error:", error);
          toast.error("Lỗi khi đọc file Excel");
          setIsImporting(false);
        }
      };
      reader.onerror = () => {
        toast.error("Lỗi khi đọc file");
        setIsImporting(false);
      };
      reader.readAsBinaryString(file);
    } else {
      toast.error("Định dạng file không hỗ trợ. Vui lòng sử dụng .csv hoặc .xlsx");
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Exact headers from user's image
    const headers = ["Tiêu đề phòng", "Giá thuê (VND)", "Địa chỉ", "Mô tả chi tiết", "Tiện ích"];
    const exampleValue = [
      "Căn Hộ Dịch Vụ Ban Công - Full Nội Thất", 
      "4.500.000", 
      "48/21 Phạm Văn Xảo, Quận Tân Phú", 
      "Căn hộ dịch vụ rộng rãi, thoáng mát, có ban công riêng, giờ giấc tự do.", 
      "Máy lạnh, Thang máy, Bãi đậu xe, Bảo vệ, Full nội thất, Kệ bếp, Toilet riêng, Dọn phòng"
    ];
    
    // Create Excel file instead of CSV for better compatibility with user expectations
    const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleValue]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    
    // Generate buffer and trigger download
    XLSX.writeFile(workbook, "DuyTimTro_Template.xlsx");
    toast.success("Đã tải file Excel mẫu!");
  };

  return (
    <div className="max-w-full mx-auto px-4 sm:px-12 lg:px-24 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Quản trị hệ thống</h1>
          <p className="text-gray-500 text-sm">Chào mừng trở lại, <span className="font-bold text-accent">{currentUser.name}</span></p>
        </div>
        
        <div className="flex flex-col md:flex-row bg-white p-2 md:p-1 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto gap-1 md:gap-0">
          <button
            onClick={() => {
              setActiveTab('dashboard');
              scrollToTop();
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all w-full md:w-auto ${
              activeTab === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <BarChart3 size={18} />
            <span>Thống kê</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('rooms');
              scrollToTop();
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all w-full md:w-auto ${
              activeTab === 'rooms' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Phòng trọ</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('messages');
              scrollToTop();
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all w-full md:w-auto ${
              activeTab === 'messages' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <MessageSquare size={18} />
            <span>Tin nhắn</span>
            {messages.length > 0 && (
              <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {messages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('reviews');
              scrollToTop();
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all w-full md:w-auto ${
              activeTab === 'reviews' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <Star size={18} />
            <span>Đánh giá</span>
            {reviews.filter(r => r.status === 'pending').length > 0 && (
              <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {reviews.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('bulk');
              scrollToTop();
            }}
            className={`flex md:flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all w-full md:w-auto ${
              activeTab === 'bulk' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <FileText size={18} />
            <span>Nhập hàng loạt</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('amenities');
              scrollToTop();
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all w-full md:w-auto ${
              activeTab === 'amenities' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <Wrench size={18} />
            <span>Tiện ích</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('media');
              scrollToTop();
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all w-full md:w-auto ${
              activeTab === 'media' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <ImageIcon size={18} />
            <span>Thư viện ảnh</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('settings');
              scrollToTop();
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-bold text-sm transition-all w-full md:w-auto ${
              activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'text-gray-400 hover:text-primary'
            }`}
          >
            <Settings size={18} />
            <span>Cài đặt</span>
          </button>
        </div>
      </div>

      <div ref={sectionRef} className="scroll-mt-24">
        {activeTab === 'media' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative flex-1 w-full flex items-center space-x-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm ảnh trong thư viện..."
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon size={20} />
                </div>
              </div>
              
              <button
                onClick={() => {
                  setIsBulkMode(!isBulkMode);
                  setSelectedMediaIds([]);
                }}
                className={`px-6 py-4 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-lg ${
                  isBulkMode 
                    ? 'bg-primary text-white shadow-primary/20' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'
                }`}
              >
                <CheckCheck size={20} />
                <span>{isBulkMode ? 'Hủy chọn' : 'Chọn nhiều'}</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-4">
              {isBulkMode && selectedMediaIds.length > 0 && (
                <button
                  onClick={() => {
                    setMediaToAssign({ multi: true });
                  }}
                  className="bg-accent hover:bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-accent/20"
                >
                  <HomeIcon size={20} />
                  <span>Gán {selectedMediaIds.length} ảnh cho phòng</span>
                </button>
              )}
              
              <div className="relative group/select">
                <select
                  value={assigningRoomId}
                  onChange={(e) => setAssigningRoomId(e.target.value)}
                  className="bg-white border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent appearance-none transition-all font-medium text-xs text-gray-500 shadow-sm pr-12 min-w-[180px]"
                >
                  <option value="">Lưu vào thư viện (mặc định)</option>
                  <optgroup label="Tải và gán vào phòng:">
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        STT {getRoomSTT(room.id)} - {room.title} - {room.district} - {room.price.toLocaleString('vi-VN')}đ
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <HomeIcon size={16} />
                </div>
              </div>

              <input
                type="file"
                id="media-upload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files) return;
                  
                  const targetRoomId = assigningRoomId;
                  const targetRoom = targetRoomId ? rooms.find(r => r.id === targetRoomId) : null;
                  
                  toast.info(targetRoom 
                    ? `Đang tải lên và gán ${files.length} ảnh vào phòng ${targetRoom.title} (STT ${getRoomSTT(targetRoom.id)})...`
                    : `Đang tải lên ${files.length} ảnh...`
                  );
                  
                  const uploadedUrls: string[] = [];
                  for (let i = 0; i < files.length; i++) {
                    const compressed = await compressImage(files[i]);
                    await addMedia({
                      url: compressed,
                      name: files[i].name,
                      size: files[i].size,
                      type: files[i].type
                    });
                    uploadedUrls.push(compressed);
                  }
                  
                  if (targetRoomId && targetRoom) {
                    await updateRoom(targetRoomId, { images: uploadedUrls });
                    toast.success(`Đã tải lên và thay thế ảnh cho phòng ${targetRoom.title} (STT ${getRoomSTT(targetRoom.id)})`);
                  } else {
                    toast.success('Đã thêm ảnh vào thư viện!');
                  }
                }}
              />
              <label
                htmlFor="media-upload"
                className="bg-accent hover:bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center space-x-2 transition-all shadow-lg shadow-accent/20 cursor-pointer"
              >
                <Plus size={20} />
                <span>Tải ảnh lên thư viện</span>
              </label>
            </div>
          </div>

          <div className="space-y-12">
            {Object.entries(
              (media || [])
                .filter(item => item.name.toLowerCase().includes(mediaSearch.toLowerCase()))
                .reduce((groups: Record<string, any[]>, item) => {
                  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  }) : 'Không rõ ngày';
                  if (!groups[date]) groups[date] = [];
                  groups[date].push(item);
                  return groups;
                }, {} as Record<string, any[]>)
            )
            .sort((a, b) => {
              // Sort by date descending
              const dateA = a[0].split('/').reverse().join('-');
              const dateB = b[0].split('/').reverse().join('-');
              return new Date(dateB).getTime() - new Date(dateA).getTime();
            })
            .map(([date, items]: [string, any[]], groupIdx) => (
              <div key={`admin-media-group-${date}-${groupIdx}`} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest">{date}</h3>
                  <div className="h-[1px] flex-1 bg-gray-100"></div>
                  <span className="text-xs font-medium text-gray-400">{items.length} ảnh</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {items.map((item: any) => (
                    <motion.div
                      key={`media-item-${item.id}`}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => {
                        if (isBulkMode) {
                          setSelectedMediaIds(prev => 
                            prev.includes(item.id) 
                              ? prev.filter(id => id !== item.id) 
                              : [...prev, item.id]
                          );
                        }
                      }}
                      className={`group relative bg-white rounded-2xl border aspect-square overflow-hidden shadow-sm hover:shadow-xl transition-all ${
                        isBulkMode ? 'cursor-pointer' : ''
                      } ${
                        selectedMediaIds.includes(item.id) ? 'border-accent ring-4 ring-accent/10' : 'border-gray-100'
                      }`}
                    >
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      
                      {/* STT badge for library item */}
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg shadow-xl border border-white/10 z-10">
                        #{getMediaSTT(item.id)}
                      </div>

                      {/* Room labels */}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1 pointer-events-none">
                        {getRoomsForMedia(item.url).map(room => (
                          <div key={room.id} className="px-2 py-1 bg-primary/80 backdrop-blur-md text-white text-[9px] font-bold rounded-lg shadow-lg border border-white/20">
                            STT {getRoomSTT(room.id)} - {room.title}
                          </div>
                        ))}
                      </div>

                      {selectedMediaIds.includes(item.id) && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center shadow-lg z-10">
                          <Check size={20} />
                        </div>
                      )}
                      {!isBulkMode && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setMediaToAssign(item);
                          }}
                          className="p-2 bg-white text-accent rounded-lg hover:bg-accent hover:text-white transition-all"
                          title="Gán cho phòng"
                        >
                          <HomeIcon size={16} />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(item.url);
                            toast.success('Đã sao chép liên kết ảnh!');
                          }}
                          className="p-2 bg-white text-primary rounded-lg hover:bg-accent hover:text-white transition-all"
                          title="Sao chép URL"
                        >
                          <Share2 size={16} />
                        </button>
                        <button
                          disabled={deletingMediaId === item.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaToDelete(item);
                          }}
                          className={`p-2 bg-white text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all ${deletingMediaId === item.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-[10px] text-white font-medium truncate">{item.name}</p>
                    </div>
                  </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {media.length === 0 && (
            <div className="text-center py-24 bg-paper rounded-[3rem] border border-dashed border-gray-200">
              <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-400 font-medium">Thư viện ảnh đang trống</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-12">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center space-x-4 md:space-x-6"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                <Database size={24} className="md:hidden" />
                <Database size={32} className="hidden md:block" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng số phòng</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">{stats.totalRooms}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center space-x-4 md:space-x-6"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-50 text-green-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                <CheckCheck size={24} className="md:hidden" />
                <CheckCheck size={32} className="hidden md:block" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Đang trống</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">{stats.availableRooms}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center space-x-4 md:space-x-6"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-50 text-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                <MessageSquare size={24} className="md:hidden" />
                <MessageSquare size={32} className="hidden md:block" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tin nhắn mới</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">{stats.unreadMessages}</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center space-x-4 md:space-x-6"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-50 text-purple-500 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                <TrendingUp size={24} className="md:hidden" />
                <TrendingUp size={32} className="hidden md:block" />
              </div>
              <div>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phòng nổi bật</p>
                <p className="text-2xl md:text-3xl font-bold text-primary">{stats.featuredRooms}</p>
              </div>
            </motion.div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-serif font-bold text-primary flex items-center space-x-3">
                  <PieChartIcon size={24} className="text-accent" />
                  <span>Phân bổ phòng theo Quận</span>
                </h3>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={districtData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {districtData.map((entry: any) => (
                        <Cell key={`dashboard-pie-cell-${entry.name}`} fill={COLORS[districtData.indexOf(entry) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-serif font-bold text-primary flex items-center space-x-3">
                  <BarChart3 size={24} className="text-accent" />
                  <span>Phân khúc giá thuê</span>
                </h3>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f9fafb' }}
                      contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#FF6B35" radius={[8, 8, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-serif font-bold text-primary flex items-center space-x-3">
                <Activity size={24} className="text-accent" />
                <span>Xu hướng tin nhắn (7 ngày qua)</span>
              </h3>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={messageTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#FF6B35" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#FF6B35', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="relative flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Tìm kiếm đánh giá..."
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon size={20} />
              </div>
            </div>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value as any)}
              className="px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-gray-600"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {paginatedReviews.map((review) => (
                <motion.div
                  key={review.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden">
                        {review.avatar ? (
                          <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                            {review.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-primary">{review.name}</h4>
                        <p className="text-xs text-gray-400">{review.role || 'Khách hàng'}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                      review.status === 'approved' ? 'bg-green-100 text-green-600' :
                      review.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      {review.status === 'approved' ? 'Đã duyệt' :
                       review.status === 'rejected' ? 'Đã từ chối' :
                       'Chờ duyệt'}
                    </div>
                  </div>

                  <div className="flex space-x-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={`review-star-${review.id}-${i}`} 
                          size={14} 
                          className={i < review.rating ? 'fill-accent text-accent' : 'text-gray-200'} 
                        />
                      ))}
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed mb-8 flex-grow italic">
                    "{review.content}"
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <span className="text-[10px] font-medium text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <div className="flex space-x-2">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveReview(review)}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                            title="Duyệt"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => updateReview(review.id, { status: 'rejected' })}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            title="Từ chối"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {review.status !== 'pending' && (
                         <button
                         onClick={() => updateReview(review.id, { status: 'pending' })}
                         className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 transition-colors"
                         title="Hoàn tác"
                       >
                         <Clock size={18} />
                       </button>
                      )}
                      <button
                        onClick={() => deleteReview(review.id)}
                        className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                        title="Xóa vĩnh viễn"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {totalReviewPages > 1 && (
            <div className="flex justify-center items-center space-x-4 pt-12">
              <button
                disabled={reviewPage === 1}
                onClick={() => setReviewPage(prev => prev - 1)}
                className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-primary disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="flex space-x-2">
                {[...Array(totalReviewPages)].map((_, i) => (
                  <button
                    key={`review-page-btn-${i}`}
                    onClick={() => setReviewPage(i + 1)}
                    className={`w-12 h-12 rounded-2xl font-bold text-sm transition-all ${
                      reviewPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={reviewPage === totalReviewPages}
                onClick={() => setReviewPage(prev => prev + 1)}
                className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-primary disabled:opacity-30 transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-10 md:p-14 border border-gray-100 shadow-2xl shadow-primary/5"
          >
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                <Settings2 size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-primary">Cấu hình hệ thống</h2>
                <p className="text-gray-400 text-sm">Quản lý thông tin liên hệ và mạng xã hội.</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 ml-2">
                    <PhoneCall size={16} className="text-accent" />
                    <span>Hotline liên hệ</span>
                  </label>
                  <input
                    type="text"
                    value={tempSettings.hotline}
                    onChange={(e) => setTempSettings({...tempSettings, hotline: e.target.value})}
                    placeholder="09xx xxx xxx"
                    className="w-full px-8 py-5 bg-paper border-2 border-transparent focus:bg-white focus:border-accent rounded-3xl outline-none transition-all font-bold text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 ml-2">
                    <Globe size={16} className="text-blue-500" />
                    <span>Link Zalo</span>
                  </label>
                  <input
                    type="text"
                    value={tempSettings.zalo}
                    onChange={(e) => setTempSettings({...tempSettings, zalo: e.target.value})}
                    placeholder="https://zalo.me/..."
                    className="w-full px-8 py-5 bg-paper border-2 border-transparent focus:bg-white focus:border-accent rounded-3xl outline-none transition-all font-bold"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 ml-2">
                    <Facebook size={16} className="text-blue-600" />
                    <span>Link Fanpage Facebook</span>
                  </label>
                  <input
                    type="text"
                    value={tempSettings.fanpage}
                    onChange={(e) => setTempSettings({...tempSettings, fanpage: e.target.value})}
                    placeholder="https://facebook.com/..."
                    className="w-full px-8 py-5 bg-paper border-2 border-transparent focus:bg-white focus:border-accent rounded-3xl outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full md:w-auto px-12 py-5 bg-primary hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary/10 flex items-center justify-center space-x-3 disabled:opacity-50"
                >
                  <CheckCheck size={20} />
                  <span>{isSavingSettings ? 'Đang lưu...' : 'Lưu lại thay đổi'}</span>
                </button>
              </div>
            </div>
          </motion.div>

          <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 flex items-start space-x-4">
             <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
               <AlertCircle size={20} />
             </div>
             <p className="text-sm text-blue-700 leading-relaxed font-medium">
               <strong>Lưu ý:</strong> Thông tin này sẽ được cập nhật ngay lập tức trên toàn bộ website, bao gồm trang chủ, chân trang (footer) và trang liên hệ. Hãy đảm bảo đường dẫn Zalo và Facebook là chính xác.
             </p>
          </div>
        </div>
      )}

      {activeTab === 'amenities' && (
        <div className="max-w-4xl mx-auto space-y-8">
           <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] p-10 md:p-14 border border-gray-100 shadow-2xl shadow-primary/5"
          >
            <div className="flex items-center space-x-4 mb-12">
              <div className="w-16 h-16 bg-accent/5 text-accent rounded-2xl flex items-center justify-center">
                <Wrench size={32} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-primary">Quản lý tiện ích</h2>
                <p className="text-gray-400 text-sm">Quản lý danh sách các tiện ích có thể chọn khi đăng phòng.</p>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                    placeholder="Nhập tên tiện ích mới (ví dụ: Sân thượng, Camera...)"
                    className="w-full pl-12 pr-6 py-5 bg-paper border-2 border-transparent focus:bg-white focus:border-accent rounded-2xl outline-none transition-all font-bold"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-accent">
                    <Sparkles size={20} />
                  </div>
                </div>
                <button
                  onClick={handleAddAmenity}
                  className="px-8 py-5 bg-accent hover:bg-primary text-white rounded-2xl font-bold transition-all shadow-lg shadow-accent/20 flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Thêm</span>
                </button>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                  <Library size={16} />
                  <span>Danh sách hiện tại ({tempAmenities.length})</span>
                </h4>
                
                <div className="flex flex-wrap gap-3">
                  {tempAmenities.map((amenity, idx) => (
                    <motion.div
                      key={`amenity-pill-${amenity}`}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex items-center space-x-2 px-6 py-4 bg-paper hover:bg-white border-2 border-transparent hover:border-accent/10 rounded-2xl transition-all"
                    >
                      <span className="font-bold text-gray-700">{amenity}</span>
                      <button
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                <button
                  onClick={handleSaveAmenities}
                  className="w-full md:w-auto px-12 py-5 bg-primary hover:bg-black text-white rounded-2xl font-bold transition-all shadow-xl shadow-primary/10 flex items-center justify-center space-x-3"
                >
                  <CheckCheck size={20} />
                  <span>Cập nhật tiện ích hệ thống</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full lg:max-w-3xl">
              <div className="w-full md:w-24">
                <input
                  type="number"
                  placeholder="STT"
                  value={filterSTT}
                  onChange={(e) => setFilterSTT(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-center"
                />
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, quận hoặc địa chỉ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </div>
              </div>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="w-full md:w-auto px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-gray-600"
              >
                <option value="all">Tất cả quận</option>
                <option value="Tân Phú">Tân Phú</option>
                <option value="Tân Bình">Tân Bình</option>
                <option value="Bình Tân">Bình Tân</option>
              </select>
              <select
                value={roomStatusFilter}
                onChange={(e) => setRoomStatusFilter(e.target.value as any)}
                className="w-full md:w-auto px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-gray-600"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="available">Còn phòng</option>
                <option value="unavailable">Hết phòng</option>
              </select>
              <select
                value={roomSort}
                onChange={(e) => setRoomSort(e.target.value as any)}
                className="w-full md:w-auto px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all font-bold text-gray-600"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp - Cao</option>
                <option value="price-desc">Giá: Cao - Thấp</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              <button
                onClick={() => handleOpenModal()}
                className="flex-1 lg:flex-none bg-accent hover:bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-2xl shadow-accent/20"
              >
                <Plus size={20} />
                <span>Đăng phòng mới</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">STT</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Thông tin phòng</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hidden sm:table-cell">Khu vực</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hidden sm:table-cell">Giá thuê</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hidden sm:table-cell">Ngày đăng</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400 hidden sm:table-cell">Trạng thái</th>
                    <th className="px-8 py-6 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedRooms.map((room) => {
                    const stt = getRoomSTT(room.id);
                    return (
                      <tr key={room.id} className="hover:bg-paper transition-colors group">
                        <td className="px-8 py-6">
                          <span className="text-sm font-bold text-gray-400">#{stt}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <img src={room.images[0]} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover shadow-sm" referrerPolicy="no-referrer" />
                            <div>
                              <p className="font-bold text-primary text-sm sm:text-base line-clamp-1 group-hover:text-accent transition-colors">{room.title}</p>
                              <p className="text-xs text-gray-400 font-medium hidden sm:block">{room.area} m² • {room.amenities.length} tiện ích</p>
                              <p className="text-xs font-bold text-accent sm:hidden">{new Intl.NumberFormat('vi-VN').format(room.price)}đ</p>
                            </div>
                          </div>
                        </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <span className="text-sm font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">{room.district}</span>
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <span className="text-sm font-bold text-accent">
                          {new Intl.NumberFormat('vi-VN').format(room.price)}đ
                        </span>
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <span className="text-sm font-medium text-gray-400">
                          {new Date(room.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-8 py-6 hidden sm:table-cell">
                        <button
                          onClick={() => toggleRoomStatus(room)}
                          className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95 ${
                            room.status === 'available' ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'
                          }`}
                        >
                          {room.status === 'available' ? 'Còn phòng' : 'Hết phòng'}
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => navigate(`/rooms/${room.id}`)}
                            className="p-2.5 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-xl transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenModal(room)}
                            className="p-2.5 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setDeleteConfirmId(room.id)}
                            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-8 py-6 bg-gray-50/30 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500 font-medium">
                  Hiển thị <span className="text-primary font-bold">{(currentPage - 1) * roomsPerPage + 1}</span> - <span className="text-primary font-bold">{Math.min(currentPage * roomsPerPage, filteredRooms.length)}</span> trong tổng số <span className="text-primary font-bold">{filteredRooms.length}</span> phòng
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRoomPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-accent hover:border-accent disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:border-gray-200 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Show first, last, and pages around current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={`room-page-btn-${pageNum}`}
                            onClick={() => handleRoomPageChange(pageNum)}
                            className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                              currentPage === pageNum
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white border border-gray-200 text-gray-500 hover:border-accent hover:text-accent'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                      if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <span key={`room-page-dots-${pageNum}`} className="text-gray-400">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => handleRoomPageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-accent hover:border-accent disabled:opacity-50 disabled:hover:text-gray-400 disabled:hover:border-gray-200 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-2xl shadow-primary/5"
          >
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-accent/10 text-accent rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Upload size={40} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-primary mb-4">Nhập dữ liệu hàng loạt</h2>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                Tải lên file Excel (.xlsx) hoặc CSV chứa danh sách phòng trọ của bạn để thêm hàng loạt vào hệ thống.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="p-8 bg-paper rounded-[2rem] border border-gray-100">
                <h3 className="font-bold text-primary mb-4 flex items-center space-x-2">
                  <Download size={18} className="text-accent" />
                  <span>Bước 1: Tải file mẫu</span>
                </h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Tải file CSV/Excel mẫu về máy, điền thông tin các phòng trọ theo đúng định dạng cột.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="w-full py-4 bg-white border-2 border-gray-100 hover:border-accent hover:text-accent rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2"
                >
                  <Download size={18} />
                  <span>Tải file mẫu (.csv)</span>
                </button>
              </div>

              <div className="p-8 bg-paper rounded-[2rem] border border-gray-100">
                <h3 className="font-bold text-primary mb-4 flex items-center space-x-2">
                  <Upload size={18} className="text-accent" />
                  <span>Bước 2: Tải lên hệ thống</span>
                </h3>
                <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                  Chọn file Excel hoặc CSV bạn đã điền thông tin để hệ thống tự động xử lý và thêm phòng.
                </p>
                <label className="block">
                  <span className="sr-only">Chọn file data</span>
                  <input
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={handleBulkUpload}
                    disabled={isImporting}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-4 file:px-8
                      file:rounded-xl file:border-0
                      file:text-sm file:font-bold
                      file:bg-primary file:text-white
                      hover:file:bg-accent transition-all
                      cursor-pointer disabled:opacity-50"
                  />
                </label>
              </div>
            </div>

            <div className="bg-orange-50 p-8 rounded-[2rem] border border-orange-100">
              <h4 className="font-bold text-orange-700 mb-4 flex items-center space-x-2">
                <AlertCircle size={18} />
                <span>Lưu ý quan trọng</span>
              </h4>
              <ul className="text-sm text-orange-600 space-y-3 list-disc pl-5 leading-relaxed">
                <li>Các cột <strong>title, price, area, district</strong> là bắt buộc.</li>
                <li><strong>amenities</strong>: Các tiện ích cách nhau bởi dấu phẩy (ví dụ: Máy lạnh, Tủ lạnh).</li>
                <li><strong>images</strong>: Các đường dẫn ảnh (URL) cách nhau bởi dấu phẩy.</li>
                <li>Nên nhập thử 1-2 dòng trước khi nhập số lượng lớn để đảm bảo định dạng đúng.</li>
              </ul>
            </div>
          </motion.div>
        </div>
      )}
      {activeTab === 'messages' && (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Tìm kiếm tin nhắn theo tên, số điện thoại..."
                value={messageSearch}
                onChange={(e) => setMessageSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon size={20} />
              </div>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl overflow-x-auto scrollbar-hide w-full md:w-auto">
              <button
                onClick={() => setMessageFilter('all')}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all shrink-0 ${
                  messageFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setMessageFilter('unread')}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all flex items-center space-x-2 shrink-0 ${
                  messageFilter === 'unread' ? 'bg-white text-accent shadow-sm' : 'text-gray-400 hover:text-accent'
                }`}
              >
                <span>Chưa đọc</span>
                {stats.unreadMessages > 0 && (
                  <span className="bg-accent text-white text-[10px] px-1.5 py-0.5 rounded-full">
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMessageFilter('processing')}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all shrink-0 ${
                  messageFilter === 'processing' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-400 hover:text-blue-500'
                }`}
              >
                Đang xử lý
              </button>
              <button
                onClick={() => setMessageFilter('completed')}
                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all shrink-0 ${
                  messageFilter === 'completed' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-400 hover:text-green-500'
                }`}
              >
                Đã chốt
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {paginatedMessages.map((msg) => {
            const room = msg.roomId ? rooms.find(r => r.id === msg.roomId) : null;
            const roomSTT = msg.roomId ? getRoomSTT(msg.roomId) : null;
            
            return (
              <div 
                key={msg.id} 
                className={`bg-white p-6 sm:p-10 rounded-[2.5rem] border shadow-sm relative group hover:shadow-xl transition-all ${
                  msg.isRead ? 'border-gray-100' : 'border-accent/30 ring-2 ring-accent/5'
                }`}
                onClick={() => !msg.isRead && updateMessage(msg.id, { isRead: true })}
              >
                {!msg.isRead && (
                  <div className="absolute -top-2 -left-2 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-accent/20 z-10 animate-bounce">
                    MỚI
                  </div>
                )}
                
                <div className="absolute top-8 right-8 flex items-center space-x-3">
                  <select
                    value={msg.status || 'pending'}
                    onChange={(e) => updateMessage(msg.id, { status: e.target.value as any })}
                    className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-lg border-none outline-none cursor-pointer transition-all ${
                      msg.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                      msg.status === 'completed' ? 'bg-green-50 text-green-600' :
                      msg.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                      'bg-gray-50 text-gray-500'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Đã chốt</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>

                  {msg.isRead && <CheckCheck size={18} className="text-green-500" title="Đã đọc" />}
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg.id);
                    }}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </div>

                <div className="flex items-center space-x-4 mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${
                    msg.isRead ? 'bg-gray-100 text-gray-400' : 'bg-accent/10 text-accent'
                  }`}>
                    {msg.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-primary text-lg">{msg.name}</h3>
                    <p className="text-xs text-gray-400 font-medium">{new Date(msg.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                </div>
                
                {room && (
                  <div 
                    className="mb-6 p-4 bg-paper rounded-2xl border border-gray-50 flex items-center space-x-3 cursor-pointer hover:bg-white hover:border-accent hover:shadow-md transition-all group/room"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (room) {
                        setActiveTab('rooms');
                        setFilterSTT(room.stt?.toString() || '');
                        handleOpenModal(room);
                        window.scrollTo(0, 0);
                      }
                    }}
                  >
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-accent font-bold text-xs shadow-sm shrink-0 group-hover/room:bg-accent group-hover/room:text-white transition-colors">
                      #{roomSTT}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quan tâm phòng</p>
                      <p className="text-sm font-bold text-primary truncate group-hover/room:text-accent transition-colors">{room.title}</p>
                    </div>
                    <div className="text-gray-300 group-hover/room:text-accent p-2">
                      <Eye size={18} />
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                        <Phone size={14} />
                    </div>
                    <span className="font-bold text-sm">{msg.phone}</span>
                  </div>
                  {msg.email && (
                    <div className="flex items-center space-x-3 text-gray-600 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                          <Mail size={14} />
                      </div>
                      <span className="font-medium text-sm truncate">{msg.email}</span>
                    </div>
                  )}
                </div>
                <div className="bg-paper p-6 rounded-3xl text-gray-700 leading-relaxed italic relative">
                  <span className="absolute -top-3 left-6 bg-white px-2 text-accent font-serif text-2xl">“</span>
                  {msg.content}
                </div>
              </div>
            );
          })}
          {filteredMessages.length === 0 && (
            <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
              <p className="text-gray-400 font-light text-lg">Chưa có tin nhắn nào từ khách hàng.</p>
            </div>
          )}
          </div>

          {/* Message Pagination */}
          {totalMessagePages > 1 && (
            <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">
                Trang <span className="text-primary font-bold">{messagePage}</span> trên <span className="text-primary font-bold">{totalMessagePages}</span>
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleMessagePageChange(Math.max(messagePage - 1, 1))}
                  disabled={messagePage === 1}
                  className="p-3 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-accent hover:border-accent disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center space-x-2">
                  {[...Array(totalMessagePages)].map((_, i) => {
                    const pageNum = i + 1;
                    if (pageNum === 1 || pageNum === totalMessagePages || (pageNum >= messagePage - 1 && pageNum <= messagePage + 1)) {
                      return (
                        <button
                          key={`msg-page-btn-${pageNum}`}
                          onClick={() => handleMessagePageChange(pageNum)}
                          className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                            messagePage === pageNum ? 'bg-primary text-white shadow-lg shadow-primary/10' : 'bg-white border border-gray-100 text-gray-400 hover:border-accent hover:text-accent'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === messagePage - 2 || pageNum === messagePage + 2) return <span key={`msg-page-dots-${pageNum}`} className="text-gray-300">...</span>;
                    return null;
                  })}
                </div>
                <button
                  onClick={() => handleMessagePageChange(Math.min(messagePage + 1, totalMessagePages))}
                  disabled={messagePage === totalMessagePages}
                  className="p-3 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-accent hover:border-accent disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Room Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-paper">
                <h2 className="text-2xl font-serif font-bold text-primary">
                  {editingRoom ? 'Chỉnh sửa không gian' : 'Đăng phòng mới'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2.5 hover:bg-gray-200 rounded-full transition-colors">
                  <X size={22} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 max-h-[75vh] overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                  <div className="md:col-span-6">
                    <label className="block text-base font-bold text-gray-700 mb-2">Tiêu đề phòng</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white border rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all text-lg font-medium"
                      placeholder="VD: Studio cao cấp trung tâm Tân Phú"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-base font-bold text-gray-700 mb-2">Giá thuê (VND)</label>
                    <input
                      type="number"
                      required
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                      className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white border rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all text-lg font-medium"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-base font-bold text-gray-700 mb-2">Diện tích (m²)</label>
                    <input
                      type="number"
                      required
                      value={formData.area || ''}
                      onChange={(e) => setFormData({ ...formData, area: parseInt(e.target.value) || 0 })}
                      className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white border rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all text-lg font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-base font-bold text-gray-700 mb-2">Quận/Huyện</label>
                    <select
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value as Room['district'] })}
                      className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white border rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all text-lg font-bold text-gray-600"
                    >
                      <option value="Tân Phú">Tân Phú</option>
                      <option value="Tân Bình">Tân Bình</option>
                      <option value="Bình Tân">Bình Tân</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-bold text-gray-700 mb-2">Phường</label>
                    <input
                      type="text"
                      required
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white border rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all text-lg font-medium"
                      placeholder="VD: Tân Thành"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-base font-bold text-gray-700 mb-2">Tên đường</label>
                    <input
                      type="text"
                      required
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white border rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all text-lg font-medium"
                      placeholder="VD: Lũy Bán Bích"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-base font-bold text-gray-700 mb-2">Địa chỉ chi tiết (Tự động cập nhật)</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white border rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all text-lg font-medium"
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-base font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-transparent focus:bg-white border rounded-2xl focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all resize-none text-lg font-medium"
                    ></textarea>
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-base font-bold text-gray-700 mb-2">Tiện ích không gian</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                      {amenities.map((amenity, idx) => {
                        const isSelected = formData.amenities.includes(amenity);
                        return (
                          <button
                            key={`form-amenity-${amenity}`}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                amenities: isSelected 
                                  ? prev.amenities.filter(a => a !== amenity)
                                  : [...prev.amenities, amenity]
                              }));
                            }}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
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
                  
                  <div className="md:col-span-6">
                    <label className="block text-base font-bold text-gray-700 mb-2">Hình ảnh phòng</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-2">
                      {formData.images.map((img, idx) => (
                        <div key={`form-preview-img-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group shadow-sm border border-gray-100">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-accent hover:text-accent transition-all bg-gray-50"
                      >
                        <Upload size={24} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Tải ảnh</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsMediaSelectorOpen(true)}
                        className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-accent hover:text-accent transition-all bg-gray-50"
                      >
                        <Library size={24} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Thư viện</span>
                      </button>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="md:col-span-6 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 flex items-center space-x-4 bg-paper p-6 rounded-2xl border border-gray-100">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        className="w-6 h-6 accent-accent rounded-lg"
                      />
                      <label htmlFor="isFeatured" className="text-base font-bold text-primary">Phòng Premium (Nổi bật)</label>
                    </div>
                    {editingRoom && (
                      <div className="flex-1 flex items-center space-x-4 bg-paper p-6 rounded-2xl border border-gray-100">
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as Room['status'] })}
                          className="bg-transparent font-bold text-base text-primary outline-none w-full"
                        >
                          <option value="available">Còn phòng</option>
                          <option value="unavailable">Hết phòng</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-10 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-5 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-8 py-5 bg-primary hover:bg-black text-white rounded-2xl font-bold transition-all shadow-2xl shadow-primary/20"
                  >
                    {editingRoom ? 'Cập nhật thay đổi' : 'Đăng phòng ngay'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-primary/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary mb-4">Xác nhận xóa?</h3>
              <p className="text-gray-500 mb-10 font-light">Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa phòng này không?</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    await deleteRoom(deleteConfirmId);
                    setDeleteConfirmId(null);
                    toast.success('Đã xóa phòng thành công');
                  }}
                  className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20"
                >
                  Xóa ngay
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Media Delete Confirmation Modal */}
        {mediaToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setMediaToDelete(null)}
              className="absolute inset-0 bg-primary/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon size={40} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-primary mb-4">Xóa ảnh?</h3>
              <p className="text-gray-500 mb-10 font-light">Ảnh này sẽ bị xóa vĩnh viễn khỏi thư viện và không thể phục hồi.</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setMediaToDelete(null)}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  disabled={deletingMediaId === mediaToDelete.id}
                  onClick={async () => {
                    try {
                      setDeletingMediaId(mediaToDelete.id);
                      await deleteMedia(mediaToDelete.id);
                      toast.success('Đã xóa ảnh thành công');
                      setMediaToDelete(null);
                    } catch (error: any) {
                      let errorMessage = error.message || 'Lỗi không xác định';
                      try {
                        if (errorMessage.includes('{')) {
                          const parsed = JSON.parse(errorMessage);
                          errorMessage = parsed.error || errorMessage;
                        }
                      } catch (e) {}
                      toast.error(`Lỗi: ${errorMessage}`);
                    } finally {
                      setDeletingMediaId(null);
                    }
                  }}
                  className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center space-x-2"
                >
                  {deletingMediaId === mediaToDelete.id ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Xóa ngay</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Media Assign Modal */}
        {mediaToAssign && (
          <div className="fixed inset-0 z-[140] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setMediaToAssign(null)}
              className="absolute inset-0 bg-primary/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-serif font-bold text-primary">Gán ảnh cho phòng</h3>
                  <p className="text-gray-500 font-light text-sm">Chọn phòng bạn muốn thêm ảnh này vào</p>
                </div>
                <button 
                  onClick={() => setMediaToAssign(null)}
                  className="p-3 hover:bg-gray-100 rounded-full transition-all text-gray-400"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {mediaToAssign.multi ? (
                    <div className="w-24 h-24 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center shadow-sm">
                      <Library size={32} className="text-accent" />
                    </div>
                  ) : (
                    <img 
                      src={mediaToAssign.url} 
                      alt={mediaToAssign.name} 
                      className="w-24 h-24 object-cover rounded-xl shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="font-bold text-primary truncate">
                      {mediaToAssign.multi ? `Đang gán ${selectedMediaIds.length} ảnh` : mediaToAssign.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">
                      {mediaToAssign.multi 
                        ? 'Chế độ gán hàng loạt'
                        : `${(mediaToAssign.size / 1024).toFixed(1)} KB • ${mediaToAssign.type.split('/')[1].toUpperCase()}`
                      }
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Chọn phòng mục tiêu</label>
                  <div className="relative">
                    <select
                      value={assigningRoomId}
                      onChange={(e) => setAssigningRoomId(e.target.value)}
                      className="w-full bg-white border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent appearance-none transition-all font-medium text-primary shadow-sm"
                    >
                      <option value="">-- Chọn một phòng --</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                          STT {getRoomSTT(room.id)} - {room.title} - {room.district} - {room.price.toLocaleString('vi-VN')}đ
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronRight size={18} className="rotate-90" />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setMediaToAssign(null)}
                    className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    disabled={!assigningRoomId || isAssigning}
                    onClick={async () => {
                      if (!assigningRoomId) return;
                      setIsAssigning(true);
                      try {
                        const targetRoom = rooms.find(r => r.id === assigningRoomId);
                        if (targetRoom) {
                          let newImages: string[] = [];
                          
                          if (mediaToAssign.multi) {
                            newImages = media
                              .filter(m => selectedMediaIds.includes(m.id))
                              .map(m => m.url);
                          } else {
                            newImages = [mediaToAssign.url];
                          }
                          
                          await updateRoom(assigningRoomId, { images: newImages });
                          toast.success(`Đã thay thế toàn bộ ảnh cho phòng ${targetRoom.title} (STT ${getRoomSTT(targetRoom.id)})`);
                          setMediaToAssign(null);
                          setIsBulkMode(false);
                          setSelectedMediaIds([]);
                        }
                      } catch (error) {
                        toast.error('Không thể gán ảnh cho phòng');
                      } finally {
                        setIsAssigning(false);
                      }
                    }}
                    className="flex-1 px-6 py-4 bg-accent hover:bg-primary text-white rounded-2xl font-bold transition-all shadow-lg shadow-accent/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAssigning ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Check size={20} />
                        <span>Xác nhận gán {mediaToAssign.multi ? selectedMediaIds.length : ''} ảnh</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Media Selector Modal */}
        {isMediaSelectorOpen && (
            <div className="fixed inset-0 z-[130] flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMediaSelectorOpen(false)}
                className="absolute inset-0 bg-primary/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden h-[80vh] flex flex-col"
              >
                <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-paper">
                  <h2 className="text-2xl font-serif font-bold text-primary">Chọn ảnh từ thư viện</h2>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Tìm ảnh..."
                        value={mediaSearch}
                        onChange={(e) => setMediaSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm outline-none"
                      />
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    </div>
                    <button onClick={() => setIsMediaSelectorOpen(false)} className="p-2.5 hover:bg-gray-200 rounded-full transition-colors">
                      <X size={22} />
                    </button>
                  </div>
                </div>

                <div className="p-10 overflow-y-auto flex-1 h-full space-y-12">
                  {Object.entries(
                    (media || [])
                      .filter(item => item.name.toLowerCase().includes(mediaSearch.toLowerCase()))
                      .reduce((groups: Record<string, any[]>, item) => {
                        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric' 
                        }) : 'Không rõ ngày';
                        if (!groups[date]) groups[date] = [];
                        groups[date].push(item);
                        return groups;
                      }, {} as Record<string, any[]>)
                  )
                  .sort((a, b) => {
                    const dateA = a[0].split('/').reverse().join('-');
                    const dateB = b[0].split('/').reverse().join('-');
                    return new Date(dateB).getTime() - new Date(dateA).getTime();
                  })
                  .map(([date, items]: [string, any[]], groupIdx) => (
                    <div key={`room-selector-group-${date}-${groupIdx}`} className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-xs font-bold text-primary uppercase tracking-widest">{date}</h3>
                        <div className="h-[1px] flex-1 bg-gray-100"></div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {items.map((item: any) => {
                          const isSelected = formData.images.includes(item.url);
                          return (
                            <div 
                              key={`selector-item-${item.id}`}
                              onClick={() => {
                                if (isSelected) {
                                  setFormData(prev => ({ ...prev, images: prev.images.filter(img => img !== item.url) }));
                                } else if (formData.images.length < 8) {
                                  setFormData(prev => ({ ...prev, images: [...prev.images, item.url] }));
                                } else {
                                  toast.error('Tối đa 8 ảnh');
                                }
                              }}
                              className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${isSelected ? 'border-accent ring-4 ring-accent/10' : 'border-transparent opacity-80 hover:opacity-100'}`}
                            >
                              <img src={item.url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                                  <div className="bg-white text-accent p-2 rounded-full shadow-lg">
                                    <Check size={24} strokeWidth={3} />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-10 py-6 border-t border-gray-100 bg-paper flex justify-between items-center">
                  <p className="text-sm font-bold text-gray-500">Đã chọn: <span className="text-accent">{formData.images.filter(img => media.some(m => m.url === img)).length}</span> ảnh từ thư viện</p>
                  <button
                    onClick={() => setIsMediaSelectorOpen(false)}
                    className="px-10 py-4 bg-primary text-white rounded-2xl font-bold"
                  >
                    Xong
                  </button>
                </div>
              </motion.div>
            </div>
          )}
      </AnimatePresence>
      </div>
    </div>
  );
}
