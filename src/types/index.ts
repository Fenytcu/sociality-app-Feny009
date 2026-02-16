export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
  likesCount?: number; // Total likes received
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  content: string; // Caption
  imageUrl?: string;
  author: User;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isSaved: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}
