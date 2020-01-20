import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TowingdriverPage } from './towingdriver.page';

const routes: Routes = [
  {
    path: '',
    component: TowingdriverPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TowingdriverPageRoutingModule {}
