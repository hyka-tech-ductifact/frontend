import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `<p>Dashboard</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
