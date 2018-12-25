import { Component, ViewChild } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoadingController, ModalController, InfiniteScroll } from '@ionic/angular';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';

@Component({
  selector: 'app-list-jogador',
  templateUrl: 'list-jogador.page.html'
})
export class ListJogadorPage {
  public user: any;
  public itemsRef: AngularFireList<any>;
  public items: Array<any> = [];
  public filter: any;
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
  constructor(
    private db: AngularFireDatabase,
    private loadingCtrl: LoadingController,
    public modalCtl: ModalController
  ) {

    loadingCtrl.create({
      message: 'Aguarde...',
      duration: 2000
    }).then(res => res.present());

    this.itemsRef = this.db.list('jogadores');
    this.itemsRef.snapshotChanges(['child_added']).subscribe(actions => {
      actions.forEach(action => {
        var obj = { key: action.key, clube: action.payload.val(), isChecked: false }
        this.items.push(obj);
      });
    });
    this.filter = this.items;
  }

  
  dismiss() {
    this.modalCtl.dismiss(
      this.checked()
    );
  }

  checked(): any {
    return this.items.filter(item => {
      return (item.isChecked);
    });
  }

  getItems(ev: any) {
    const val = ev.target.value;
    if (val && val.trim() != '') {
      this.filter = this.items.filter((item) => {
        return (item.clube.nome.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
}
