import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    FormsModule,
    NgbModule,
    NgbNavModule,
    RouterModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    FormsModule,
    NgbModule,
    NgbNavModule,
    RouterModule
  ]
})
export class SharedModule { }