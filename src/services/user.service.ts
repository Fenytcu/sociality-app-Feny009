import api from '@/lib/api';
import { User, Post } from '@/types';

interface SearchResponse {
  users: User[];
  // Pagination fields if any
}

export const userService = {
  async getMe(): Promise<User> {
    const response = await api.get('/api/me');
    
    // Backend returns: { success, message, data: { profile, stats } }
    const { profile, stats } = response.data.data;
    
    return {
      id: profile.id.toString(),
      name: profile.name,
      username: profile.username,
      email: profile.email,
      phone: profile.phone,
      avatar: profile.avatarUrl,
      bio: profile.bio,
      followersCount: stats.followers,
      followingCount: stats.following,
      postsCount: stats.posts,
      likesCount: stats.likes || 0, // Map total likes received
    };
  },

  async updateProfile(data: FormData): Promise<User> {
    const response = await api.patch('/api/me', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes for large image uploads
    });
    
    // Backend returns: { success, message, data: { profile } }
    const profile = response.data.data?.profile;
    
    if (!profile) {
      // Sometimes backend might return data directly in data
      const directProfile = response.data.data;
      if (directProfile && directProfile.id) {
         return {
            id: directProfile.id?.toString() || '',
            name: directProfile.name || '',
            username: directProfile.username || '',
            email: directProfile.email || '',
            phone: directProfile.phone || '',
            avatar: directProfile.avatarUrl || directProfile.avatar || '',
            bio: directProfile.bio || '',
         };
      }
      throw new Error('Profile data missing from response');
    }
    
    return {
      id: profile.id?.toString() || '',
      name: profile.name || '',
      username: profile.username || '',
      email: profile.email || '',
      phone: profile.phone || '',
      avatar: profile.avatarUrl || profile.avatar || '',
      bio: profile.bio || '',
    };
  },

  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await api.get(`/api/users/search?q=${query}`);
      
      // Backend returns: { success, message, data: { users, pagination } }
      const users = response.data.data?.users || [];
      
      // Map backend user format to frontend User type
      return users.map((user: any) => ({
        id: user.id.toString(),
        username: user.username,
        name: user.name,
        email: user.email || '',
        avatar: user.avatarUrl || user.avatar,
        bio: user.bio,
        isFollowing: user.isFollowedByMe || false, // Backend uses isFollowedByMe
      }));
    } catch (error) {
      console.warn('Search API failed:', error);
      return [];
    }
  },

  async followUser(username: string): Promise<void> {
    try {
      await api.post(`/api/follow/${username}`);
    } catch (error) {
      console.error('Follow user failed:', error);
      throw error;
    }
  },

  async unfollowUser(username: string): Promise<void> {
    try {
      await api.delete(`/api/follow/${username}`);
    } catch (error) {
      console.error('Unfollow user failed:', error);
      throw error;
    }
  },

  async getUserByUsername(username: string): Promise<User> {
    const response = await api.get(`/api/users/${username}`);
    
    // Backend returns user data directly in data object
    const userData = response.data.data;
    
    return {
      id: userData.id.toString(),
      name: userData.name,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatarUrl,
      bio: userData.bio,
      followersCount: userData.counts.followers,
      followingCount: userData.counts.following,
      postsCount: userData.counts.post,
      likesCount: userData.counts.likes || 0, // Map total likes received
      isFollowing: userData.isFollowing,
    };
  },

  async getUserPosts(username: string): Promise<Post[]> {
    try {
      const response = await api.get(`/api/users/${username}/posts`);
      
      // Backend returns: { success, message, data: { posts, pagination } }
      const posts = response.data.data.posts || [];
      
      // Map backend post format to frontend Post type
      return posts.map((item: any) => ({
        id: item.id.toString(),
        content: item.content || item.caption || '',
        imageUrl: item.imageUrl,
        author: {
          id: item.author?.id?.toString() || item.authorId?.toString(),
          username: item.author?.username || username,
          name: item.author?.name || username,
          email: item.author?.email || '',
          avatar: item.author?.avatarUrl || item.author?.avatar,
        },
        createdAt: item.createdAt,
        likesCount: item.likesCount || 0,
        commentsCount: item.commentsCount || 0,
        isLiked: item.isLiked || false,
        isSaved: item.isSaved || false,
      }));
    } catch (error) {
      console.warn('getUserPosts API failed, returning empty array', error);
      return [];
    }
  },

  async getUserLikes(username: string): Promise<Post[]> {
    try {
      const response = await api.get(`/api/users/${username}/likes`);
      
      // Backend returns: { success, message, data: { posts, pagination } }
      const posts = response.data.data.posts || [];
      
      // Map backend post format to frontend Post type
      return posts.map((item: any) => ({
        id: item.id.toString(),
        content: item.content || item.caption || '',
        imageUrl: item.imageUrl,
        author: {
          id: item.author?.id?.toString() || item.authorId?.toString(),
          username: item.author?.username || username,
          name: item.author?.name || username,
          email: item.author?.email || '',
          avatar: item.author?.avatarUrl || item.author?.avatar,
        },
        createdAt: item.createdAt,
        likesCount: item.likesCount || 0,
        commentsCount: item.commentsCount || 0,
        isLiked: item.isLiked || false,
        isSaved: item.isSaved || false,
      }));
    } catch (error) {
      console.warn('getUserLikes API failed, returning empty array', error);
      return [];
    }
  },

  async getSavedPosts(): Promise<Post[]> {
    try {
      const response = await api.get('/api/me/saved');
      
      // Backend returns: { success, message, data: { posts, pagination } }
      const posts = response.data.data.posts || [];
      
      // Map backend post format to frontend Post type
      return posts.map((item: any) => ({
        id: item.id.toString(),
        content: item.content || item.caption || '',
        imageUrl: item.imageUrl,
        author: {
          id: item.author?.id?.toString() || item.authorId?.toString(),
          username: item.author?.username || '',
          name: item.author?.name || '',
          email: item.author?.email || '',
          avatar: item.author?.avatarUrl || item.author?.avatar,
        },
        createdAt: item.createdAt,
        likesCount: item.likesCount || 0,
        commentsCount: item.commentsCount || 0,
        isLiked: item.isLiked || false,
        isSaved: true, // All saved posts are saved by definition
      }));
    } catch (error) {
      console.warn('getSavedPosts API failed, returning empty array', error);
      return [];
    }
  }
};
