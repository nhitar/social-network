import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { RealTimeService } from '../../services/real-time.service';
import { UserAvatarComponent } from '../../components/user-avatar/user-avatar.component';
import { User, Message, MessagesResponse } from '../../models/types.model';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, UserAvatarComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private realTimeService = inject(RealTimeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cd = inject(ChangeDetectorRef);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isLoading = true;
  currentUser: User | null = null;
  friend: User | null = null;
  messages: Message[] = [];
  newMessage = '';
  private sseSubscription: any;
  private friendId: string = '';

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth']);
      return;
    }

    this.friendId = this.route.snapshot.paramMap.get('id') || '';
    this.loadFriend();
    this.loadMessages();
    this.subscribeToNewMessages();
  }

  loadFriend() {
    this.apiService.getUsers().subscribe({
      next: (response) => {
        this.friend = response.users.find(user => user.id === this.friendId) || null;
        if (!this.friend) {
          this.router.navigate(['/friends']);
        }
      }
    });
  }

  loadMessages() {
    this.apiService.getMessages().subscribe({
      next: (response: MessagesResponse) => {
        this.messages = response.messages.filter(msg =>
          (msg.senderId === this.currentUser?.id && msg.receiverId === this.friendId) ||
          (msg.senderId === this.friendId && msg.receiverId === this.currentUser?.id)
        ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Ошибка загрузки сообщений:', error);
        this.isLoading = false;
      }
    });
  }

  subscribeToNewMessages() {
    this.sseSubscription = this.realTimeService.connect().subscribe({
      next: (event) => {
        if (event.type === 'NEW_MESSAGE') {
          if ((event.message.senderId === this.currentUser?.id && event.message.receiverId === this.friendId) ||
              (event.message.senderId === this.friendId && event.message.receiverId === this.currentUser?.id)) {
                this.messages = [...this.messages, event.message];
                this.cd.detectChanges();
                this.scrollToBottom();
          }
        }
      }
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.currentUser || !this.friend) return;

    const newMessage: Message = {
      id: uuidv4(),
      senderId: this.currentUser.id,
      receiverId: this.friendId,
      message: this.newMessage.trim(),
      date: new Date().toLocaleString('ru-RU'),
      read: false
    };

    this.apiService.sendMessage(newMessage).subscribe({
      next: (response) => {
        if (response.success) {
          this.newMessage = '';
          this.cd.detectChanges();
        }
      },
      error: (error) => {
        console.error('Ошибка отправки сообщения:', error);
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  navigateFriends() {
    this.router.navigate(['/friends']);
  }

  ngOnDestroy() {
    if (this.sseSubscription) {
      this.sseSubscription.unsubscribe();
    }
  }
}