// LocalStorage Service - Quản lý dữ liệu trong trình duyệt

// Simple hash function for demo purposes
const simpleHash = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const compareHash = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await simpleHash(password);
  return passwordHash === hash;
};

export { simpleHash };

export interface User {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: 'student' | 'manager' | 'admin';
  
  // Thông tin sinh viên
  studentId?: string;
  class?: string;
  faculty?: string;
  major?: string;
  course?: string;
  academicStatus?: 'studying' | 'on_leave' | 'graduated' | 'expelled';
  
  // Thông tin cá nhân
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  idCard?: string;
  idCardFrontImage?: string;
  idCardBackImage?: string;
  placeOfOrigin?: string;
  currentAddress?: string;
  
  // Liên hệ khẩn cấp
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  
  createdAt: string;
}

export interface Room {
  _id: string;
  roomNumber: string;
  building: string;
  floor: number;
  type: 'standard' | 'vip' | 'deluxe';
  capacity: number;
  currentOccupancy: number;
  pricePerSemester: number;
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Application {
  _id: string;
  userId: string;
  roomId: string;
  semester: string;
  academicYear: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Contract {
  _id: string;
  userId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'terminated';
  monthlyRent: number;
}

export interface Invoice {
  _id: string;
  userId: string;
  contractId: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  type: 'room_rent' | 'electricity' | 'water' | 'other';
}

export interface Request {
  _id: string;
  userId: string;
  roomId: string;
  type: 'maintenance' | 'complaint' | 'other';
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  createdAt: string;
}

const STORAGE_KEYS = {
  USERS: 'ktx_users',
  ROOMS: 'ktx_rooms',
  APPLICATIONS: 'ktx_applications',
  CONTRACTS: 'ktx_contracts',
  INVOICES: 'ktx_invoices',
  REQUESTS: 'ktx_requests',
  CURRENT_USER: 'ktx_current_user',
};

class LocalStorageService {
  // Initialize với dữ liệu mẫu
  async initialize() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      await this.seedData();
    }
  }

  // Tạo dữ liệu mẫu
  async seedData() {
    const users: User[] = [
      {
        _id: '1',
        email: 'admin@gmail.com',
        password: await simpleHash('admin123'),
        fullName: 'Quản trị viên',
        phoneNumber: '0123456789',
        role: 'admin',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '2',
        email: 'manager@gmail.com',
        password: await simpleHash('manager123'),
        fullName: 'Nguyễn Văn Quản Lý',
        phoneNumber: '0987654321',
        role: 'manager',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '3',
        email: 'student@gmail.com',
        password: await simpleHash('student123'),
        fullName: 'Trần Thị Sinh Viên',
        phoneNumber: '0369852147',
        studentId: '2115000001',
        class: 'DHTI15A1HN',
        faculty: 'Công nghệ Thông tin',
        major: 'Công nghệ Thông tin',
        course: 'K21',
        academicStatus: 'studying',
        dateOfBirth: '2003-05-15',
        gender: 'female',
        idCard: '001203012345',
        placeOfOrigin: 'Hà Nội',
        currentAddress: '233 Hoàng Quốc Việt, Cầu Giấy, Hà Nội',
        emergencyContactName: 'Trần Văn Phụ Huynh',
        emergencyContactPhone: '0901234567',
        emergencyContactRelation: 'Bố',
        role: 'student',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '4',
        email: 'nguyenvana@gmail.com',
        password: await simpleHash('123456'),
        fullName: 'Nguyễn Văn A',
        phoneNumber: '0901234567',
        studentId: '2115000002',
        class: 'DHTI15A1HN',
        faculty: 'Công nghệ Thông tin',
        major: 'Công nghệ Thông tin',
        course: 'K21',
        academicStatus: 'studying',
        dateOfBirth: '2003-08-20',
        gender: 'male',
        idCard: '001203023456',
        placeOfOrigin: 'Nam Định',
        currentAddress: '45 Nguyễn Văn Linh, Thanh Xuân, Hà Nội',
        emergencyContactName: 'Nguyễn Thị Mẹ',
        emergencyContactPhone: '0912345678',
        emergencyContactRelation: 'Mẹ',
        role: 'student',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '5',
        email: 'lethib@gmail.com',
        password: await simpleHash('123456'),
        fullName: 'Lê Thị B',
        phoneNumber: '0912345678',
        studentId: '2014000001',
        class: 'DHTI14A2HN',
        faculty: 'Công nghệ Thông tin',
        major: 'Kỹ thuật Phần mềm',
        course: 'K20',
        academicStatus: 'studying',
        dateOfBirth: '2002-12-10',
        gender: 'female',
        idCard: '001202034567',
        placeOfOrigin: 'Hải Phòng',
        currentAddress: '78 Láng Hạ, Đống Đa, Hà Nội',
        emergencyContactName: 'Lê Văn Bố',
        emergencyContactPhone: '0923456789',
        emergencyContactRelation: 'Bố',
        role: 'student',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '6',
        email: 'phamvanc@gmail.com',
        password: await simpleHash('123456'),
        fullName: 'Phạm Văn C',
        phoneNumber: '0923456789',
        studentId: '2115000003',
        class: 'DHTI15A3HN',
        faculty: 'Công nghệ Thông tin',
        major: 'Hệ thống Thông tin',
        course: 'K21',
        academicStatus: 'studying',
        dateOfBirth: '2003-03-25',
        gender: 'male',
        idCard: '001203045678',
        placeOfOrigin: 'Thanh Hóa',
        currentAddress: '120 Giải Phóng, Hai Bà Trưng, Hà Nội',
        emergencyContactName: 'Phạm Thị Mẹ',
        emergencyContactPhone: '0934567890',
        emergencyContactRelation: 'Mẹ',
        role: 'student',
        createdAt: new Date().toISOString(),
      },
    ];

    const rooms: Room[] = [
      {
        _id: '1',
        roomNumber: 'A101',
        building: 'A',
        floor: 1,
        type: 'standard',
        capacity: 6,
        currentOccupancy: 0,
        pricePerSemester: 2000000,
        amenities: ['Giường', 'Tủ', 'Quạt', 'WC riêng'],
        status: 'available',
      },
      {
        _id: '2',
        roomNumber: 'A102',
        building: 'A',
        floor: 1,
        type: 'standard',
        capacity: 6,
        currentOccupancy: 0,
        pricePerSemester: 2000000,
        amenities: ['Giường', 'Tủ', 'Quạt', 'WC riêng'],
        status: 'available',
      },
      {
        _id: '3',
        roomNumber: 'B201',
        building: 'B',
        floor: 2,
        type: 'vip',
        capacity: 4,
        currentOccupancy: 0,
        pricePerSemester: 3000000,
        amenities: ['Giường', 'Tủ', 'Điều hòa', 'WC riêng', 'Nước nóng'],
        status: 'available',
      },
      {
        _id: '4',
        roomNumber: 'B202',
        building: 'B',
        floor: 2,
        type: 'vip',
        capacity: 4,
        currentOccupancy: 0,
        pricePerSemester: 3000000,
        amenities: ['Giường', 'Tủ', 'Điều hòa', 'WC riêng', 'Nước nóng'],
        status: 'available',
      },
      {
        _id: '5',
        roomNumber: 'C301',
        building: 'C',
        floor: 3,
        type: 'deluxe',
        capacity: 2,
        currentOccupancy: 0,
        pricePerSemester: 4500000,
        amenities: ['Giường', 'Tủ', 'Điều hòa', 'WC riêng', 'Nước nóng', 'Tủ lạnh', 'Bàn học'],
        status: 'available',
      },
    ];

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    
    // Tạo một số đơn đăng ký mẫu
    const sampleApplications: Application[] = [
      {
        _id: '1',
        userId: '3',
        roomId: '1',
        semester: '1',
        academicYear: '2024-2025',
        status: 'approved',
        createdAt: new Date(2024, 8, 1).toISOString(),
      },
      {
        _id: '2',
        userId: '4',
        roomId: '2',
        semester: '1',
        academicYear: '2024-2025',
        status: 'pending',
        createdAt: new Date(2024, 8, 5).toISOString(),
      },
    ];
    
    // Tạo hợp đồng mẫu
    const sampleContracts: Contract[] = [
      {
        _id: '1',
        userId: '3',
        roomId: '1',
        startDate: '2024-09-01',
        endDate: '2025-01-31',
        status: 'active',
        monthlyRent: 400000,
      },
    ];
    
    // Tạo hóa đơn mẫu
    const sampleInvoices: Invoice[] = [
      {
        _id: '1',
        userId: '3',
        contractId: '1',
        amount: 400000,
        dueDate: '2024-10-05',
        status: 'paid',
        type: 'room_rent',
      },
      {
        _id: '2',
        userId: '3',
        contractId: '1',
        amount: 150000,
        dueDate: '2024-10-05',
        status: 'pending',
        type: 'electricity',
      },
      {
        _id: '3',
        userId: '3',
        contractId: '1',
        amount: 80000,
        dueDate: '2024-10-05',
        status: 'pending',
        type: 'water',
      },
    ];
    
    // Tạo yêu cầu mẫu
    const sampleRequests: Request[] = [
      {
        _id: '1',
        userId: '3',
        roomId: '1',
        type: 'maintenance',
        title: 'Quạt trần không hoạt động',
        description: 'Quạt trần phòng A101 không quay, nghi ngờ hỏng động cơ',
        status: 'in_progress',
        createdAt: new Date(2024, 9, 20).toISOString(),
      },
      {
        _id: '2',
        userId: '3',
        roomId: '1',
        type: 'complaint',
        title: 'Tiếng ồn từ phòng bên cạnh',
        description: 'Phòng bên cạnh thường xuyên gây ồn vào ban đêm',
        status: 'completed',
        createdAt: new Date(2024, 9, 15).toISOString(),
      },
    ];
    
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(sampleApplications));
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(sampleContracts));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(sampleInvoices));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(sampleRequests));

    console.log('✅ Đã khởi tạo dữ liệu mẫu');
    console.log('📋 Tài khoản mặc định:');
    console.log('Admin: admin@gmail.com / admin123');
    console.log('Manager: manager@gmail.com / manager123');
    console.log('Student: student@gmail.com / student123');
  }

  // Users
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u._id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email === email);
  }

  addUser(user: Omit<User, '_id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex((u) => u._id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return users[index];
  }

  // Rooms
  getRooms(): Room[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '[]');
  }

  getRoomById(id: string): Room | undefined {
    return this.getRooms().find((r) => r._id === id);
  }

  addRoom(room: Omit<Room, '_id'>): Room {
    const rooms = this.getRooms();
    const newRoom: Room = {
      ...room,
      _id: Date.now().toString(),
    };
    rooms.push(newRoom);
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    return newRoom;
  }

  updateRoom(id: string, updates: Partial<Room>): Room | null {
    const rooms = this.getRooms();
    const index = rooms.findIndex((r) => r._id === id);
    if (index === -1) return null;
    rooms[index] = { ...rooms[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    return rooms[index];
  }

  deleteRoom(id: string): boolean {
    const rooms = this.getRooms();
    const filtered = rooms.filter((r) => r._id !== id);
    if (filtered.length === rooms.length) return false;
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(filtered));
    return true;
  }

  // Applications
  getApplications(): Application[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPLICATIONS) || '[]');
  }

  getApplicationsByUserId(userId: string): Application[] {
    return this.getApplications().filter((a) => a.userId === userId);
  }

  addApplication(app: Omit<Application, '_id' | 'createdAt'>): Application {
    const applications = this.getApplications();
    const newApp: Application = {
      ...app,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    applications.push(newApp);
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    return newApp;
  }

  updateApplication(id: string, updates: Partial<Application>): Application | null {
    const applications = this.getApplications();
    const index = applications.findIndex((a) => a._id === id);
    if (index === -1) return null;
    applications[index] = { ...applications[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
    return applications[index];
  }

  // Contracts
  getContracts(): Contract[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRACTS) || '[]');
  }

  getContractsByUserId(userId: string): Contract[] {
    return this.getContracts().filter((c) => c.userId === userId);
  }

  addContract(contract: Omit<Contract, '_id'>): Contract {
    const contracts = this.getContracts();
    const newContract: Contract = {
      ...contract,
      _id: Date.now().toString(),
    };
    contracts.push(newContract);
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    return newContract;
  }

  updateContract(id: string, updates: Partial<Contract>): Contract | null {
    const contracts = this.getContracts();
    const index = contracts.findIndex((c) => c._id === id);
    if (index === -1) return null;
    contracts[index] = { ...contracts[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
    return contracts[index];
  }

  deleteContract(id: string): boolean {
    const contracts = this.getContracts();
    const filtered = contracts.filter((c) => c._id !== id);
    if (filtered.length === contracts.length) return false;
    
    // Xóa tất cả hóa đơn liên quan đến hợp đồng này
    const invoices = this.getInvoices();
    const filteredInvoices = invoices.filter((i) => i.contractId !== id);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(filteredInvoices));
    
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(filtered));
    return true;
  }

  // Invoices
  getInvoices(): Invoice[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVOICES) || '[]');
  }

  getInvoicesByUserId(userId: string): Invoice[] {
    return this.getInvoices().filter((i) => i.userId === userId);
  }

  getInvoicesByContractId(contractId: string): Invoice[] {
    return this.getInvoices().filter((i) => i.contractId === contractId);
  }

  addInvoice(invoice: Omit<Invoice, '_id'>): Invoice {
    const invoices = this.getInvoices();
    const newInvoice: Invoice = {
      ...invoice,
      _id: Date.now().toString(),
    };
    invoices.push(newInvoice);
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return newInvoice;
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const invoices = this.getInvoices();
    const index = invoices.findIndex((i) => i._id === id);
    if (index === -1) return null;
    invoices[index] = { ...invoices[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return invoices[index];
  }

  // Requests
  getRequests(): Request[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.REQUESTS) || '[]');
  }

  getRequestsByUserId(userId: string): Request[] {
    return this.getRequests().filter((r) => r.userId === userId);
  }

  addRequest(request: Omit<Request, '_id' | 'createdAt'>): Request {
    const requests = this.getRequests();
    const newRequest: Request = {
      ...request,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return newRequest;
  }

  updateRequest(id: string, updates: Partial<Request>): Request | null {
    const requests = this.getRequests();
    const index = requests.findIndex((r) => r._id === id);
    if (index === -1) return null;
    requests[index] = { ...requests[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    return requests[index];
  }

  // Current User
  setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  }

  clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Clear all data
  clearAll() {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

export const localStorageService = new LocalStorageService();
