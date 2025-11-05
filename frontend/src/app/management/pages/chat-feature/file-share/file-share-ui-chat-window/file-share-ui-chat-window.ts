import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Message } from '../../chat.service';

@Component({
  selector: 'app-file-share-ui-chat-window',
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './file-share-ui-chat-window.html',
  styleUrl: './file-share-ui-chat-window.scss'
})
export class FileShareUiChatWindow {
 @Input() message!: Message;
  @Input() isSent = false;

  isImage() {
    // const name = this.message?.fileName?.toLowerCase() || '';
    // return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  }

  downloadFile() {
    const a = document.createElement('a');
    // a.href = this.message.fileUrl;
    // a.download = this.message.fileName;
    a.click();
  }

  openImage(url: string) {
    window.open(url, '_blank');
  }
}
