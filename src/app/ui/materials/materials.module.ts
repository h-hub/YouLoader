import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule, MatCheckboxModule,MatTableModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule, MatButtonModule, MatCheckboxModule, MatTableModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule
  ],
  exports: [MatButtonModule, MatCheckboxModule, MatTableModule, MatIconModule, MatProgressSpinnerModule, MatProgressBarModule],
  declarations: []
})
export class MaterialsModule { }