import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverInTransitPage } from './driver-in-transit.page';

const routes: Routes = [
  {
    path: '',
    component: DriverInTransitPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverInTransitPageRoutingModule {}
