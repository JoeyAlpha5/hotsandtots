import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverInTransitPageRoutingModule } from './driver-in-transit-routing.module';

import { DriverInTransitPage } from './driver-in-transit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverInTransitPageRoutingModule
  ],
  declarations: [DriverInTransitPage]
})
export class DriverInTransitPageModule {}
