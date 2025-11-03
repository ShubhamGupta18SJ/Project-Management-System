
import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed } from '@angular/core';
import { environment } from '@env/environment';
import { io, Socket } from 'socket.io-client';
export interface Contact {
  id: number;
  sanderUniqueCode: string;
  reciverUniqueCode: string;
  name: string;
  avatar: string;
  latestMessage: string;
  lastMessageTime: string;
  unReadMessages?: string;
}

export interface Message {
  id: number;
  sanderUniqueCode: string;
  reciverUniqueCode: string;
  text: string;
  time: string;
  isSent: boolean;
  isRead?: boolean;
  messageStatus: number;
  date?: any;
  tempId?: string
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
  storedUser: any;
  constructor(private http: HttpClient) {
    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    this.storedUser = localStorage.getItem('user');
    const currentUser = JSON.parse(this.storedUser || '{}');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.uniqueCode) {
      this.socket.emit('register-user', user.uniqueCode);
    }

    // 1️⃣ Listen for message status updates
    this.socket.on('messageStatus', (msg: any) => {
      console.log('📩 Message status update:', msg);

      this.messagesSignal.update(messages =>
        messages.map(m =>
          m.tempId === msg.tempId
            ? { ...m, messageStatus: msg.messageStatus }
            : m
        )
      );
    });

    // 2️⃣ Listen for incoming messages
    this.socket.on('message', (msg: any) => {
      console.log('📩 New incoming message:', msg);
      this.receiveMessage(msg);
    });

    // 3️⃣ Listen for read confirmations
    this.socket.on("messagesSeen", (data) => {
      console.log("👁 Messages seen:", data);

      this.messagesSignal.update(msgs =>
        msgs.map(m =>
          m.sanderUniqueCode === data.senderCode
            ? { ...m, isRead: true, messageStatus: 3 }
            : m
        )
      );
    });
  }


  loadChatUsers() {
    this.http.get(`${environment.apiUrl}/api/messages/users/list`)
      .subscribe((res: any) => {
        if (res?.status && Array.isArray(res.data)) {
          const contacts: Contact[] = res.data.map((u: any, index: number) => ({
            id: index + 1,
            sanderUniqueCode: u.uniqueCode,
            reciverUniqueCode: u.uniqueCode,
            name: u.username,
            avatar: u.avatar,
            latestMessage: u.lastSeen,
            lastMessageTime: u.lastMsgTime,
            unReadMessages: u.unread
          }));

          this.contactsSignal.set(contacts);
        }
      });
  }



  //  Signals for state
  private contactsSignal = signal<Contact[]>([
  ]);

  private messagesSignal = signal<Message[]>([]);

  private selectedContactSignal = signal<Contact | null>(null);

  //  Public readonly signals
  contacts = this.contactsSignal.asReadonly();
  messages = this.messagesSignal.asReadonly();
  selectedContact = this.selectedContactSignal.asReadonly();


  contactCount = computed(() =>
    this.contactsSignal().filter(c => Number(c.unReadMessages) > 0).length
  );



  //  Send message to server
  sendMessage(text: string) {
    if (!this.storedUser) return;

    const currentUser = JSON.parse(this.storedUser);
    const selected = this.selectedContact();

    if (!selected) return;

    const newMessage: Message = {
      id: this.messagesSignal().length + 1,
      text,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isSent: true,
      isRead: false,
      messageStatus: 1,
      sanderUniqueCode: currentUser.uniqueCode,
      reciverUniqueCode: selected.reciverUniqueCode,
      date: new Date().toISOString().split("T")[0],
      tempId: `${new Date().toISOString().split("T")[0]}_${currentUser.uniqueCode}_${selected.reciverUniqueCode}`
    };

    //  Emit to backend
    this.socket.emit('message', newMessage);
    //  Update UI instantly
    this.messagesSignal.update(messages => [...messages, newMessage]);
  }


  // private receiveMessage(msg: Message) {
  //   const storedUser = localStorage.getItem('user');
  //   if (!storedUser) return;

  //   const currentUser = JSON.parse(storedUser);

  //   //  Ignore message if this user is the sender
  //   if (msg.sanderUniqueCode === currentUser.uniqueCode) {
  //     console.log("⏩ Ignored self message from server");
  //     return;
  //   }

  //   const newMsg: Message = {
  //     id: this.messagesSignal().length + 1,
  //     text: msg.text,
  //     time: msg.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  //     isSent: false,
  //     isRead: true,
  //     sanderUniqueCode: msg.sanderUniqueCode,
  //     reciverUniqueCode: msg.reciverUniqueCode,
  //     messageStatus: msg.messageStatus ?? 1
  //   };

  //   this.messagesSignal.update(messages => [...messages, newMsg]);
  // }
  private receiveMessage(msg: Message) {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    const currentUser = JSON.parse(storedUser);

    // Ignore if this message is from current user (already displayed)
    if (msg.sanderUniqueCode === currentUser.uniqueCode) {
      console.log("⏩ Ignored self message from server");
      return;
    }

    const newMsg: Message = {
      id: this.messagesSignal().length + 1,
      text: msg.text,
      time: msg.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      isSent: false,
      isRead: false,
      messageStatus: msg.messageStatus ?? 2,
      sanderUniqueCode: msg.sanderUniqueCode,
      reciverUniqueCode: msg.reciverUniqueCode,
      date: msg.date || new Date().toISOString().split("T")[0],
    };

    //  Add message instantly to chat window
    this.messagesSignal.update(messages => [...messages, newMsg]);

    //  If receiver is currently viewing this chat, mark message as read immediately
    const selected = this.selectedContact();
    if (selected && selected.sanderUniqueCode === msg.sanderUniqueCode) {
      this.markMessagesAsRead(msg.sanderUniqueCode);
    }
  }

  markMessagesAsRead(senderCode: string) {
    console.log("ss", senderCode);

    const updated = this.messagesSignal().map(msg => {
      if (msg.sanderUniqueCode === senderCode) {
        return { ...msg, isRead: true, messageStatus: 3 };
      }
      return msg;
    });
    this.messagesSignal.set(updated);

    this.socket.emit("readMessages", { senderCode });
  }

  // selectContact(contact: Contact) {
  //   this.selectedContactSignal.set(contact);

  //   if (this.messagesSignal().length === 0) {
  //     const today = new Date().toISOString().split("T")[0];
  //     this.loadMessages(contact, today);
  //   }

  //   this.markMessagesAsRead(contact.reciverUniqueCode);
  // }
  selectContact(contact: Contact) {
    this.selectedContactSignal.set(contact);

    // Always load fresh messages for this contact
    const today = new Date().toISOString().split("T")[0];
    this.loadMessages(contact, today);

    // Mark messages as read
    this.markMessagesAsRead(contact.reciverUniqueCode);
  }



  async loadMessages(contact: Contact, selectedDate: string = new Date().toISOString().split("T")[0]) {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;

    const currentUser = JSON.parse(storedUser);

    this.http.get(`${environment.apiUrl}/api/messages/date/${currentUser.uniqueCode}/${contact.sanderUniqueCode}/${selectedDate}`)
      .subscribe((res: any) => {

        if (res?.success && res.data?.messages) {

          const formattedMsgs = res.data.messages.map((m: any, index: number) => ({
            id: index + 1,
            text: m.text,
            time: m.time,
            date: m.date,
            isSent: m.sanderUniqueCode === currentUser.uniqueCode,
            isRead: m.isRead,
            messageStatus: m.messageStatus,
            sanderUniqueCode: m.sanderUniqueCode,
            reciverUniqueCode: m.reciverUniqueCode
          }));

          this.messagesSignal.set(formattedMsgs);
        }
      });
  }

}

