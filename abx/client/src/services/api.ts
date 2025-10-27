import { localStorageService, simpleHash, compareHash } from './localStorageService';

// Mock API responses using localStorage
const api = {
  // Auth endpoints
  auth: {
    register: async (data: {
      email: string;
      password: string;
      fullName: string;
      phoneNumber: string;
      studentId?: string;
      class?: string;
    }) => {
      await localStorageService.initialize();
      
      const existingUser = localStorageService.getUserByEmail(data.email);
      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }

      const hashedPassword = await simpleHash(data.password);
      const newUser = localStorageService.addUser({
        ...data,
        password: hashedPassword,
        role: 'student', // Default role
      });

      const { password, ...userWithoutPassword } = newUser;
      const token = btoa(JSON.stringify({ userId: newUser._id }));
      
      localStorage.setItem('token', token);
      localStorageService.setCurrentUser(newUser);

      return {
        data: {
          token,
          user: userWithoutPassword,
        },
      };
    },

    login: async (data: { email: string; password: string }) => {
      await localStorageService.initialize();
      
      const user = localStorageService.getUserByEmail(data.email);
      if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      const isPasswordValid = await compareHash(data.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Email hoặc mật khẩu không đúng');
      }

      const { password, ...userWithoutPassword } = user;
      const token = btoa(JSON.stringify({ userId: user._id }));
      
      localStorage.setItem('token', token);
      localStorageService.setCurrentUser(user);

      return {
        data: {
          token,
          user: userWithoutPassword,
        },
      };
    },

    getMe: async () => {
      const user = localStorageService.getCurrentUser();
      if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const { password, ...userWithoutPassword } = user;
      return {
        data: { user: userWithoutPassword },
      };
    },

    updatePassword: async (data: { currentPassword: string; newPassword: string }) => {
      const user = localStorageService.getCurrentUser();
      if (!user) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      const isPasswordValid = await compareHash(data.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new Error('Mật khẩu hiện tại không đúng');
      }

      const hashedPassword = await simpleHash(data.newPassword);
      localStorageService.updateUser(user._id, { password: hashedPassword });

      return {
        data: { message: 'Đổi mật khẩu thành công' },
      };
    },
  },

  // Rooms endpoints
  rooms: {
    getAll: async () => {
      await localStorageService.initialize();
      return {
        data: { rooms: localStorageService.getRooms() },
      };
    },

    getById: async (id: string) => {
      const room = localStorageService.getRoomById(id);
      if (!room) {
        throw new Error('Không tìm thấy phòng');
      }
      return {
        data: { room },
      };
    },

    create: async (data: any) => {
      const room = localStorageService.addRoom(data);
      return {
        data: { room },
      };
    },

    update: async (id: string, data: any) => {
      const room = localStorageService.updateRoom(id, data);
      if (!room) {
        throw new Error('Không tìm thấy phòng');
      }
      return {
        data: { room },
      };
    },

    delete: async (id: string) => {
      const success = localStorageService.deleteRoom(id);
      if (!success) {
        throw new Error('Không tìm thấy phòng');
      }
      return {
        data: { message: 'Xóa phòng thành công' },
      };
    },
  },

  // Applications endpoints
  applications: {
    getAll: async () => {
      await localStorageService.initialize();
      const user = localStorageService.getCurrentUser();
      
      let applications = localStorageService.getApplications();
      if (user?.role === 'student') {
        applications = localStorageService.getApplicationsByUserId(user._id);
      }

      return {
        data: { applications },
      };
    },

    create: async (data: any) => {
      const user = localStorageService.getCurrentUser();
      if (!user) {
        throw new Error('Vui lòng đăng nhập');
      }

      const application = localStorageService.addApplication({
        ...data,
        userId: user._id,
        status: 'pending',
      });

      return {
        data: { application },
      };
    },

    update: async (id: string, data: any) => {
      const application = localStorageService.updateApplication(id, data);
      if (!application) {
        throw new Error('Không tìm thấy đơn đăng ký');
      }
      return {
        data: { application },
      };
    },
  },

  // Contracts endpoints
  contracts: {
    getAll: async () => {
      await localStorageService.initialize();
      const user = localStorageService.getCurrentUser();
      
      let contracts = localStorageService.getContracts();
      if (user?.role === 'student') {
        contracts = localStorageService.getContractsByUserId(user._id);
      }

      return {
        data: { contracts },
      };
    },
  },

  // Invoices endpoints
  invoices: {
    getAll: async () => {
      await localStorageService.initialize();
      const user = localStorageService.getCurrentUser();
      
      let invoices = localStorageService.getInvoices();
      if (user?.role === 'student') {
        invoices = localStorageService.getInvoicesByUserId(user._id);
      }

      return {
        data: { invoices },
      };
    },

    pay: async (id: string) => {
      const invoice = localStorageService.updateInvoice(id, { status: 'paid' });
      if (!invoice) {
        throw new Error('Không tìm thấy hóa đơn');
      }
      return {
        data: { invoice },
      };
    },
  },

  // Requests endpoints
  requests: {
    getAll: async () => {
      await localStorageService.initialize();
      const user = localStorageService.getCurrentUser();
      
      let requests = localStorageService.getRequests();
      if (user?.role === 'student') {
        requests = localStorageService.getRequestsByUserId(user._id);
      }

      return {
        data: { requests },
      };
    },

    create: async (data: any) => {
      const user = localStorageService.getCurrentUser();
      if (!user) {
        throw new Error('Vui lòng đăng nhập');
      }

      const request = localStorageService.addRequest({
        ...data,
        userId: user._id,
        status: 'pending',
      });

      return {
        data: { request },
      };
    },

    update: async (id: string, data: any) => {
      const request = localStorageService.updateRequest(id, data);
      if (!request) {
        throw new Error('Không tìm thấy yêu cầu');
      }
      return {
        data: { request },
      };
    },
  },
};

export default api;

