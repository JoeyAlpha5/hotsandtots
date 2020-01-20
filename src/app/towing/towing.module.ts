import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TowingPageRoutingModule } from './towing-routing.module';

import { TowingPage } from './towing.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TowingPageRoutingModule
  ],
  declarations: [TowingPage]
})
export class TowingPageModule {}
