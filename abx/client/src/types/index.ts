export interface User {
  _id: string;
  id?: string; // Alias for _id for compatibility
  fullName: string;
  email: string;
  phoneNumber: string;
  phone?: string; // Alias for phoneNumber
  role: 'student' | 'manager' | 'admin';
  
  // Thông tin sinh viên
  studentId?: string;
  class?: string;
  faculty?: string; // Khoa
  major?: string; // Ngành
  course?: string; // Khóa (K15, K16...)
  academicStatus?: 'studying' | 'on_leave' | 'graduated' | 'expelled'; // Trạng thái học
  
  // Thông tin cá nhân
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  idCard?: string; // Số CCCD
  idCardFrontImage?: string; // Ảnh mặt trước CCCD
  idCardBackImage?: string; // Ảnh mặt sau CCCD
  placeOfOrigin?: string; // Quê quán
  currentAddress?: string; // Địa chỉ hiện tại
  
  // Thông tin liên hệ khẩn cấp
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  avatar?: string;
  status?: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  building: string;
  floor: number;
  type: 'single' | 'double' | 'quadruple' | 'six_person';
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  price: number;
  amenities: string[];
  description?: string;
  images?: string[];
}

export interface Application {
  id: string;
  student: User;
  roomType: string;
  preferredBuilding?: string;
  academicYear: string;
  semester: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  processedBy?: User;
  processedAt?: string;
  rejectionReason?: string;
  assignedRoom?: Room;
  createdAt: string;
}

export interface Contract {
  id: string;
  student: User;
  room: Room;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: 'active' | 'expired' | 'terminated' | 'pending';
  terms?: string;
  signedAt?: string;
  terminatedAt?: string;
  terminationReason?: string;
}

export interface Invoice {
  id: string;
  student: User;
  room: Room;
  invoiceNumber: string;
  type: 'rent' | 'electricity' | 'water' | 'service' | 'deposit' | 'other';
  month: number;
  year: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  description?: string;
  paymentMethod?: string;
  transactionId?: string;
}

export interface Request {
  id: string;
  student: User;
  room: Room;
  type: 'maintenance' | 'repair' | 'cleaning' | 'equipment' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  images?: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  assignedTo?: User;
  assignedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  staffNotes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'payment' | 'maintenance' | 'contract' | 'request' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  pendingApplications: number;
  pendingRequests: number;
  totalRevenue: number;
  monthlyRevenue: number;
  overdueInvoices: number;
}
