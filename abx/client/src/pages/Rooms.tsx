import { useEffect, useState } from 'react';
import { localStorageService, Room } from '../services/localStorageService';
import { useAuthStore } from '../store/authStore';

const Rooms = () => {
  const user = useAuthStore((state) => state.user);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    building: '',
    floor: 1,
    type: 'standard' as 'standard' | 'vip' | 'deluxe',
    capacity: 6,
    pricePerSemester: 2000000,
    amenities: [] as string[],
  });

  useEffect(() => {
    loadRooms();
  }, [filter]);

  const loadRooms = () => {
    const allRooms = localStorageService.getRooms();
    const filtered = filter === 'all' 
      ? allRooms 
      : allRooms.filter(r => r.status === filter);
    setRooms(filtered);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    localStorageService.addRoom({
      ...formData,
      currentOccupancy: 0,
      status: 'available',
    });

    setShowAddModal(false);
    setFormData({
      roomNumber: '',
      building: '',
      floor: 1,
      type: 'standard',
      capacity: 6,
      pricePerSemester: 2000000,
      amenities: [],
    });
    loadRooms();
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      localStorageService.deleteRoom(id);
      loadRooms();
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      available: 'bg-green-100 text-green-700',
      occupied: 'bg-blue-100 text-blue-700',
      maintenance: 'bg-yellow-100 text-yellow-700',
    };
    const labels = {
      available: 'Còn trống',
      occupied: 'Đã đầy',
      maintenance: 'Bảo trì',
    };
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getRoomTypeLabel = (type: string) => {
    const labels = {
      standard: 'Tiêu chuẩn',
      vip: 'VIP',
      deluxe: 'Cao cấp',
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng</h1>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            + Thêm phòng mới
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Tất cả ({localStorageService.getRooms().length})
        </button>
        <button
          onClick={() => setFilter('available')}
          className={`px-4 py-2 rounded-lg ${filter === 'available' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Còn trống ({localStorageService.getRooms().filter(r => r.status === 'available').length})
        </button>
        <button
          onClick={() => setFilter('occupied')}
          className={`px-4 py-2 rounded-lg ${filter === 'occupied' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Đã đầy ({localStorageService.getRooms().filter(r => r.status === 'occupied').length})
        </button>
        <button
          onClick={() => setFilter('maintenance')}
          className={`px-4 py-2 rounded-lg ${filter === 'maintenance' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Bảo trì ({localStorageService.getRooms().filter(r => r.status === 'maintenance').length})
        </button>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <div key={room._id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Phòng {room.roomNumber}</h3>
                <p className="text-sm text-gray-600 mt-1">Tòa {room.building} - Tầng {room.floor}</p>
              </div>
              {getStatusBadge(room.status)}
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Loại:</span> {getRoomTypeLabel(room.type)}
              </p>
              <p className="text-sm">
                <span className="font-medium">Giá:</span> {room.pricePerSemester.toLocaleString('vi-VN')} VNĐ/học kỳ
              </p>
              <p className="text-sm">
                <span className="font-medium">Sức chứa:</span> {room.currentOccupancy}/{room.capacity} người
              </p>
              <div className="text-sm">
                <span className="font-medium">Tiện nghi:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {room.amenities.map((amenity, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {(user?.role === 'admin' || user?.role === 'manager') && (
              <div className="mt-4 flex gap-2">
                <button className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700">
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => handleDelete(room._id)}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy phòng nào</p>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Thêm phòng mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Số phòng</label>
                <input
                  type="text"
                  className="input"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tòa</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.building}
                    onChange={(e) => setFormData({...formData, building: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tầng</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Loại phòng</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="standard">Tiêu chuẩn</option>
                  <option value="vip">VIP</option>
                  <option value="deluxe">Cao cấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Sức chứa</label>
                <input
                  type="number"
                  className="input"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Giá (VNĐ/học kỳ)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.pricePerSemester}
                  onChange={(e) => setFormData({...formData, pricePerSemester: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tiện nghi (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Giường, Tủ, Quạt, WC riêng"
                  onChange={(e) => setFormData({...formData, amenities: e.target.value.split(',').map(s => s.trim())})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Thêm phòng
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
