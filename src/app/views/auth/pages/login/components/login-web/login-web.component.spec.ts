jest.mock('marked', () => ({
  marked: {
    parse: jest.fn().mockImplementation((content: string) => Promise.resolve(`<p>${content}</p>`)),
  },
}));

import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { LoginWebComponent } from './login-web.component';

describe('LoginWebComponent', () => {
  let component: LoginWebComponent;
  let fixture: ComponentFixture<LoginWebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginWebComponent],
      providers: [provideHttpClient(), importProvidersFrom(TranslateModule.forRoot())],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
