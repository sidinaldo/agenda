import { Component } from '@angular/core';
import { Platform, MenuController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { timer } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  showSplash = true;
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Contato',
      url: '/contact',
      icon: 'contact'
    },
    {
      title: 'Login',
      url: '/login',
      icon: 'lock'
    },
    {
      title: 'Jogo',
      url: '/jogo',
      icon: 'calendar'
    },
    {
      title: 'Campo',
      url: '/campo',
      icon: 'contract'
    },
    {
      title: 'Clube',
      url: '/clube',
      icon: 'ribbon'
    },
    {
      title: 'Jogador',
      url: '/jogador',
      icon: 'ribbon'
    },
    {
      title: 'Lista de clubes',
      url: '/list',
      icon: 'ribbon'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private menuCtl: MenuController
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      timer(100).subscribe(() => this.showSplash = false)
    });
  }

  close() {
    this.menuCtl.close();
  }
}
