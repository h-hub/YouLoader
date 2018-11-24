import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule, MatCheckboxModule,MatTableModule, MatIconModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule, MatButtonModule, MatCheckboxModule, MatTableModule, MatIconModule
  ],
  exports: [MatButtonModule, MatCheckboxModule, MatTableModule, MatIconModule],
  declarations: []
})
export class MaterialsModule { }