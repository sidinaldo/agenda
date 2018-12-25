import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: './home/home.module#HomePageModule'
  },
  {
    path: 'contact',
    loadChildren: './contact/contact.module#ContactPageModule'
  },
  {
    path: 'login',
    loadChildren: './login/login.module#LoginPageModule'
  },
  {
    path: 'jogo',
    loadChildren: './jogo/jogo.module#JogoPageModule'
  },
  {
    path: 'campo',
    loadChildren: './campo/campo.module#CampoPageModule'
  },
  {
    path: 'clube',
    loadChildren: './clube/clube.module#ClubePageModule'
  },
  {
    path: 'list',
    loadChildren: './list-clube/list-clube.module#ListClubePageModule'
  },
  {
    path: 'jogador',
    loadChildren: './jogador/jogador.module#JogadorPageModule'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
