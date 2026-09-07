import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';

import { MobileLayoutComponent } from './mobile-layout.component';

describe('MobileLayoutComponent', () => {
  let component: MobileLayoutComponent;
  let fixture: ComponentFixture<MobileLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobileLayoutComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideIonicAngular(),
        importProvidersFrom(TranslateModule.forRoot()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MobileLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
