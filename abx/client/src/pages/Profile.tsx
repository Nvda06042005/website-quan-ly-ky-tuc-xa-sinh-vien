import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { localStorageService } from '../services/localStorageService';

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    if (user) {
      const latestUser = localStorageService.getUserById(user._id);
      if (latestUser) {
        setUserData(latestUser);
      }
    }
  }, [user]);

  if (!userData) {
    return <div className="text-center py-12">Đang tải...</div>;
  }

  const getGenderLabel = (gender?: string) => {
    const labels = { male: 'Nam', female: 'Nữ', other: 'Khác' };
    return labels[gender as keyof typeof labels] || 'Chưa cập nhật';
  };

  const getAcademicStatusLabel = (status?: string) => {
    const labels = {
      studying: 'Đang học',
      on_leave: 'Bảo lưu',
      graduated: 'Đã tốt nghiệp',
      expelled: 'Đã thôi học',
    };
    return labels[status as keyof typeof labels] || 'Chưa cập nhật';
  };

  const getStatusColor = (status?: string) => {
    const colors = {
      studying: 'bg-green-100 text-green-700',
      on_leave: 'bg-yellow-100 text-yellow-700',
      graduated: 'bg-blue-100 text-blue-700',
      expelled: 'bg-red-100 text-red-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
        {userData.academicStatus && (
          <span className={`px-3 py-1 text-sm font-medium rounded ${getStatusColor(userData.academicStatus)}`}>
            {getAcademicStatusLabel(userData.academicStatus)}
          </span>
        )}
      </div>

      {/* Avatar và thông tin cơ bản */}
      <div className="card p-6">
        <div className="flex items-start gap-6 mb-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {userData.avatar ? (
              <img
                src={userData.avatar}
                alt={userData.fullName}
                className="w-32 h-32 rounded-lg object-cover border-4 border-blue-100 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {userData.fullName.charAt(0)}
              </div>
            )}
          </div>
          
          {/* Thông tin nổi bật */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{userData.fullName}</h2>
            <div className="space-y-1 text-gray-600">
              {userData.studentId && (
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Mã SV: <span className="font-mono font-semibold ml-1">{userData.studentId}</span>
                </p>
              )}
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {userData.email}
              </p>
              <p className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {userData.phoneNumber}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-t pt-4">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Thông tin cơ bản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Ngày sinh</label>
            <p className="mt-1 text-gray-900">
              {userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Giới tính</label>
            <p className="mt-1 text-gray-900">{getGenderLabel(userData.gender)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Số CCCD/CMND</label>
            <p className="mt-1 text-gray-900">{userData.idCard || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      {/* Thông tin sinh viên */}
      {userData.role === 'student' && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
            Thông tin học vụ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Mã sinh viên</label>
              <p className="mt-1 text-gray-900 font-mono">{userData.studentId || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Lớp</label>
              <p className="mt-1 text-gray-900">{userData.class || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Khoa</label>
              <p className="mt-1 text-gray-900">{userData.faculty || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Ngành</label>
              <p className="mt-1 text-gray-900">{userData.major || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Khóa</label>
              <p className="mt-1 text-gray-900">{userData.course || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Trạng thái học</label>
              <p className="mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(userData.academicStatus)}`}>
                  {getAcademicStatusLabel(userData.academicStatus)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Địa chỉ */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Địa chỉ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Quê quán</label>
            <p className="mt-1 text-gray-900">{userData.placeOfOrigin || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Địa chỉ hiện tại</label>
            <p className="mt-1 text-gray-900">{userData.currentAddress || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      {/* Liên hệ khẩn cấp */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Liên hệ khẩn cấp
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Họ tên</label>
            <p className="mt-1 text-gray-900">{userData.emergencyContactName || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
            <p className="mt-1 text-gray-900">{userData.emergencyContactPhone || 'Chưa cập nhật'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Quan hệ</label>
            <p className="mt-1 text-gray-900">{userData.emergencyContactRelation || 'Chưa cập nhật'}</p>
          </div>
        </div>
      </div>

      {/* CCCD Images */}
      {(userData.idCardFrontImage || userData.idCardBackImage) && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            CCCD/CMND
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData.idCardFrontImage && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Mặt trước</label>
                <img
                  src={userData.idCardFrontImage}
                  alt="ID Card Front"
                  className="w-full rounded-lg border border-gray-300 shadow-sm"
                />
              </div>
            )}
            {userData.idCardBackImage && (
              <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">Mặt sau</label>
                <img
                  src={userData.idCardBackImage}
                  alt="ID Card Back"
                  className="w-full rounded-lg border border-gray-300 shadow-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
