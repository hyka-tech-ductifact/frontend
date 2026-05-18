import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { ToastController, provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '../../../../core/services/auth.service';
import { DeviceService } from '../../../../core/services/device.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    const authServiceMock = {
      login: jest.fn(() => Promise.resolve()),
      signup: jest.fn(() => Promise.resolve()),
    };
    const deviceServiceMock = { isMobile: signal(false) };
    const toastControllerMock = {
      create: jest.fn(() => Promise.resolve({ present: jest.fn() })),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideIonicAngular(),
        importProvidersFrom(TranslateModule.forRoot()),
        { provide: AuthService, useValue: authServiceMock },
        { provide: DeviceService, useValue: deviceServiceMock },
        { provide: ToastController, useValue: toastControllerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
