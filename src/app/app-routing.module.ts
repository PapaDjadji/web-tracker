import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PackageTrackingComponent } from './package-tracking/package-tracking.component';

const routes: Routes = [
  { path: '', redirectTo: '/tracking', pathMatch: 'full' },
  { path: 'tracking', component: PackageTrackingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
