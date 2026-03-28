import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/types.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-post.component.html'
})
export class CreatePostComponent {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  public router = inject(Router);

  currentUser = this.authService.getCurrentUser();
  posts: Post[] = [];

  onSubmit(form: NgForm) {
    if (form.valid && this,this.currentUser) {
      this.createPost(form.value);
    }
  }

  async createPost(postData: any) {
    const newPost: Post = {
      id: uuidv4(),
      authorId: this.currentUser!.id,
      content: postData.content,
      photo: postData.photo || '',
      date: new Date().toLocaleDateString('ru-RU'),
      likes: []
    };

    try {
      const response: any = await this.http.post('http://localhost:3000/api/posts', newPost).toPromise();
      
      if (response.success) {
        this.router.navigate(['/posts']);
      }
    } catch (error) {
      console.error('Ошибка создания поста:', error);
    }
  }

  loadUsers() {
    this.http.get<{posts: Post[]}>('assets/data/posts.json').subscribe({
      next: (data) => {
        this.posts = data.posts;
      },
      error: (error) => {
        console.error('Ошибка загрузки пользователей:', error);
      }
    });
  }

  cancel() {
    this.router.navigate(['/posts']);
  }
}