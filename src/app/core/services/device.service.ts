import { Injectable, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';

/**
 * Service that detects whether the app is running on a mobile device.
 * Supports both native Capacitor platforms (iOS/Android) and responsive web
 * by listening to window resize events in the browser.
 */
@Injectable({ providedIn: 'root' })
export class DeviceService {
  /**
   * True when running as a native Capacitor app (iOS / Android) OR when the
   *  browser viewport is narrower than 768px (responsive web fallback).
   */
  readonly isMobile = signal(this.checkMobile());

  /**
   * Initializes the service and attaches a resize listener when running in a browser
   * to reactively update the `isMobile` signal on viewport changes.
   */
  constructor() {
    // Only attach resize listener when running in a browser (not native)
    if (!Capacitor.isNativePlatform()) {
      window.addEventListener('resize', () => {
        this.isMobile.set(this.checkMobile());
      });
    }
  }

  /**
   * Evaluates whether the current environment should be treated as mobile.
   * Native Capacitor apps always return true; in the browser, checks if the
   * viewport width is less than 768px.
   * @returns {boolean} True if the environment is mobile, false otherwise.
   */
  private checkMobile(): boolean {
    // Native Capacitor apps (iOS / Android) always use the mobile UI
    if (Capacitor.isNativePlatform()) return true;
    return window.innerWidth < 768;
  }
}
