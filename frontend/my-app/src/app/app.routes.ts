import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component'; // Your home component

// Import only the components you need for these routes for now
import { AboutComponent } from './components/about/about.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { WhyUseComponent } from './components/why-use/why-use.component';
import { ToDoComponent } from './components/to-do/to-do.component'; 
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Your home page
  { path: 'about', component: AboutComponent }, // Route for "About VortexKeep"
  { path: 'how-it-works', component: HowItWorksComponent }, // Route for "How VortexKeep works"
  { path: 'why-use', component: WhyUseComponent }, // Route for "Why use VortexKeep"
  { path: 'todo', component: ToDoComponent }, // Route for "Start Your VortexKeep Today" and "Try VortexKeep" button in header
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] }, // Make sure this route is defined
  { path: 'account-settings', component: AccountSettingsComponent, canActivate: [AuthGuard] },
];