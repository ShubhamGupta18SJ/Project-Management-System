import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileShareUiChatWindow } from './file-share-ui-chat-window';

describe('FileShareUiChatWindow', () => {
  let component: FileShareUiChatWindow;
  let fixture: ComponentFixture<FileShareUiChatWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileShareUiChatWindow]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileShareUiChatWindow);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
