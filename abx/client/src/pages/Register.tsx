import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { localStorageService, simpleHash } from '../services/localStorageService';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Thông tin cơ bản, 2: Thông tin học vụ, 3: Ảnh sinh viên, 4: Upload CCCD
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Bước 1: Thông tin cơ bản
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    
    // Bước 2: Thông tin học vụ
    studentId: '',
    class: '',
    faculty: '',
    major: '',
    course: '',
    placeOfOrigin: '',
    currentAddress: '',
    
    // Liên hệ khẩn cấp
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    
    // Bước 3: Ảnh sinh viên
    avatar: '',
    
    // Bước 4: CCCD
    idCard: '',
    idCardFrontImage: '',
    idCardBackImage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      // Giới hạn 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({
          ...formData,
          [field]: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.phoneNumber || 
        !formData.password || !formData.confirmPassword || !formData.dateOfBirth) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return false;
    }

    // Validate email sinh viên Văn Lang
    if (!formData.email.endsWith('@vanlanguni.vn') && !formData.email.endsWith('@vlu.edu.vn')) {
      setError('Email phải là email sinh viên Văn Lang (@vanlanguni.vn hoặc @vlu.edu.vn)');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return false;
    }

    // Validate số điện thoại
    if (!/^0\d{9}$/.test(formData.phoneNumber)) {
      setError('Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)');
      return false;
    }

    // Kiểm tra tuổi (phải từ 18-30)
    const birthYear = new Date(formData.dateOfBirth).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    if (age < 18 || age > 30) {
      setError('Sinh viên phải từ 18-30 tuổi');
      return false;
    }

    return true;
  };

  const validateStep2 = () => {
    if (!formData.studentId || !formData.class || !formData.faculty || 
        !formData.major || !formData.course) {
      setError('Vui lòng điền đầy đủ thông tin học vụ');
      return false;
    }

    // Validate mã sinh viên Văn Lang (10 số)
    if (!/^\d{10}$/.test(formData.studentId)) {
      setError('Mã sinh viên không hợp lệ (phải có 10 chữ số)');
      return false;
    }

    // Kiểm tra mã sinh viên đã tồn tại
    const users = localStorageService.getUsers();
    if (users.some(u => u.studentId === formData.studentId)) {
      setError('Mã sinh viên đã được đăng ký');
      return false;
    }

    if (!formData.placeOfOrigin || !formData.currentAddress) {
      setError('Vui lòng điền địa chỉ quê quán và địa chỉ hiện tại');
      return false;
    }

    if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
      setError('Vui lòng điền thông tin liên hệ khẩn cấp');
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    if (!formData.avatar) {
      setError('Vui lòng tải lên ảnh chân dung');
      return false;
    }
    return true;
  };

  const validateStep4 = () => {
    if (!formData.idCard) {
      setError('Vui lòng nhập số CCCD/CMND');
      return false;
    }

    // Validate CCCD (12 số) hoặc CMND (9 số)
    if (!/^\d{9}$/.test(formData.idCard) && !/^\d{12}$/.test(formData.idCard)) {
      setError('Số CCCD/CMND không hợp lệ (9 hoặc 12 chữ số)');
      return false;
    }

    if (!formData.idCardFrontImage || !formData.idCardBackImage) {
      setError('Vui lòng tải lên ảnh mặt trước và mặt sau CCCD/CMND');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep4()) return;

    try {
      // Kiểm tra email đã tồn tại
      const users = localStorageService.getUsers();
      if (users.some(u => u.email === formData.email)) {
        setError('Email đã được đăng ký');
        return;
      }

      // Tạo tài khoản
      const passwordHash = await simpleHash(formData.password);
      
      localStorageService.addUser({
        email: formData.email,
        password: passwordHash,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        role: 'student',
        studentId: formData.studentId,
        class: formData.class,
        faculty: formData.faculty,
        major: formData.major,
        course: formData.course,
        academicStatus: 'studying',
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        avatar: formData.avatar,
        idCard: formData.idCard,
        idCardFrontImage: formData.idCardFrontImage,
        idCardBackImage: formData.idCardBackImage,
        placeOfOrigin: formData.placeOfOrigin,
        currentAddress: formData.currentAddress,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
      });

      alert('✅ Đăng ký thành công!\n\nVui lòng đăng nhập để sử dụng hệ thống.');
      navigate('/login');
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4">
      <div className="card w-full max-w-3xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Đăng ký tài khoản</h2>
          <p className="text-gray-600 mt-2">Ký túc xá Đại học Văn Lang</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              1
            </div>
            <div className={`w-20 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
            <div className={`w-20 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              3
            </div>
            <div className={`w-20 h-1 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              4
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm font-medium text-gray-700">
            {step === 1 && 'Bước 1: Thông tin cơ bản'}
            {step === 2 && 'Bước 2: Thông tin học vụ & Liên hệ'}
            {step === 3 && 'Bước 3: Ảnh chân dung'}
            {step === 4 && 'Bước 4: Xác thực CCCD/CMND'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Thông tin cơ bản */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                <input
                  type="text"
                  name="fullName"
                  className="input"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email sinh viên *</label>
                  <input
                    type="email"
                    name="email"
                    className="input"
                    placeholder="mssv@vanlanguni.vn"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Phải là email @vanlanguni.vn hoặc @vlu.edu.vn</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="input"
                    placeholder="0123456789"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày sinh *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className="input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Giới tính *</label>
                  <select
                    name="gender"
                    className="input"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mật khẩu *</label>
                  <input
                    type="password"
                    name="password"
                    className="input"
                    placeholder="Tối thiểu 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="input"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Thông tin học vụ */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mã sinh viên *</label>
                  <input
                    type="text"
                    name="studentId"
                    className="input"
                    placeholder="2115000001"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">10 chữ số</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Lớp *</label>
                  <input
                    type="text"
                    name="class"
                    className="input"
                    placeholder="DHTI15A1HN"
                    value={formData.class}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Khoa *</label>
                  <select
                    name="faculty"
                    className="input"
                    value={formData.faculty}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Chọn khoa --</option>
                    <option value="Công nghệ Thông tin">Công nghệ Thông tin</option>
                    <option value="Kinh tế">Kinh tế</option>
                    <option value="Ngoại ngữ">Ngoại ngữ</option>
                    <option value="Kỹ thuật">Kỹ thuật</option>
                    <option value="Luật">Luật</option>
                    <option value="Kiến trúc">Kiến trúc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Ngành *</label>
                  <input
                    type="text"
                    name="major"
                    className="input"
                    placeholder="Công nghệ Thông tin"
                    value={formData.major}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Khóa *</label>
                <select
                  name="course"
                  className="input"
                  value={formData.course}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Chọn khóa --</option>
                  <option value="K18">K18 (2018)</option>
                  <option value="K19">K19 (2019)</option>
                  <option value="K20">K20 (2020)</option>
                  <option value="K21">K21 (2021)</option>
                  <option value="K22">K22 (2022)</option>
                  <option value="K23">K23 (2023)</option>
                  <option value="K24">K24 (2024)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quê quán *</label>
                <input
                  type="text"
                  name="placeOfOrigin"
                  className="input"
                  placeholder="Tỉnh/Thành phố"
                  value={formData.placeOfOrigin}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ hiện tại *</label>
                <input
                  type="text"
                  name="currentAddress"
                  className="input"
                  placeholder="Số nhà, đường, quận/huyện, tỉnh/thành"
                  value={formData.currentAddress}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin liên hệ khẩn cấp</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ tên *</label>
                    <input
                      type="text"
                      name="emergencyContactName"
                      className="input"
                      placeholder="Nguyễn Văn B"
                      value={formData.emergencyContactName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                    <input
                      type="tel"
                      name="emergencyContactPhone"
                      className="input"
                      placeholder="0987654321"
                      value={formData.emergencyContactPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quan hệ *</label>
                    <select
                      name="emergencyContactRelation"
                      className="input"
                      value={formData.emergencyContactRelation}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Chọn --</option>
                      <option value="Bố">Bố</option>
                      <option value="Mẹ">Mẹ</option>
                      <option value="Anh/Chị">Anh/Chị</option>
                      <option value="Người thân">Người thân khác</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Upload Ảnh sinh viên */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <svg className="w-20 h-20 mx-auto text-blue-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Ảnh chân dung sinh viên</h3>
                <p className="text-sm text-gray-600 mt-1">Ảnh sẽ được sử dụng cho thẻ sinh viên và hồ sơ</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
                  {formData.avatar ? (
                    <div className="relative inline-block">
                      <img 
                        src={formData.avatar} 
                        alt="Avatar" 
                        className="w-64 h-64 mx-auto rounded-lg object-cover shadow-lg" 
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, avatar: ''})}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 shadow-lg"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-32 h-32 mx-auto text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <label className="cursor-pointer inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                        <span className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Chọn ảnh chân dung
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'avatar')}
                        />
                      </label>
                      <p className="text-sm text-gray-600 mt-3">Định dạng: JPG, PNG • Tối đa 5MB</p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-2">Yêu cầu ảnh chân dung:</p>
                      <ul className="list-disc ml-4 space-y-1">
                        <li>Ảnh rõ mặt, nhìn thẳng vào camera</li>
                        <li>Không đeo kính đen, không che mặt</li>
                        <li>Nền sáng, trang phục lịch sự</li>
                        <li>Ảnh chụp trong vòng 6 tháng gần đây</li>
                        <li>Ảnh 3x4 hoặc 4x6 tỷ lệ dọc</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Upload CCCD */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Số CCCD/CMND *</label>
                <input
                  type="text"
                  name="idCard"
                  className="input"
                  placeholder="001203012345"
                  value={formData.idCard}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">9 số (CMND) hoặc 12 số (CCCD)</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ảnh mặt trước CCCD/CMND *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.idCardFrontImage ? (
                      <div className="relative">
                        <img src={formData.idCardFrontImage} alt="Front" className="max-h-48 mx-auto rounded" />
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, idCardFrontImage: ''})}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                          <span>Chọn ảnh</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'idCardFrontImage')}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ảnh mặt sau CCCD/CMND *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {formData.idCardBackImage ? (
                      <div className="relative">
                        <img src={formData.idCardBackImage} alt="Back" className="max-h-48 mx-auto rounded" />
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, idCardBackImage: ''})}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                          <span>Chọn ảnh</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'idCardBackImage')}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold">Lưu ý:</p>
                    <ul className="list-disc ml-4 mt-1 space-y-1">
                      <li>Ảnh phải rõ nét, đầy đủ 4 góc</li>
                      <li>Không chụp màn hình</li>
                      <li>Thông tin trên CCCD phải khớp với thông tin đăng ký</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-6">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 btn-secondary"
              >
                ← Quay lại
              </button>
            )}
            
            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 btn-primary"
              >
                Tiếp theo →
              </button>
            ) : (
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                Hoàn tất đăng ký
              </button>
            )}
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
