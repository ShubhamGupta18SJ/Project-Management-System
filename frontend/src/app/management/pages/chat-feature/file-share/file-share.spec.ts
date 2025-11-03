import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileShare } from './file-share';

describe('FileShare', () => {
  let component: FileShare;
  let fixture: ComponentFixture<FileShare>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileShare]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileShare);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
