import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-file-share',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatInputModule, FormsModule],
  templateUrl: './file-share.html',
  styleUrl: './file-share.scss'
})
export class FileShare {
  @Output() fileSend = new EventEmitter<{ files: File[]; caption: string }>();
  @Output() close = new EventEmitter<void>();

  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  caption = '';

  // 🔹 Handle multiple file select
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    this.selectedFiles.push(...files);

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrls.push(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  sendFiles() {
    if (this.selectedFiles.length > 0) {
      this.fileSend.emit({ files: this.selectedFiles, caption: this.caption });
    }
  }

  clearAll() {
    this.selectedFiles = [];
    this.previewUrls = [];
  }

  openFileInput(fileInput: HTMLInputElement) {
    fileInput.click();
  }

}
