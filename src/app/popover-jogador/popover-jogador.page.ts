import { Component } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-list-jogador',
  templateUrl: 'popover-jogador.page.html'
})
export class PopoverJogadorPage {
  public list: any;
  constructor(public navParams: NavParams, public popoverController: PopoverController) {
    this.list = navParams.get("list");
  }

  close() {
    this.popoverController.dismiss()
  }
}
