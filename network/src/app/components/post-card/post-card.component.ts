import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { User, Post } from '../../models/types.model';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [UserAvatarComponent],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent {
  private authService = inject(AuthService);

  @Input() post!: Post;
  @Input() author?: User;
  @Output() like = new EventEmitter<string>();

  isLiked: boolean = false;
  currentUser: User | null = null;

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.isLiked = this.post.likes.includes(this.currentUser.id);
    }
  }

  onLike() {
    if (!this.currentUser) return;

    this.isLiked = !this.isLiked;
    
    if (this.isLiked) {
      this.post.likes.push(this.currentUser.id);
    } else {
      this.post.likes = this.post.likes.filter(id => id !== this.currentUser!.id);
    }

    this.like.emit(this.post.id);
  }
}