import { NgModule } from '@angular/core';
import { IconCamera, IconHeart, IconGithub, IconHome, IconFile } from 'angular-feather';

const icons = [
  IconCamera,
  IconHeart,
  IconGithub,
  IconHome,
  IconFile
];

@NgModule({
  exports: icons
})
export class IconsModule { }