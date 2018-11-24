import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatButtonModule, MatCheckboxModule,MatTableModule} from '@angular/material';

@NgModule({
  imports: [
    CommonModule, MatButtonModule, MatCheckboxModule, MatTableModule
  ],
  exports: [MatButtonModule, MatCheckboxModule, MatTableModule],
  declarations: []
})
export class MaterialsModule { }