import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@core';
import { ChatAuthService } from './chat-auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MtxButtonModule } from '@ng-matero/extensions/button';
import { TranslateModule } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { filter } from 'rxjs';
import { LocalStorageService } from '@shared/services/storage.service';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chat-login-syatem',
  imports: [FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MtxButtonModule,
    TranslateModule,
    MatIcon],
  templateUrl: './chat-login-syatem.html',
  styleUrl: './chat-login-syatem.scss'
})
export class ChatLoginSyatem {
//   private readonly fb = inject(FormBuilder);
//   private readonly router = inject(Router);
//   private readonly auth = inject(AuthService);
//   private readonly chatAuth = inject(ChatAuthService);
//   private readonly store = inject(LocalStorageService);
//  private socket: Socket | undefined ;
//   isSubmitting = false;
//   hidePassword = true;

//   loginForm = this.fb.nonNullable.group({
//     email: ['', [Validators.required]],
//     password: ['', [Validators.required]],
//     rememberMe: [false],
//   });

//   get email() {
//     return this.loginForm.get('email')!;
//   }

//   get password() {
//     return this.loginForm.get('password')!;
//   }

//   get rememberMe() {
//     return this.loginForm.get('rememberMe')!;
//   }

//   login() {
//     this.isSubmitting = true;

//     const paload = {
//       email: this.email.value,
//       password: this.password.value
//     }
//     this.chatAuth
//       .login(paload)
//       // .pipe(filter(authenticated => authenticated))
//       .subscribe({
//         next: (res:any) => {
//           this.socket.emit("register-user", res.user.);

//           this.router.navigateByUrl('/chatFeature');
//           this.store.set('user',res.user)
          
//         },
//         error: (errorRes: HttpErrorResponse) => {
//           if (errorRes.status === 422) {
//             const form = this.loginForm;
//             const errors = errorRes.error.errors;
//             Object.keys(errors).forEach(key => {
//               form.get(key === 'email' ? 'email' : key)?.setErrors({
//                 remote: errors[key][0],
//               });
//             });

//           }
//           this.isSubmitting = false;
//         },
//       });
//   }

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly chatAuth = inject(ChatAuthService);
  private readonly store = inject(LocalStorageService);

  private socket: Socket;

  isSubmitting = false;
  hidePassword = true;

  constructor() {
    // ✅ Initialize WebSocket on login page
    this.socket = io("http://localhost:5000", {
      transports: ["websocket"]
    });
  }

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  get email() {
    return this.loginForm.get('email')!;
  }

  get password() {
    return this.loginForm.get('password')!;
  }

  login() {
    this.isSubmitting = true;

    const payload = {
      email: this.email.value,
      password: this.password.value
    };

    this.chatAuth.login(payload).subscribe({
      next: (res: any) => {

        // ✅ Save user in localStorage
        this.store.set('user', res.user);

        // ✅ Register Socket for chat
        this.socket.emit("register-user", res.user.uniqueCode);

        // ✅ Navigate to chat feature
        this.router.navigateByUrl('/chat-feature');

        this.isSubmitting = false;
      },
      error: () => {
        this.isSubmitting = false;
      }
    });
  }
}
