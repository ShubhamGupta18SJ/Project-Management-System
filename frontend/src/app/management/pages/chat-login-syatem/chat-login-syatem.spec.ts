import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatLoginSyatem } from './chat-login-syatem';

describe('ChatLoginSyatem', () => {
  let component: ChatLoginSyatem;
  let fixture: ComponentFixture<ChatLoginSyatem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatLoginSyatem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatLoginSyatem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
