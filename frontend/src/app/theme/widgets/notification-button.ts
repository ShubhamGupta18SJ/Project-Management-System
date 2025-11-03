import { Component, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-notification',
  template: `
    <button mat-icon-button [matMenuTriggerFor]="menu">
      <mat-icon matBadge="5" matBadgeColor="warn" aria-hidden="false">notifications</mat-icon>
    </button>
    <mat-menu #menu="matMenu">
      <mat-nav-list>
      <mat-list-item>
            <mat-icon class="m-x-16" matListItemIcon  matBadge="5">chat</mat-icon>
            <a matListItemTitle (click)='openTab()'>Chat</a>
          </mat-list-item>
        @for (message of messages; track message) {
          <mat-list-item>
            <mat-icon class="m-x-16" matListItemIcon>info</mat-icon>
            <a matListItemTitle href="#">{{ message }}</a>
          </mat-list-item>
        }
      </mat-nav-list>
    </mat-menu>
  `,
  styles: `
    :host ::ng-deep .mat-badge-content {
      --mat-badge-background-color: #ef0000;
      --mat-badge-text-color: #fff;
    }
  `,
  imports: [MatBadgeModule, MatButtonModule, MatIconModule, MatListModule, MatMenuModule],
})
export class NotificationButton {
  messages = ['Server Error Reports 1', 'Server Error Reports 2', 'Server Error Reports 3'];
  private readonly router = inject(Router);
  
  openTab() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser?.uniqueCode) {
        this.router.navigate(['/chatFeature']);
      } else {
        this.router.navigate(['/chatLogin']);
      }
    } else {
      this.router.navigate(['/chatLogin']);
    }
  }

}
