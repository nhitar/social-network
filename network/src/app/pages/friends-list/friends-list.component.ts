import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { UserAvatarComponent } from '../../components/user-avatar/user-avatar.component';
import { User } from '../../models/types.model';

@Component({
  selector: 'app-friends-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserAvatarComponent],
  templateUrl: './friends-list.component.html'
})
export class FriendsListComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = true;
  currentUser: User | null = null;
  friends: User[] = [];
  searchName = '';
  searchSurname = '';

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }
    this.loadFriends();
  }

  loadFriends() {
    this.apiService.getUsers().subscribe({
      next: (response) => {
        this.friends = response.users.filter(user => 
          this.currentUser?.friends?.includes(user.id)
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ошибка загрузки друзей:', error);
        this.isLoading = false;
      }
    });
  }

  async addFriend() {
    if (!this.searchName || !this.searchSurname) return;

    const response = await this.apiService.getUsers().toPromise();
    const allUsers = response?.users || [];

    const foundUser = allUsers.find(user => 
      user.profile.name.toLowerCase() === this.searchName.toLowerCase() &&
      user.profile.surname.toLowerCase() === this.searchSurname.toLowerCase()
    );

    if (!foundUser) {
      alert('Пользователь не найден');
      return;
    }

    if (this.friends.some(friend => friend.id === foundUser.id)) {
      alert('Уже в друзьях');
      return;
    }

    this.apiService.addFriend(this.currentUser!.id, foundUser.id).subscribe({
      next: () => {
        this.friends.push(foundUser);
        this.searchName = '';
        this.searchSurname = '';
      },
      error: () => {
        alert('Ошибка добавления');
      }
    });
  }

  openChat(friendId: string) {
    this.router.navigate(['/chat', friendId]);
  }

  navigateProfile() {
    this.router.navigate(['/profile']);
  }

  navigatePosts() {
    this.router.navigate(['/posts']);
  }
}