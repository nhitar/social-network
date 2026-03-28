import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UsersResponse, Post, PostsResponse, Message, MessagesResponse } from '../models/types.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_URL = 'http://localhost:3000/api';
  private readonly ASSERTS_URL = 'assets/data';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.ASSERTS_URL}/users.json`);
  }

  getPosts(): Observable<PostsResponse> {
    return this.http.get<PostsResponse>(`${this.ASSERTS_URL}/posts.json`);
  }

  getMessages(): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(`${this.ASSERTS_URL}/messages.json`);
  }

  register(userData: User) {
    return this.http.post<User>(`${this.API_URL}/register`, userData);
  }

  createPost(postData: { content: string; photo?: File }) {
    const formData = new FormData();
    formData.append('content', postData.content);
    if (postData.photo) {
      formData.append('photo', postData.photo);
    }
    return this.http.post<Post>(`${this.API_URL}/posts`, formData);
  }

  likePost(postId: string, userId: string) {
    return this.http.post(`${this.API_URL}/posts/${postId}/like`, { userId });
  }

  updateUserAvatar(userId: string, avatarFileName: string): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/avatar`, {
      avatar: avatarFileName
    });
  }

  addFriend(userId: string, friendId: string): Observable<any> {
    return this.http.post(`${this.API_URL}/users/${userId}/friends`, { friendId });
  }

  sendMessage(message: Message): Observable<any> {
    return this.http.post(`${this.API_URL}/messages`, message);
  }
}