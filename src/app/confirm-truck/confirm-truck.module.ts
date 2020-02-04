import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfirmTruckPageRoutingModule } from './confirm-truck-routing.module';

import { ConfirmTruckPage } from './confirm-truck.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfirmTruckPageRoutingModule
  ],
  declarations: [ConfirmTruckPage]
})
export class ConfirmTruckPageModule {}
