import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfirmTruckPage } from './confirm-truck.page';

const routes: Routes = [
  {
    path: '',
    component: ConfirmTruckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfirmTruckPageRoutingModule {}
