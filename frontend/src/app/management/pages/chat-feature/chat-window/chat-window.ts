import { CommonModule } from '@angular/common';
import { Component, input, signal, OnInit, OnDestroy, inject, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { io, Socket } from "socket.io-client";
import { ChatService, Contact, Message } from '../chat.service';
import { ChatAuthService } from '../../chat-login-syatem/chat-auth.service';
import { FileShare } from '../file-share/file-share';
import { ChatWindowHeader } from './chat-window-header/chat-window-header';

@Component({
  selector: 'app-chat-window',
  imports: [
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    FileShare,
    ChatWindowHeader
  ],
  templateUrl: './chat-window.html',
  styleUrls: ['./chat-window.scss']
})
export class ChatWindow implements OnInit {

  public chatService = inject(ChatService);
  messageText = signal('');
  currentUser = JSON.parse(localStorage.getItem('user') || '{}');


  get selectedContact() {
    return this.chatService.selectedContact();
  }

  get messages() {
    return this.chatService.messages;
  }


  ngOnInit() {
    effect(() => {
      const messages = this.chatService.messages();
      console.log('📩 Messages updated:ChatWindow', messages);
    });
    effect(() => {
      const selected = this.chatService.selectedContact();
      if (selected) {
        this.chatService.markMessagesAsRead(selected.sanderUniqueCode);
        this.scrollToBottom();
        this.scrollToUnreadMessage();
      }
    });
    this.scrollToUnreadMessage();
  }

  // replaye too start
  replyingTo: Message | null = null;

  startReply(message: Message) {
    this.replyingTo = message;
  }

  cancelReply() {
    this.replyingTo = null;
  }
  // scrollToMessage(messageId: number) {
  //   const element = document.querySelector(`[data-id="${messageId}"]`);
  //   if (element) {
  //     element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  //     element.classList.add('highlight');
  //     setTimeout(() => element.classList.remove('highlight'), 2000);
  //   }
  // }
scrollToMessage(messageId: string | undefined) {
  if (!messageId) return;

  const element = document.getElementById(messageId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('highlight');
    setTimeout(() => element.classList.remove('highlight'), 2000);
  }
}

  // replaye too end

//   sendMessage() {
//   const text = this.messageText().trim();
//   if (!text) return;

//   const payload: any = { text };

//   if (this.replyingTo) {
//     payload.replyTo = this.replyingTo.tempId || this.replyingTo.id;
//     payload.replyToText = this.replyingTo.text;
//     payload.replyToUserName =
//       this.replyingTo.sanderUniqueCode === this.currentUser.uniqueCode
//         ? 'You'
//         : this.selectedContact?.name;
//   }

//   console.log('📤 Sending payload:', payload);
//   this.chatService.sendMessage(payload);
//   this.messageText.set('');
//   this.replyingTo = null;

//   setTimeout(() => this.scrollToBottom(), 50);
// }

sendMessage() {
  const text = this.messageText().trim();
  if (!text) return;

  const payload: any = { text };

  if (this.replyingTo) {
    payload.replyTo = {
      _id: this.replyingTo.id,
      text: this.replyingTo.text,
      sanderUniqueCode: this.replyingTo.sanderUniqueCode,
      reciverUniqueCode: this.replyingTo.reciverUniqueCode,
      date: this.replyingTo.date,
      time: this.replyingTo.time
    };
    payload.replyToText = this.replyingTo.text;
    payload.replyToUserName =
      this.replyingTo.sanderUniqueCode === this.currentUser.uniqueCode
        ? 'You'
        : this.selectedContact?.name;
  }

  console.log('📤 Sending payload:', payload);
  this.chatService.sendMessage(payload);
  this.messageText.set('');
  this.replyingTo = null;
  setTimeout(() => this.scrollToBottom(), 50);
}


  // sendMessage() {
  //   const text = this.messageText().trim();
  //   if (!text) return;

  //   const payload: any = { text };

  //   if (this.replyingTo) {
  //     payload.replyTo = this.replyingTo.id;
  //     payload.replyToText = this.replyingTo.text;
  //     this.replyingTo = null; // reset
  //   }
  //   console.log(payload, "Chatwinfo");

  //   this.chatService.sendMessage(payload);
  //   this.messageText.set('');
  //   setTimeout(() => this.scrollToBottom(), 50);
  // }


  scrollToUnreadMessage() {
    const container = document.querySelector('.chat-messages');
    if (!container) return;

    const messageElements = container.querySelectorAll('.message');
    const currentUserCode = this.currentUser.uniqueCode;

    let targetElement: HTMLElement | null = null;

    // Find the first unread message (not sent by current user)
    for (const el of Array.from(messageElements)) {
      const messageId = (el as HTMLElement).getAttribute('data-id');
      const message = this.filteredMessages.find(m => m.id === Number(messageId));
      if (
        message &&
        message.sanderUniqueCode !== currentUserCode &&
        message.messageStatus !== 3
      ) {
        targetElement = el as HTMLElement;
        break;
      }
    }

    // If unread message found → scroll to it
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Optional: highlight unread message for 2 seconds
      targetElement.classList.add('highlight');
      setTimeout(() => targetElement.classList.remove('highlight'), 2000);
    } else {
      // No unread messages → scroll to bottom
      container.scrollTop = container.scrollHeight;
    }
  }


  scrollToBottom() {
    const container = document.querySelector('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  get filteredMessages() {
    const selected = this.chatService.selectedContact();
    if (!selected) return [];

    const currentUser = this.currentUser.uniqueCode;
    return this.messages().filter(
      (m) =>
        (m.sanderUniqueCode === currentUser &&
          m.reciverUniqueCode === selected.sanderUniqueCode) ||
        (m.sanderUniqueCode === selected.sanderUniqueCode &&
          m.reciverUniqueCode === currentUser)
    );
  }

  get groupedMessages() {
    const grouped: { date: string; messages: Message[] }[] = [];
    const map = new Map<string, Message[]>();

    for (const msg of this.filteredMessages) {
      if (!map.has(msg.date)) map.set(msg.date, []);
      map.get(msg.date)?.push(msg);
    }

    for (const [date, messages] of map.entries()) {
      grouped.push({ date, messages });
    }

    grouped.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return grouped;
  }

  getDisplayDate(date: string): string {
    const today = new Date().toISOString().split('T')[0];
    if (date === today) return 'Today';
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  onScroll(event: Event) {
    const element = event.target as HTMLElement;
    console.log(element, "oldestDate");

    if (element.scrollTop === 0) {
      const oldestDate = this.groupedMessages[0]?.date;

      if (oldestDate) {
        this.loadOlderMessages(oldestDate);
      }
    }
  }

  loadOlderMessages(oldestDate: string) {
    const container = document.querySelector('.chat-messages');
    const prevHeight = container?.scrollHeight ?? 0;

    const contact = this.chatService.selectedContact();
    if (!contact) return;

    const previousDate = this.getPreviousDate(oldestDate);
    if (!previousDate) return;

    this.chatService.loadMessages(contact, previousDate).then(() => {
      setTimeout(() => {
        if (container) {
          container.scrollTop = container.scrollHeight - prevHeight;
        }
      }, 100);
    });
  }


  getPreviousDate(dateStr: string): string | null {
    const date = new Date(dateStr);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  }

  // ?file shareing
  showFileShare = signal(false);

  openFileShare() {
    this.showFileShare.set(true);
  }

  onFileShareClose() {
    this.showFileShare.set(false);
  }

  onFileSend(event: { files: File[]; caption: string }) {
    console.log('📤 Multiple files sent:', event.files, '📜 Caption:', event.caption);
    this.showFileShare.set(false);
    // send to socket/upload logic next step
  }

  // icon emoji shortcuts
  showEmojiPicker = false;

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.messageText += event.detail.unicode;
  }

}