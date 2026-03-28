import { Component, Input } from '@angular/core';
import { User } from '../../models/types.model';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  templateUrl: './user-avatar.component.html',
  styleUrls: ['./user-avatar.component.scss']
})
export class UserAvatarComponent {
  @Input() user: User | null | undefined;
  @Input() size: number = 50;
}