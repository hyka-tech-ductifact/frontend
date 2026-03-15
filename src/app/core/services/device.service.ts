import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  /** True when running as a native Capacitor app (iOS / Android) OR when the
   *  browser viewport is narrower than 768px (responsive web fallback). */
  readonly isMobile = signal(this.checkMobile());

  constructor() {
    // Only attach resize listener when running in a browser (not native)
    if (!Capacitor.isNativePlatform()) {
      window.addEventListener('resize', () => {
        this.isMobile.set(this.checkMobile());
      });
    }
  }

  private checkMobile(): boolean {
    // Native Capacitor apps (iOS / Android) always use the mobile UI
    if (Capacitor.isNativePlatform()) return true;
    return window.innerWidth < 768;
  }
}
