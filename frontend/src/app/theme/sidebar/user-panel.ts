import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '@core/authentication';
import { TranslateModule } from '@ngx-translate/core';
import { LocalStorageService } from '@shared/services/storage.service';

@Component({
  selector: 'app-user-panel',
  template: `
    <div class="matero-user-panel" routerLink="/profile/overview">
      <img class="matero-user-panel-avatar" [src]="user.avatar" alt="avatar" width="64" />
      <div class="matero-user-panel-info">
      @if(chatUserDetail){
        <h4>{{ chatUserDetail.username }}</h4>
        <h5>{{ chatUserDetail.email }}</h5>
      }@else{
      <h4>{{ user.name }}</h4>
        <h5>{{ user.email }}</h5>
      }
      </div>
    </div>
  `,
  styleUrl: './user-panel.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
})
export class UserPanel implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly store = inject(LocalStorageService);
  user!: User;
  chatUserDetail: any;

  ngOnInit(): void {
    // const userStr = localStorage.getItem('user');
    this.chatUserDetail = this.store.get('user');
    

    this.auth.user().subscribe(user => (this.user = user));
  }
}
