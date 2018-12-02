import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { UiModule } from './ui/ui.module';
import { MaterialsModule } from './ui/materials/materials.module';
import { AboutComponent } from './about/about/about.component';


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        AboutComponent
    ],
    imports: [
        BrowserModule,
        UiModule,
        FormsModule,
        BrowserAnimationsModule,
        MaterialsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
