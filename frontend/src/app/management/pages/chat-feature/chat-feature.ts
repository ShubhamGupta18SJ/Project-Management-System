import { Component, effect, inject } from '@angular/core';
import { ChatService, Contact } from './chat.service';
import { ChatList } from './chat-list/chat-list';
import { ChatWindow } from './chat-window/chat-window';

@Component({
  selector: 'app-chat-feature',
  imports: [ChatList, ChatWindow],
  templateUrl: './chat-feature.html',
  styleUrl: './chat-feature.scss'
})
export class ChatFeature {
  public chatService = inject(ChatService);

  constructor() {
    // Effect to react to contact selection changes
    effect(() => {
      const selected = this.chatService.selectedContact();
      if (selected) {
        console.log('Contact selected:', selected);
      }
    });
  }

  onSelectContact(contact: Contact) {
    const today = new Date().toISOString().split("T")[0];
    this.chatService.selectContact(contact);
    this.chatService.loadMessages(contact, today);
  }

}
