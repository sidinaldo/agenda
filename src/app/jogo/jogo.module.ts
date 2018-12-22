import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JogoPage } from './jogo.page';
import { ListClubePage } from '../list-clube/list-clube.page';
  

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(
      [
        { path: '', component: JogoPage }
      ]
      )
  ],
  declarations: [
    JogoPage,
    ListClubePage
  ],
  entryComponents:[
    ListClubePage
  ]
})
export class JogoPageModule {}
