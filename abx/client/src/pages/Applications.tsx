import { useEffect, useState } from 'react';
import { localStorageService, Application } from '../services/localStorageService';
import { useAuthStore } from '../store/authStore';

const Applications = () => {
  const user = useAuthStore((state) => state.user);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    semester: '',
    academicYear: '',
  });

  useEffect(() => {
    loadApplications();
  }, [user]);

  const loadApplications = () => {
    if (user?.role === 'student') {
      setApplications(localStorageService.getApplicationsByUserId(user._id));
    } else {
      setApplications(localStorageService.getApplications());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    localStorageService.addApplication({
      userId: user!._id,
      roomId: formData.roomId,
      semester: formData.semester,
      academicYear: formData.academicYear,
      status: 'pending',
    });

    setShowAddModal(false);
    setFormData({ roomId: '', semester: '', academicYear: '' });
    loadApplications();
  };

  const handleApprove = (id: string) => {
    const application = applications.find(app => app._id === id);
    if (!application) return;

    // Cập nhật trạng thái đơn
    localStorageService.updateApplication(id, { status: 'approved' });

    // Lấy thông tin phòng để tính giá
    const room = localStorageService.getRoomById(application.roomId);
    if (!room) return;

    // Tự động tạo hợp đồng
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 5); // Hợp đồng 5 tháng (1 học kỳ)

    const monthlyRent = Math.round(room.pricePerSemester / 5); // Chia đều cho 5 tháng

    const newContract = localStorageService.addContract({
      userId: application.userId,
      roomId: application.roomId,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      status: 'active',
      monthlyRent: monthlyRent,
    });

    // Tự động tạo hóa đơn tháng đầu tiên
    if (newContract) {
      const firstInvoiceDue = new Date();
      firstInvoiceDue.setDate(5); // Hạn thanh toán ngày 5 hàng tháng
      if (firstInvoiceDue < new Date()) {
        firstInvoiceDue.setMonth(firstInvoiceDue.getMonth() + 1);
      }

      localStorageService.addInvoice({
        userId: application.userId,
        contractId: newContract._id,
        amount: monthlyRent,
        dueDate: firstInvoiceDue.toISOString().split('T')[0],
        status: 'pending',
        type: 'room_rent',
      });

      // Cập nhật số lượng người ở trong phòng
      localStorageService.updateRoom(application.roomId, {
        currentOccupancy: (room.currentOccupancy || 0) + 1,
        status: ((room.currentOccupancy || 0) + 1) >= room.capacity ? 'occupied' : 'available',
      });

      alert('✅ Đã duyệt đơn thành công!\n📝 Tự động tạo hợp đồng và hóa đơn tháng đầu tiên.');
    }

    loadApplications();
  };

  const handleReject = (id: string) => {
    if (confirm('Bạn có chắc muốn từ chối đơn này?')) {
      localStorageService.updateApplication(id, { status: 'rejected' });
      loadApplications();
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
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
    const appUser = localStorageService.getUserById(userId);
    return appUser ? `${appUser.fullName} (${appUser.email})` : 'N/A';
  };

  const availableRooms = localStorageService.getRooms().filter(r => r.status === 'available');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Đơn đăng ký phòng</h1>
        {user?.role === 'student' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            + Đăng ký phòng mới
          </button>
        )}
      </div>

      {/* Applications Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinh viên</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phòng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học kỳ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Năm học</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {applications.map((app, idx) => (
                <tr key={app._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <td className="px-6 py-4 text-sm text-gray-900">{getUserInfo(app.userId)}</td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-900">{getRoomInfo(app.roomId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.semester}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{app.academicYear}</td>
                  <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <td className="px-6 py-4">
                      {app.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(app._id)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(app._id)}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Từ chối
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có đơn đăng ký nào</p>
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Đăng ký phòng mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Chọn phòng</label>
                <select
                  className="input"
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {availableRooms.map(room => (
                    <option key={room._id} value={room._id}>
                      Phòng {room.roomNumber} - Tòa {room.building} ({room.pricePerSemester.toLocaleString('vi-VN')} VNĐ)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Học kỳ</label>
                <select
                  className="input"
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  required
                >
                  <option value="">-- Chọn học kỳ --</option>
                  <option value="1">Học kỳ 1</option>
                  <option value="2">Học kỳ 2</option>
                  <option value="3">Học kỳ hè</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Năm học</label>
                <input
                  type="text"
                  className="input"
                  placeholder="2024-2025"
                  value={formData.academicYear}
                  onChange={(e) => setFormData({...formData, academicYear: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Gửi đơn
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

export default Applications;
