import { useEffect, useState } from 'react';
import { localStorageService, Invoice } from '../services/localStorageService';
import { useAuthStore } from '../store/authStore';

const Invoices = () => {
  const user = useAuthStore((state) => state.user);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');

  useEffect(() => {
    loadInvoices();
  }, [user, filter]);

  const loadInvoices = () => {
    let allInvoices: Invoice[] = [];
    
    if (user?.role === 'student') {
      allInvoices = localStorageService.getInvoicesByUserId(user._id);
    } else {
      allInvoices = localStorageService.getInvoices();
    }

    // Filter by status
    if (filter !== 'all') {
      allInvoices = allInvoices.filter(inv => inv.status === filter);
    }

    setInvoices(allInvoices);
  };

  const handlePay = (id: string) => {
    if (confirm('Xác nhận thanh toán hóa đơn này?')) {
      localStorageService.updateInvoice(id, { status: 'paid' });
      loadInvoices();
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: 'Chưa thanh toán',
      paid: 'Đã thanh toán',
      overdue: 'Quá hạn',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      room_rent: 'Tiền phòng',
      electricity: 'Tiền điện',
      water: 'Tiền nước',
      other: 'Khác',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getUserInfo = (userId: string) => {
    const invUser = localStorageService.getUserById(userId);
    return invUser ? `${invUser.fullName} (${invUser.studentId || 'N/A'})` : 'N/A';
  };

  const stats = {
    total: localStorageService.getInvoices().length,
    pending: localStorageService.getInvoices().filter(i => i.status === 'pending').length,
    paid: localStorageService.getInvoices().filter(i => i.status === 'paid').length,
    totalAmount: localStorageService.getInvoices().reduce((sum, i) => sum + i.amount, 0),
    pendingAmount: localStorageService.getInvoices().filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Hóa đơn</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chưa thanh toán</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="mt-1 text-xs text-gray-500">{stats.pendingAmount.toLocaleString('vi-VN')} VNĐ</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{stats.paid}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="mt-2 text-2xl font-bold text-purple-600">
                {(stats.totalAmount / 1000000).toFixed(1)}M
              </p>
              <p className="mt-1 text-xs text-gray-500">{stats.totalAmount.toLocaleString('vi-VN')} VNĐ</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Tất cả ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Chưa thanh toán ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg text-sm ${filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Đã thanh toán ({stats.paid})
        </button>
      </div>

      {/* Invoices Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                {(user?.role === 'admin' || user?.role === 'manager') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sinh viên</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn thanh toán</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv, idx) => (
                <tr key={inv._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{idx + 1}</td>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <td className="px-6 py-4 text-sm text-gray-900">{getUserInfo(inv.userId)}</td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center">
                      {inv.type === 'room_rent' && (
                        <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      )}
                      {inv.type === 'electricity' && (
                        <svg className="w-4 h-4 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                      {inv.type === 'water' && (
                        <svg className="w-4 h-4 mr-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                      {getTypeLabel(inv.type)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-semibold text-gray-900">
                    {inv.amount.toLocaleString('vi-VN')} VNĐ
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(inv.dueDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                  <td className="px-6 py-4">
                    {inv.status === 'pending' && user?.role === 'student' && (
                      <button
                        onClick={() => handlePay(inv._id)}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Thanh toán
                      </button>
                    )}
                    {inv.status === 'paid' && (
                      <span className="text-xs text-gray-500">
                        ✓ Đã thanh toán
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có hóa đơn nào</p>
          </div>
        )}
      </div>

      {/* Total Summary */}
      {invoices.length > 0 && (
        <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng cộng ({invoices.length} hóa đơn)</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('vi-VN')} VNĐ
              </p>
            </div>
            {user?.role === 'student' && (
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Cần thanh toán</p>
                <p className="mt-1 text-2xl font-bold text-red-600">
                  {invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString('vi-VN')} VNĐ
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;
