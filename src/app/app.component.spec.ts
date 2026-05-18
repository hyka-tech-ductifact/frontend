import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, EventEmitter } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Platform, provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { DeviceService } from './core/services/device.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    const platformMock = {
      ready: jest.fn(() => Promise.resolve('cordova')),
    };
    const translateServiceMock = {
      use: jest.fn(),
      get: jest.fn(() => of('')),
      instant: jest.fn(),
      setDefaultLang: jest.fn(),
      addLangs: jest.fn(),
      getBrowserLang: jest.fn(() => 'es'),
      onLangChange: new EventEmitter(),
      onTranslationChange: new EventEmitter(),
      onDefaultLangChange: new EventEmitter(),
      stream: jest.fn(() => of({})),
      currentLang: 'es',
    };
    const deviceServiceMock = { isMobile: signal(false) };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideIonicAngular(),
        { provide: Platform, useValue: platformMock },
        { provide: TranslateService, useValue: translateServiceMock },
        { provide: DeviceService, useValue: deviceServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
