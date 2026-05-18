import { ComponentFixture, TestBed } from '@angular/core/testing';
import { importProvidersFrom } from '@angular/core';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { LoginMobileComponent } from './login-mobile.component';

describe('LoginMobileComponent', () => {
  let component: LoginMobileComponent;
  let fixture: ComponentFixture<LoginMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginMobileComponent],
      providers: [provideIonicAngular(), importProvidersFrom(TranslateModule.forRoot())],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
