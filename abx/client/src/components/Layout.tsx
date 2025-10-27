import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard,
  Home,
  FileText,
  FileSignature,
  Receipt,
  AlertCircle,
  User,
  Users,
  LogOut,
  Bell,
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Người dùng', href: '/users', icon: Users, adminOnly: true },
    { name: 'Phòng', href: '/rooms', icon: Home },
    { name: 'Đơn đăng ký', href: '/applications', icon: FileText },
    { name: 'Hợp đồng', href: '/contracts', icon: FileSignature },
    { name: 'Hóa đơn', href: '/invoices', icon: Receipt },
    { name: 'Yêu cầu', href: '/requests', icon: AlertCircle },
  ].filter(item => !item.adminOnly || user?.role === 'admin' || user?.role === 'manager');

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600">
              Quản Lý KTX
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/profile"
              className={`flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/profile')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="w-5 h-5 mr-3" />
              Thông tin cá nhân
            </Link>
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-700 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-8">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Xin chào, {user?.fullName}
              </h2>
              <span className="ml-3 px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-full">
                {user?.role === 'student' && 'Sinh viên'}
                {user?.role === 'manager' && 'Quản lý'}
                {user?.role === 'admin' && 'Quản trị viên'}
              </span>
            </div>

            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
