import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { UserAvatarComponent } from '../../components/user-avatar/user-avatar.component';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { User, UsersResponse, Post, PostsResponse } from '../../models/types.model';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, UserAvatarComponent, PostCardComponent],
    templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private apiService = inject(ApiService);
    private router = inject(Router);

    isLoading = true;
    posts: Post[] = [];
    users: User[] = [];
    currentUser: User | null = null;
    avatarFileName = '';

    ngOnInit() {
        this.currentUser = this.authService.getCurrentUser();
        this.loadPosts();
        this.loadUsers();
    }

    loadUsers() {
        this.apiService.getUsers().subscribe({
            next: (usersResponse: UsersResponse) => {
                this.users = usersResponse.users;
                this.isLoading = false;
            },
            error: (error: any) => {
                console.error('Ошибка загрузки пользователей:', error);
                this.users = [];
                this.isLoading = false;
            }
        });
    }

    loadPosts() {
        this.apiService.getPosts().subscribe({
            next: (response: PostsResponse) => {
                this.posts = this.filterPostsForCurrentUser(response.posts);
            },
            error: (error: any) => {
                console.error('Ошибка загрузки новостей:', error);
            }
        });
    }

    filterPostsForCurrentUser(allPosts: Post[]): Post[] {
        if (!this.currentUser) return [];

        const currentUserId = this.currentUser.id;
        const userFriends = this.currentUser.friends || [];

        return allPosts.filter(post =>
            post.authorId === currentUserId ||
            userFriends.includes(post.authorId)
        );
    }

    async changeAvatar(): Promise<void> {
        if (!this.avatarFileName.trim() || !this.currentUser) {
            return;
        }

        try {
            const avatarExists = await this.checkAvatarExists(this.avatarFileName);

            if (!avatarExists) {
                return;
            }

            this.currentUser.profile.avatar = this.avatarFileName;
            this.authService.setCurrentUser(this.currentUser);

            this.apiService.updateUserAvatar(this.currentUser.id, this.avatarFileName).subscribe({
                next: () => {
                    this.avatarFileName = '';
                },
                error: (error) => {
                    console.error('Ошибка при обновлении JSON:', error);
                }
            });

        } catch (error) {
            console.error('Ошибка при смене аватара:', error);
        }
    }

    private async checkAvatarExists(filename: string): Promise<boolean> {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = `assets/avatars/${filename}`;

            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);

            setTimeout(() => resolve(false), 1000);
        });
    }

    getPostAuthor(post: Post): User | undefined {
        return this.users.find(user => user.id === post.authorId);
    }

    onLike(postId: string) {
        if (this.currentUser) {
            this.apiService.likePost(postId, this.currentUser.id).subscribe({
                next: (response: any) => {
                    const postIndex = this.posts.findIndex(p => p.id === postId);
                    if (postIndex !== -1) {
                        this.posts[postIndex] = {
                            ...this.posts[postIndex],
                            likes: response.likes
                        };
                        this.posts = [...this.posts];
                    }
                },
                error: (error: any) => {
                    console.error('Ошибка лайка:', error);
                }
            });
        }
    }

    navigatePosts(): void {
        this.router.navigate(['/posts']);
    }

    navigateFriends(): void {
        this.router.navigate(['/friends']);
    }

    logout(): void {
        this.authService.logout();
    }
}