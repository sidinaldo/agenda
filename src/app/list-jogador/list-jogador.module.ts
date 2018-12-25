import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListJogadorPage } from './list-jogador.page';

  

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(
      [
        { path: '', component: ListJogadorPage }
      ]
      )
  ],
  declarations: [
    ListJogadorPage
  ]
})
export class ListJogadorPageModule {}
