import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopoverJogadorPage } from './popover-jogador.page';


  

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(
      [
        { path: '', component: PopoverJogadorPage }
      ]
      )
  ],
  declarations: [
    PopoverJogadorPage
  ]
})
export class PopoverJogadorPageModule {}
