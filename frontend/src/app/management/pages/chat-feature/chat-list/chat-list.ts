import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChatService, Contact } from '../chat.service';
import { ChatAuthService } from '../../chat-login-syatem/chat-auth.service';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatBadgeModule
  ],
  templateUrl: './chat-list.html',
  styleUrls: ['./chat-list.scss']
})
export class ChatList implements OnInit {
  chatAuthService = inject(ChatAuthService);
  chatService = inject(ChatService);

  user = signal<{ username: string; uniqueCode: string } | null>(null);

  // Signal-based inputs
  contacts = input.required<Contact[]>();
  contactCount = input<number>(0);

  // Signal-based outputs
  selectContact = output<Contact>();

  // Computed signals for template usage
  username = computed(() => this.user()?.username)
  uniqueCode = computed(() => this.user()?.uniqueCode);

  constructor() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      this.user.set({ username: parsed.username, uniqueCode: parsed.uniqueCode });
    }
    console.log(storedUser, "..");
  }

  // onSelectContact(contact: Contact) {
  //   const today = new Date().toISOString().split("T")[0];
  //   this.chatService.loadMessages(contact, today);
  // }

  onSelectContact(contact: Contact) {
  this.chatService.selectContact(contact);
}

  ngOnInit(): void {
    this.chatService.loadChatUsers();
   }
}
