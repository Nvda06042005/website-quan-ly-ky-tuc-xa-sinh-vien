import { useEffect, useState } from 'react';
import { localStorageService, Request } from '../services/localStorageService';
import { useAuthStore } from '../store/authStore';

const Requests = () => {
  const user = useAuthStore((state) => state.user);
  const [requests, setRequests] = useState<Request[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    roomId: '',
    type: 'maintenance' as 'maintenance' | 'complaint' | 'other',
    title: '',
    description: '',
  });

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = () => {
    if (user?.role === 'student') {
      setRequests(localStorageService.getRequestsByUserId(user._id));
    } else {
      setRequests(localStorageService.getRequests());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    localStorageService.addRequest({
      userId: user!._id,
      roomId: formData.roomId,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      status: 'pending',
    });

    setShowAddModal(false);
    setFormData({ roomId: '', type: 'maintenance', title: '', description: '' });
    loadRequests();
  };

  const handleUpdateStatus = (id: string, status: Request['status']) => {
    localStorageService.updateRequest(id, { status });
    loadRequests();
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: 'Chờ xử lý',
      in_progress: 'Đang xử lý',
      completed: 'Hoàn thành',
      rejected: 'Từ chối',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      maintenance: 'Bảo trì',
      complaint: 'Khiếu nại',
      other: 'Khác',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'maintenance') {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    } else if (type === 'complaint') {
      return (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    );
  };

  const getRoomInfo = (roomId: string) => {
    const room = localStorageService.getRoomById(roomId);
    return room ? `Phòng ${room.roomNumber} - Tòa ${room.building}` : 'N/A';
  };

  const getUserInfo = (userId: string) => {
    const reqUser = localStorageService.getUserById(userId);
    return reqUser ? `${reqUser.fullName}` : 'N/A';
  };

  const rooms = localStorageService.getRooms();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Yêu cầu bảo trì / Khiếu nại</h1>
        {user?.role === 'student' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            + Tạo yêu cầu mới
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="card p-6 border-l-4 border-yellow-500">
          <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {requests.filter(r => r.status === 'pending').length}
          </p>
        </div>

        <div className="card p-6 border-l-4 border-blue-500">
          <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {requests.filter(r => r.status === 'in_progress').length}
          </p>
        </div>

        <div className="card p-6 border-l-4 border-green-500">
          <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {requests.filter(r => r.status === 'completed').length}
          </p>
        </div>

        <div className="card p-6 border-l-4 border-gray-500">
          <p className="text-sm font-medium text-gray-600">Tổng yêu cầu</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{requests.length}</p>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {requests.map((req) => {
          const room = localStorageService.getRoomById(req.roomId);
          const reqUser = localStorageService.getUserById(req.userId);

          return (
            <div key={req._id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getTypeIcon(req.type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{req.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{req.description}</p>
                  </div>
                </div>
                {getStatusBadge(req.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{room ? `Phòng ${room.roomNumber} - Tòa ${room.building}` : 'N/A'}</span>
                </div>

                {(user?.role === 'admin' || user?.role === 'manager') && reqUser && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{reqUser.fullName}</span>
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span>{getTypeLabel(req.type)}</span>
                </div>

                <div className="flex items-center text-gray-500 text-xs">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(req.createdAt).toLocaleDateString('vi-VN')} {new Date(req.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              {(user?.role === 'admin' || user?.role === 'manager') && req.status !== 'completed' && req.status !== 'rejected' && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'in_progress')}
                        className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Bắt đầu xử lý
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'rejected')}
                        className="px-3 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Từ chối
                      </button>
                    </>
                  )}
                  {req.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(req._id, 'completed')}
                      className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      ✓ Hoàn thành
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {requests.length === 0 && (
        <div className="text-center py-12 card">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">Chưa có yêu cầu nào</p>
        </div>
      )}

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Tạo yêu cầu mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Phòng</label>
                <select
                  className="input"
                  value={formData.roomId}
                  onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                  required
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>
                      Phòng {room.roomNumber} - Tòa {room.building}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Loại yêu cầu</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  required
                >
                  <option value="maintenance">Bảo trì</option>
                  <option value="complaint">Khiếu nại</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ví dụ: Sửa quạt hỏng"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả chi tiết</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Mô tả chi tiết vấn đề..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Gửi yêu cầu
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

export default Requests;
