import api from '@/lib/api';
import { Post, User, Comment } from '@/types';

interface FeedResponse {
  posts: Post[];
  // pagination if any
}

export const postService = {
  async getFeed(page: number = 1, limit: number = 10): Promise<Post[]> {
    const response = await api.get(`/api/feed?page=${page}&limit=${limit}`);
    
    // Backend returns: { success, message, data: { items, pagination } }
    const items = response.data.data?.items || [];
    
    // Map backend post format to frontend Post type
    return items.map((item: any) => ({
      id: item.id.toString(),
      content: item.caption || item.content || '',
      imageUrl: item.imageUrl,
      author: {
        id: item.author?.id?.toString(),
        username: item.author?.username,
        name: item.author?.name,
        email: item.author?.email || '',
        avatar: item.author?.avatarUrl || item.author?.avatar,
      },
      createdAt: item.createdAt,
      likesCount: item.likeCount || 0,
      commentsCount: item.commentCount || 0,
      sharesCount: item.shareCount || 0,
      isLiked: item.likedByMe || false,
      isSaved: item.isSaved || false,
    }));
  },

  async getPostById(id: string): Promise<Post> {
    const response = await api.get(`/api/posts/${id}`);
    
    // Backend returns data directly: { success, message, data: {...post} }
    const item = response.data.data;
    if (!item) throw new Error('Post data missing');
    
    return {
      id: item.id?.toString() || id,
      content: item.caption || item.content || '',
      imageUrl: item.imageUrl,
      author: {
        id: item.author?.id?.toString() || '',
        username: item.author?.username || 'unknown',
        name: item.author?.name || 'User',
        email: item.author?.email || '',
        avatar: item.author?.avatarUrl || item.author?.avatar,
      },
      createdAt: item.createdAt || new Date().toISOString(),
      likesCount: item.likeCount || 0,
      commentsCount: item.commentCount || 0,
      sharesCount: item.shareCount || 0,
      isLiked: item.likedByMe || false,
      isSaved: item.isSaved || false,
    };
  },

  async createPost(data: FormData): Promise<Post> {
    const response = await api.post('/api/posts', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes timeout for slow uploads
    });
    
    // Backend returns data directly: { success, message, data: {...post} }
    // Backend returns data directly: { success, message, data: {...post} }
    const item = response.data.data;
    if (!item) throw new Error('Post creation failed: No data returned');
    
    return {
      id: item.id?.toString() || Math.random().toString(),
      content: item.caption || item.content || '',
      imageUrl: item.imageUrl,
      author: {
        id: item.author?.id?.toString() || '',
        username: item.author?.username || 'me',
        name: item.author?.name || 'Me',
        email: item.author?.email || '',
        avatar: item.author?.avatarUrl || item.author?.avatar,
      },
      createdAt: item.createdAt || new Date().toISOString(),
      likesCount: item.likeCount || 0,
      commentsCount: item.commentCount || 0,
      sharesCount: item.shareCount || 0,
      isLiked: item.likedByMe || false,
      isSaved: item.isSaved || false,
    };
  },

  async deletePost(id: string): Promise<void> {
    await api.delete(`/api/posts/${id}`);
  },

  // Like actions
  async likePost(postId: string): Promise<void> {
    await api.post(`/api/posts/${postId}/like`);
  },

  async unlikePost(postId: string): Promise<void> {
    await api.delete(`/api/posts/${postId}/like`);
  },

  async getPostLikes(postId: string): Promise<User[]> {
    const response = await api.get(`/api/posts/${postId}/likes`);
    
    // Backend returns: { success, message, data: { users, pagination } }
    const users = response.data.data?.users || [];
    
    return users.map((user: any) => ({
      id: user.id.toString(),
      username: user.username,
      name: user.name,
      email: user.email || '',
      avatar: user.avatarUrl || user.avatar,
      bio: user.bio,
      isFollowing: user.isFollowedByMe || false,
    }));
  },

  async getMyLikedPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
    const response = await api.get(`/api/me/likes?page=${page}&limit=${limit}`);
    
    // Backend returns: { success, message, data: { posts, pagination } }
    const posts = response.data.data?.posts || [];
    
    return posts.map((item: any) => ({
      id: item.id.toString(),
      content: item.caption || item.content || '',
      imageUrl: item.imageUrl,
      author: {
        id: item.author?.id?.toString(),
        username: item.author?.username,
        name: item.author?.name,
        email: item.author?.email || '',
        avatar: item.author?.avatarUrl || item.author?.avatar,
      },
      createdAt: item.createdAt,
      likesCount: item.likeCount || 0,
      commentsCount: item.commentCount || 0,
      sharesCount: item.shareCount || 0,
      isLiked: item.likedByMe || false,
      isSaved: item.isSaved || false,
    }));
  },

  // Save actions
  async savePost(postId: string): Promise<void> {
    await api.post(`/api/posts/${postId}/save`);
  },

  async unsavePost(postId: string): Promise<void> {
    await api.delete(`/api/posts/${postId}/save`);
  },

  async getMySavedPosts(page: number = 1, limit: number = 10): Promise<Post[]> {
    const response = await api.get(`/api/me/saved?page=${page}&limit=${limit}`);
    
    // Backend returns: { success, message, data: { posts, pagination } }
    // Note: Saved posts have limited data (no author, no counts)
    const posts = response.data.data?.posts || [];
    
    return posts.map((item: any) => ({
      id: item.id.toString(),
      content: item.caption || item.content || '',
      imageUrl: item.imageUrl,
      author: {
        id: '',
        username: '',
        name: '',
        email: '',
      },
      createdAt: item.createdAt,
      likesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: false,
      isSaved: true, // Obviously saved since it's in saved list
    }));
  },

  // Comment actions
  async getComments(postId: string): Promise<Comment[]> {
    const response = await api.get(`/api/posts/${postId}/comments`);
    
    // Backend returns: { success, message, data: { comments, pagination } }
    const items = response.data.data?.comments || [];
    
    return items.map((item: any) => ({
      id: item.id?.toString() || Math.random().toString(),
      content: item.text || item.content || '',
      author: {
        id: item.author?.id?.toString() || '',
        username: item.author?.username || 'unknown',
        name: item.author?.name || 'User',
        avatar: item.author?.avatarUrl || item.author?.avatar,
      },
      createdAt: item.createdAt || new Date().toISOString(),
    }));
  },

  async addComment(postId: string, content: string): Promise<Comment> {
    const response = await api.post(`/api/posts/${postId}/comments`, { text: content }).catch((error) => {
        console.error('API Error in addComment:', error.response?.data || error.message);
        throw error;
    });
    
    // Backend returns: { success, message, data: {...comment} }
    const item = response.data.data;
    if (!item) throw new Error('Comment data missing');
    
    return {
      id: item.id?.toString() || Math.random().toString(),
      content: item.text || item.content || content,
      author: {
        id: item.author?.id?.toString() || 'me',
        username: item.author?.username || 'me',
        name: item.author?.name || 'Me',
        email: item.author?.email || '',
        avatar: item.author?.avatarUrl || item.author?.avatar,
      },
      createdAt: item.createdAt || new Date().toISOString(),
    };
  },

  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/api/comments/${commentId}`);
  },
};
