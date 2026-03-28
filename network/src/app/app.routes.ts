import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { ChatComponent } from './pages/chat/chat.component';
import { CreatePostComponent } from './pages/create-post/create-post.component';
import { FriendsListComponent } from './pages/friends-list/friends-list.component';
import { PostsComponent } from './pages/posts/posts.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'auth', component: AuthComponent },
  { path: 'chat/:id', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'create-post', component: CreatePostComponent, canActivate: [AuthGuard] },
  { path: 'friends', component: FriendsListComponent, canActivate: [AuthGuard] },
  { path: 'posts', component: PostsComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' }
];