import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatFeature } from './chat-feature';

describe('ChatFeature', () => {
  let component: ChatFeature;
  let fixture: ComponentFixture<ChatFeature>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatFeature]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatFeature);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
