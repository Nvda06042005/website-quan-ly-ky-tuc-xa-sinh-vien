import { useEffect, useState } from 'react';
import { localStorageService, Contract } from '../services/localStorageService';
import { useAuthStore } from '../store/authStore';

const Contracts = () => {
  const user = useAuthStore((state) => state.user);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    roomId: '',
    startDate: '',
    endDate: '',
    monthlyRent: 400000,
  });

  useEffect(() => {
    loadContracts();
  }, [user]);

  const loadContracts = () => {
    if (user?.role === 'student') {
      setContracts(localStorageService.getContractsByUserId(user._id));
    } else {
      setContracts(localStorageService.getContracts());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tạo hợp đồng mới
    const newContract = localStorageService.addContract({
      userId: formData.userId,
      roomId: formData.roomId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      monthlyRent: formData.monthlyRent,
      status: 'active',
    });

    // Tự động tạo hóa đơn tháng đầu tiên
    if (newContract) {
      const firstInvoiceDue = new Date();
      firstInvoiceDue.setDate(5); // Hạn thanh toán ngày 5 hàng tháng
      if (firstInvoiceDue < new Date()) {
        firstInvoiceDue.setMonth(firstInvoiceDue.getMonth() + 1);
      }

      localStorageService.addInvoice({
        userId: formData.userId,
        contractId: newContract._id,
        amount: formData.monthlyRent,
        dueDate: firstInvoiceDue.toISOString().split('T')[0],
        status: 'pending',
        type: 'room_rent',
      });

      // Cập nhật trạng thái phòng
      const room = localStorageService.getRoomById(formData.roomId);
      if (room) {
        localStorageService.updateRoom(formData.roomId, {
          currentOccupancy: (room.currentOccupancy || 0) + 1,
          status: ((room.currentOccupancy || 0) + 1) >= room.capacity ? 'occupied' : 'available',
        });
      }

      alert('✅ Đã tạo hợp đồng thành công!\n📝 Tự động tạo hóa đơn tháng đầu tiên.');
    }

    setShowAddModal(false);
    setFormData({
      userId: '',
      roomId: '',
      startDate: '',
      endDate: '',
      monthlyRent: 400000,
    });
    loadContracts();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-700',
      terminated: 'bg-red-100 text-red-700',
    };
    const labels = {
      active: 'Đang hiệu lực',
      expired: 'Hết hạn',
      terminated: 'Đã hủy',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getRoomInfo = (roomId: string) => {
    const room = localStorageService.getRoomById(roomId);
    return room ? `Phòng ${room.roomNumber} - Tòa ${room.building}` : 'N/A';
  };

  const getUserInfo = (userId: string) => {
    const contractUser = localStorageService.getUserById(userId);
    return contractUser ? `${contractUser.fullName} (${contractUser.studentId || 'N/A'})` : 'N/A';
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${months} tháng`;
  };

  const availableRooms = localStorageService.getRooms().filter(r => r.status === 'available');
  const students = localStorageService.getUsers().filter(u => u.role === 'student');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hợp đồng</h1>
        {(user?.role === 'admin' || user?.role === 'manager') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            + Tạo hợp đồng mới
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hiệu lực</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {contracts.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hết hạn</p>
              <p className="mt-2 text-3xl font-bold text-gray-600">
                {contracts.filter(c => c.status === 'expired').length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng hợp đồng</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">{contracts.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {contracts.map((contract) => {
          const room = localStorageService.getRoomById(contract.roomId);
          const contractUser = localStorageService.getUserById(contract.userId);
          
          return (
            <div key={contract._id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {room ? `Phòng ${room.roomNumber} - Tòa ${room.building}` : 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {contractUser ? contractUser.fullName : 'N/A'}
                      {contractUser?.studentId && ` - ${contractUser.studentId}`}
                    </p>
                  </div>
                </div>
                {getStatusBadge(contract.status)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(contract.startDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Ngày kết thúc</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Thời hạn</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {calculateDuration(contract.startDate, contract.endDate)}
                  </p>
                </div>

                <div className="p-3 bg-primary-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Giá thuê/tháng</p>
                  <p className="text-sm font-semibold text-primary-600">
                    {contract.monthlyRent.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>

              {room && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Loại phòng: {room.type === 'standard' ? 'Tiêu chuẩn' : room.type === 'vip' ? 'VIP' : 'Cao cấp'}</span>
                    <span className="mx-2">•</span>
                    <span>Sức chứa: {room.capacity} người</span>
                    <span className="mx-2">•</span>
                    <span>Tầng {room.floor}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {contracts.length === 0 && (
        <div className="text-center py-12 card">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-500">Chưa có hợp đồng nào</p>
        </div>
      )}

      {/* Add Contract Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tạo hợp đồng mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sinh viên</label>
                <select
                  className="input"
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  required
                >
                  <option value="">-- Chọn sinh viên --</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.fullName} ({student.studentId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phòng</label>
                <select
                  className="input"
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {availableRooms.map(room => (
                    <option key={room._id} value={room._id}>
                      Phòng {room.roomNumber} - Tòa {room.building}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                  <input
                    type="date"
                    className="input"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Giá thuê/tháng (VNĐ)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({...formData, monthlyRent: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Tạo hợp đồng
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

export default Contracts;
