import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ListJogoPage } from './list-jogo.page';
import { JogoPage } from '../jogo/jogo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: ListJogoPage
      }
    ])
  ],
  declarations: [ListJogoPage]
})
export class ListJogoPageModule {}
