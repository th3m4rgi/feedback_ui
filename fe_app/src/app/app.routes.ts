import { Routes } from '@angular/router';
import { TwoStepFormComponent } from './components/two-step-form/two-step-form.component';
import { ListComponent } from './components/list/list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/feedback', pathMatch: 'full' },
  { path: 'feedback', component: TwoStepFormComponent }, // <-- Fix here
  { path: 'list', component: ListComponent },
  { path: '**', redirectTo: '/feedback' }
];
