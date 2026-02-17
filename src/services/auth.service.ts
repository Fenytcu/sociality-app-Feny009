import api from '@/lib/api';
import { LoginValues, RegisterValues } from '@/lib/validations/auth';
import { User } from '@/types';
import { AxiosError, AxiosResponse } from 'axios';

interface AuthResponse {
  user: User;
  token: string;
}

interface BackendUser {
  id: string | number;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
}

interface LoginResponseData {
  success: boolean;
  message: string;
  data: {
    user: BackendUser;
    token: string;
  };
}

export const authService = {
  async login(data: LoginValues): Promise<AuthResponse> {
    try {
      // First attempt with /api/auth/login
      const response = await api.post('/api/auth/login', {
        email: data.email,
        password: data.password,
      });
      return this.handleLoginResponse(response);
    } catch (error) {
      const err = error as AxiosError;

      // Check for 404 or 405 and retry with /auth/login
      if (
        err.response &&
        (err.response.status === 404 || err.response.status === 405)
      ) {
        try {
          console.log('Retrying login with /auth/login...');
          const response = await api.post('/auth/login', {
            email: data.email,
            password: data.password,
          });
          return this.handleLoginResponse(response);
        } catch {
          // Retry failed, continue to fallback check
        }
      }

      // If backend is not available, use mock data for testing
      if (
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error')
      ) {
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
        // Fix: Use mockUser instead of 'user' which is undefined here
        localStorage.setItem('user', JSON.stringify(mockUser));

        return {
          user: mockUser,
          token: mockToken,
        };
      }

      // Re-throw other errors
      throw error;
    }
  },

  // Helper to handle response parsing to avoid duplication
  handleLoginResponse(
    response: AxiosResponse<LoginResponseData>
  ): AuthResponse {
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
      return this.handleLoginResponse(response);
    } catch (error) {
      const err = error as AxiosError;

      // Check for 404 or 405 and retry with /auth/register
      if (
        err.response &&
        (err.response.status === 404 || err.response.status === 405)
      ) {
        try {
          console.log('Retrying register with /auth/register...');
          const response = await api.post('/auth/register', {
            name: data.name,
            username: data.username,
            email: data.email,
            password: data.password,
            phone: data.phone,
          });
          return this.handleLoginResponse(response);
        } catch {
          // fall through
        }
      }

      // Mock register fallback
      if (
        err.code === 'ERR_NETWORK' ||
        err.message?.includes('Network Error')
      ) {
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
          token: mockToken,
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
  },
};
