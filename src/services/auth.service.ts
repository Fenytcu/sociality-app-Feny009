import api from '@/lib/api';
import { LoginValues, RegisterValues } from '@/lib/validations/auth';
import { User } from '@/types';

interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(data: LoginValues): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password
      });
      
      // Backend returns: { success, message, data: { user, token } }
      const { user: backendUser, token } = response.data.data;
      
      // Map backend user format to frontend User type
      const user: User = {
        id: backendUser.id.toString(),
        name: backendUser.name,
        username: backendUser.username,
        email: backendUser.email,
        avatar: backendUser.avatarUrl || backendUser.avatar,
        bio: backendUser.bio,
        followersCount: backendUser.followersCount || 0,
        followingCount: backendUser.followingCount || 0,
      };
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token };
    } catch (error) {
      // If backend is not available, use mock data for testing
      const err = error as any;
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        console.warn('Backend not available, using mock login');
        
        // Mock user data
        const mockUser: User = {
          id: 'mock-user-1',
          name: data.email.split('@')[0],
          username: data.email.split('@')[0],
          email: data.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
          bio: 'Mock user for testing',
          followersCount: 100,
          followingCount: 50,
        };
        
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        return {
          user: mockUser,
          token: mockToken
        };
      }
      
      // Re-throw other errors
      throw error;
    }
  },

  async register(data: RegisterValues): Promise<AuthResponse> {
    try {
      const response = await api.post('/api/auth/register', {
        name: data.name,
        username: data.username,
        email: data.email,
        password: data.password,
        phone: data.phone, // Use actual phone from form
      });
      
      // Backend returns: { success, message, data: { user, token } }
      const { user: backendUser, token } = response.data.data;
      
      // Map backend user format to frontend User type
      const user: User = {
        id: backendUser.id.toString(),
        name: backendUser.name,
        username: backendUser.username,
        email: backendUser.email,
        avatar: backendUser.avatarUrl || backendUser.avatar,
        bio: backendUser.bio,
        followersCount: backendUser.followersCount || 0,
        followingCount: backendUser.followingCount || 0,
      };
      
      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      return { user, token };
    } catch (error) {
      // Mock register fallback
      const err = error as any;
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        console.warn('Backend not available, using mock register');
        
        const mockUser: User = {
          id: 'mock-user-' + Date.now(),
          name: data.name,
          username: data.username,
          email: data.email,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.username}`,
          bio: '',
          followersCount: 0,
          followingCount: 0,
        };
        
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        return {
          user: mockUser,
          token: mockToken
        };
      }
      
      throw error;
    }
  },

  async logout() {
    try {
        await api.post('/api/auth/logout');
    } catch (error) {
        console.error('Logout failed', error);
    } finally {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
    }
  }
};
