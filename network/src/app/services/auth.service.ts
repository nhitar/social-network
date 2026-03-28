import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/types.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);

  private readonly USER_KEY = 'currentUser';
  private readonly API_URL = 'http://localhost:3000/api';

  async registerUser(user: User): Promise<boolean> {
    try {
      this.setCurrentUser(user);
      
      const response: any = await this.http.post(`${this.API_URL}/users`, user).toPromise();
      
      if (response.success) {
        return true;
      }
      return false;
      
    } catch (error) {
      console.error('Ошибка при сохранении пользователя:', error);
      return true;
    }
  }

  setCurrentUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  addUserToJson(newUser: User): Promise<void> {
    return this.http.get<{users: User[]}>('assets/data/users.json').toPromise()
      .then(response => {
        const users = response?.users || [];
        
        if (!users.find(u => u.id === newUser.id || u.profile.email === newUser.profile.email)) {
          users.push(newUser);
        }
      })
      .catch(error => {
        console.error('Ошибка при добавлении пользователя в JSON:', error);
      });
  }

  logout(): void {
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth']);
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  getUsers(): Promise<User[]> {
    return this.http.get<{users: User[]}>('assets/data/users.json')
      .toPromise()
      .then(response => response?.users || [])
      .catch(() => []);
  }
}