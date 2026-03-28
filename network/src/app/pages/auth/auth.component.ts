import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/types.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  users: User[] = [];
  isLoginMode = true;

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/profile']);
      return;
    }
    
    this.loadUsers();
  }

  loadUsers() {
    this.apiService.getUsers().subscribe({
      next: (data) => {
        this.users = data.users;
      },
      error: (error) => {
        console.error('Ошибка загрузки пользователей:', error);
      }
    });
  }

  loginUser(email: string, password: string): void {
    const user = this.findUserByEmail(email);
    
    if (user && user.password === password) {
      this.authService.setCurrentUser(user);
      this.router.navigate(['/profile']);
    } else {
      alert('Неверный email или пароль');
    }
  }

  switchToLogin() {
    this.isLoginMode = true;
  }

  switchToRegister() {
    this.isLoginMode = false;
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      if (this.isLoginMode) {
        const { email, password } = form.value;
        this.loginUser(email, password);
      } else {
        const { name, surname, email, birthDate, password } = form.value;
        this.registerUser({ name, surname, email, birthDate, password });
      }
    }
  }

  async registerUser(userData: any): Promise<void> {
    if (this.findUserByEmail(userData.email)) {
      alert('Пользователь с таким email уже существует');
      return;
    }
    const newUser: User = {
      id: uuidv4(),
      profile: {
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        birthDate: this.formatDate(userData.birthDate),
        avatar: 'default-avatar.jpg'
      },
      password: userData.password,
      role: 'user',
      status: 'active',
      registrationDate: new Date().toLocaleDateString(),
      friends: []
    };

    const success = await this.authService.registerUser(newUser);
    
    if (success) {
      this.router.navigate(['/profile']);
    } else {
      alert('Ошибка регистрации. Попробуйте снова');
    }
  }

  private formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.profile.email === email);
  }
}