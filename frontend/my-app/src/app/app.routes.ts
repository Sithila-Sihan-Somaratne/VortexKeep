import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component'; // Your home component

// Import only the components you need for these routes for now
import { AboutComponent } from './components/about/about.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { WhyUseComponent } from './components/why-use/why-use.component';
import { ToDoComponent } from './components/to-do/to-do.component'; 

export const routes: Routes = [
  { path: '', component: HomeComponent }, // Your home page
  { path: 'about', component: AboutComponent }, // Route for "About VortexKeep"
  { path: 'how-it-works', component: HowItWorksComponent }, // Route for "How VortexKeep works"
  { path: 'why-use', component: WhyUseComponent }, // Route for "Why use VortexKeep"
  { path: 'todo', component: ToDoComponent }, // Route for "Start Your VortexKeep Today" and "Try VortexKeep" button in header
];