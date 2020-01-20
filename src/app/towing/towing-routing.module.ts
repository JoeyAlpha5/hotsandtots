import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TowingPage } from './towing.page';

const routes: Routes = [
  {
    path: '',
    component: TowingPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TowingPageRoutingModule {}
