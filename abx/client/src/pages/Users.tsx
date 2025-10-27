import { useEffect, useState } from 'react';
import { localStorageService, User } from '../services/localStorageService';
import { useAuthStore } from '../store/authStore';
import { simpleHash } from '../services/localStorageService';

const Users = () => {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<'all' | 'student' | 'manager' | 'admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    studentId: '',
    class: '',
    role: 'student' as 'student' | 'manager' | 'admin',
  });

  useEffect(() => {
    loadUsers();
  }, [filter, searchTerm]);

  const loadUsers = () => {
    let allUsers = localStorageService.getUsers();
    
    // Filter by role
    if (filter !== 'all') {
      allUsers = allUsers.filter(u => u.role === filter);
    }
    
    // Search
    if (searchTerm) {
      allUsers = allUsers.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phoneNumber.includes(searchTerm) ||
        (u.studentId && u.studentId.includes(searchTerm))
      );
    }
    
    setUsers(allUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hashedPassword = await simpleHash(formData.password);
    localStorageService.addUser({
      email: formData.email,
      password: hashedPassword,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      studentId: formData.studentId || undefined,
      class: formData.class || undefined,
      role: formData.role,
    });

    setShowAddModal(false);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      studentId: '',
      class: '',
      role: 'student',
    });
    loadUsers();
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-700',
      manager: 'bg-blue-100 text-blue-700',
      student: 'bg-green-100 text-green-700',
    };
    const labels = {
      admin: 'Quản trị viên',
      manager: 'Quản lý',
      student: 'Sinh viên',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badges[role as keyof typeof badges]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  const stats = {
    total: localStorageService.getUsers().length,
    students: localStorageService.getUsers().filter(u => u.role === 'student').length,
    managers: localStorageService.getUsers().filter(u => u.role === 'manager').length,
    admins: localStorageService.getUsers().filter(u => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Danh sách Hồ sơ Nhân viên</h1>
        {(user?.role === 'admin') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            + Upload hồ sơ
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng nhân viên</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hồ sơ đầy đủ</p>
              <p className="text-2xl font-bold text-gray-900">{stats.students}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hồ sơ chưa đầy đủ</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hồ sơ thiếu</p>
              <p className="text-2xl font-bold text-gray-900">{stats.managers + stats.admins}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên NV, tên, phòng ban..."
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('student')}
              className={`px-4 py-2 rounded-lg text-sm ${filter === 'student' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Đã đủ
            </button>
            <button
              onClick={() => setFilter('manager')}
              className={`px-4 py-2 rounded-lg text-sm ${filter === 'manager' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Chưa đủ
            </button>
            <button className="px-4 py-2 rounded-lg text-sm bg-gray-200 text-gray-700">
              Xóa bộ lọc
            </button>
            <button className="px-4 py-2 rounded-lg text-sm bg-primary-600 text-white">
              Tìm
            </button>
          </div>
        </div>
      </div>

      {/* Users List - Card View */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Danh sách hồ sơ nhân viên
          </p>
          <p className="text-sm text-gray-600">
            Hiển thị {users.length} / {stats.total} nhân viên
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {users.map((u) => (
            <div key={u._id} className="card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold">
                      {u.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{u.fullName}</p>
                    <p className="text-xs text-gray-500">{u.studentId || 'N/A'}</p>
                  </div>
                </div>
                {getRoleBadge(u.role)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{u.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{u.phoneNumber}</span>
                </div>
                {u.class && (
                  <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{u.class}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <div className="flex gap-1">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Xem chi tiết">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Tải xuống">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 card">
            <p className="text-gray-500">Không tìm thấy nhân viên nào</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button className="px-3 py-1 border rounded hover:bg-gray-50">Trước</button>
        <button className="px-3 py-1 bg-primary-600 text-white rounded">1</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-50">2</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-50">3</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-50">4</button>
        <button className="px-3 py-1 border rounded hover:bg-gray-50">Sau</button>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Thêm người dùng mới</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu</label>
                <input
                  type="password"
                  className="input"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                <input
                  type="text"
                  className="input"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input
                  type="text"
                  className="input"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vai trò</label>
                <select
                  className="input"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                >
                  <option value="student">Sinh viên</option>
                  <option value="manager">Quản lý</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>

              {formData.role === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Mã sinh viên</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.studentId}
                      onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Lớp</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.class}
                      onChange={(e) => setFormData({...formData, class: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <button type="submit" className="flex-1 btn-primary">
                  Thêm người dùng
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

export default Users;
