export interface User {
  id: string;
  profile: {
    name: string;
    surname: string;
    birthDate: string;
    email: string;
    avatar: string;
  };
  password: string;
  role: 'admin' | 'user';
  status: 'pending' | 'active' | 'blocked';
  registrationDate: string;
  friends: string[];
}

export interface UsersResponse {
  totalUsers: number;
  users: User[];
}
  
export interface Post {
  id: string;
  authorId: string;
  author?: User;
  content: string;
  photo?: string;
  date: string;
  likes: string[];
}

export interface PostsResponse {
  posts: Post[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  date: string;
  read: boolean;
}

export interface MessagesResponse {
  messages: Message[];
}