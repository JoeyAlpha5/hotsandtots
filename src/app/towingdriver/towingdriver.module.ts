import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TowingdriverPageRoutingModule } from './towingdriver-routing.module';

import { TowingdriverPage } from './towingdriver.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TowingdriverPageRoutingModule
  ],
  declarations: [TowingdriverPage]
})
export class TowingdriverPageModule {}
