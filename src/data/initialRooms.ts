import { Room } from '../types';

export const initialRooms: Room[] = [
  {
    id: '1',
    title: 'Phòng trọ cao cấp Full nội thất - Gần ĐH Công Thương',
    price: 4500000,
    area: 25,
    district: 'Tân Phú',
    ward: 'Tây Thạnh',
    street: 'Lê Trọng Tấn',
    address: '140 Lê Trọng Tấn, Tây Thạnh, Tân Phú, TP.HCM',
    description: 'Phòng mới xây, đầy đủ nội thất: giường, tủ, máy lạnh, tủ lạnh. Giờ giấc tự do, bảo vệ 24/7. Gần trường đại học, siêu thị Aeon Mall.',
    amenities: ['Máy lạnh', 'Tủ lạnh', 'Giường nệm', 'Tủ quần áo', 'Wifi', 'Máy giặt chung', 'Bảo vệ'],
    images: [
      'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    coordinates: { lat: 10.8067, lng: 106.6286 },
    contactPhone: '0901234567',
    isFeatured: true,
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Căn hộ dịch vụ yên tĩnh - Khu Bàu Cát',
    price: 5500000,
    area: 30,
    district: 'Tân Bình',
    ward: 'Phường 14',
    street: 'Bàu Cát 3',
    address: '45 Bàu Cát 3, Phường 14, Tân Bình, TP.HCM',
    description: 'Khu vực an ninh, yên tĩnh, dân trí cao. Phòng rộng rãi, ban công thoáng mát. Phù hợp cho nhân viên văn phòng hoặc gia đình trẻ.',
    amenities: ['Máy lạnh', 'Bếp riêng', 'Ban công', 'Thang máy', 'Bãi đậu xe', 'Camera an ninh'],
    images: [
      'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    coordinates: { lat: 10.7938, lng: 106.6447 },
    contactPhone: '0987654321',
    isFeatured: true,
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Phòng trọ giá rẻ cho sinh viên - Gần Aeon Bình Tân',
    price: 2500000,
    area: 18,
    district: 'Bình Tân',
    ward: 'An Lạc A',
    street: 'Đường số 7',
    address: '12 Đường số 7, An Lạc A, Bình Tân, TP.HCM',
    description: 'Phòng sạch sẽ, có gác lửng, toilet riêng. Gần bến xe Miền Tây, Aeon Mall Bình Tân. Điện nước giá nhà nước.',
    amenities: ['Gác lửng', 'Toilet riêng', 'Wifi', 'Chỗ để xe'],
    images: [
      'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    coordinates: { lat: 10.7489, lng: 106.6128 },
    contactPhone: '0912345678',
    isFeatured: false,
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Studio hiện đại - Gần sân bay Tân Sơn Nhất',
    price: 6000000,
    area: 35,
    district: 'Tân Bình',
    ward: 'Phường 2',
    street: 'Phổ Quang',
    address: '102 Phổ Quang, Phường 2, Tân Bình, TP.HCM',
    description: 'Thiết kế hiện đại, không gian mở. Đầy đủ tiện nghi cao cấp. Gần công viên Gia Định, sân bay. Thuận tiện di chuyển vào trung tâm.',
    amenities: ['Full nội thất', 'Hồ bơi', 'Gym', 'An ninh 24/7', 'Hầm xe'],
    images: [
      'https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    coordinates: { lat: 10.8083, lng: 106.6667 },
    contactPhone: '0933445566',
    isFeatured: true,
    status: 'available',
    createdAt: new Date().toISOString()
  }
];
