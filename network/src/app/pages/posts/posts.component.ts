import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { RealTimeService } from '../../services/real-time.service';
import { PostCardComponent } from '../../components/post-card/post-card.component';
import { User, UsersResponse, Post, PostsResponse } from '../../models/types.model';

@Component({
  selector: 'app-posts',
  standalone: true,
  imports: [CommonModule, PostCardComponent],
  templateUrl: './posts.component.html'
})
export class PostsComponent implements OnInit {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private realTimeService = inject(RealTimeService);
  private cd = inject(ChangeDetectorRef);
  private sseSubscription: any;

  isLoading = true;
  posts: Post[] = [];
  users: User[] = [];
  currentUser: User | null = null;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPosts();
    this.loadUsers();
    this.subscribeToNewPosts();
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

  getPostAuthor(post: Post): User | undefined {
    return this.users.find(user => user.id === post.authorId);
  }

  subscribeToNewPosts() {
    this.sseSubscription = this.realTimeService.connect().subscribe({
      next: (event) => {
        if (event.type === 'NEW_POST') {
          const isFromFriend = this.currentUser?.friends?.includes(event.post.authorId);
          const isMyPost = event.post.authorId === this.currentUser?.id;
          
          if (isFromFriend || isMyPost) {
            const author = this.users.find(user => user.id === event.post.authorId);
            
            if (author) {
              this.posts.push(event.post);
              this.cd.detectChanges();
            }
          }
        }

        if (event.type === 'POST_LIKED') {
          const postIndex = this.posts.findIndex(p => p.id === event.postId);
          if (postIndex !== -1) {
            this.posts[postIndex] = {
              ...this.posts[postIndex],
              likes: event.likes
            };
            
            this.cd.detectChanges();
          }
        }
      },
      error: (error) => {
        console.error('Ошибка SSE:', error);
      }
    });
  }

  onLike(postId: string) {
    if (this.currentUser) {
      this.apiService.likePost(postId, this.currentUser.id).subscribe({
        next: () => {          
        },
        error: (error: any) => {
          console.error('Ошибка лайка:', error);
        }
      });
    }
  }

  createNewPost() {
    this.router.navigate(['/create-post']);
  }

  logout() {
    this.authService.logout();
  }

  navigateProfile(): void {
    this.router.navigate(['/profile']);
  }

  ngOnDestroy() {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
  }
}