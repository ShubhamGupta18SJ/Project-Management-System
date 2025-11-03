import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';

export interface ChatUser {
  _id: string;
  username: string;
  email: string;
  uniqueCode: string;
}

@Injectable({ providedIn: 'root' })
export class ChatAuthService {
  apiUrl = 'http://localhost:5000/api/login';
  user = signal<ChatUser | null>(null);
  private socket: Socket | undefined;

  constructor(private http: HttpClient, private router: Router) { 
  

  }

  login(data: any) {
    return this.http.post(`${this.apiUrl}`, data);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  setUser(user: ChatUser) {
    this.user.set(user);                  // Update signal
    localStorage.setItem('user', JSON.stringify(user));  // Save in localStorage
  }

  getUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser) as ChatUser;
    }
    return null;
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
