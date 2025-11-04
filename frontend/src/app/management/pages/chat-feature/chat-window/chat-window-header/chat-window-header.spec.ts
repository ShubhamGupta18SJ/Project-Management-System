import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatWindowHeader } from './chat-window-header';

describe('ChatWindowHeader', () => {
  let component: ChatWindowHeader;
  let fixture: ComponentFixture<ChatWindowHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatWindowHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatWindowHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
