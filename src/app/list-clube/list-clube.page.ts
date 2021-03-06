import { Component, ViewChild } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoadingController, ModalController, InfiniteScroll } from '@ionic/angular';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-list-clube',
  templateUrl: 'list-clube.page.html'
})
export class ListClubePage {
  public user: any;
  public itemsRef: AngularFireList<any>;
  public items: Observable<any[]>;
  public filter: any;
  public news: Array<any> = [];
  public newsTemp: Array<any> = [];
  public page = 1;
  public perPage = 0;
  public totalData = 0;
  public totalPage = 0;
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

    this.itemsRef = db.list('clubes');
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      })
    );

    this.items.subscribe(list => {
      this.newsTemp = list;
      this.totalData = list.length;
      this.getTopStories()
    });
  }

  filterNome(val) {
    if (this.totalData > 10)
      this.infiniteScroll.disabled = true;

    var res = val.target.value;
    if (res && res.trim() != '') {
      this.items.subscribe(list => {
        this.news = list.filter((r) => {
          return (r.nome.toLowerCase().indexOf(res.toLowerCase()) > -1);
        })
      });
      console.log(val, res, this.news)
    } else {
      if (this.totalData > 10)
        this.infiniteScroll.disabled = false;
      this.news.length = 0;
      this.getTopStories();
    }
  }

  getTopStories() {
    this.news = this.newsTemp.filter((item, indx, array) => {
      if (indx <= 5)
        return item;
    });
    this.perPage = 5;
    this.totalPage = 6;
  }

  doInfinite(infiniteScroll) {
    this.totalPage = this.page * 5;
    setTimeout(() => {
      let result = this.newsTemp.slice(this.page * 5);
      for (let i = 1; i <= this.perPage; i++) {
        if (result[i] != undefined) {
          var n = {
            nome: result[i].nome,
            bairro: result[i].bairro,
            cidade: result[i].cidade,
            key: result[i].key
          }
          this.news.push(n);
        }
      }
      this.page += 1;

      infiniteScroll.target.complete();

    }, 2000);
  }

  dismiss() {
    this.modalCtl.dismiss(
      this.checked()
    );
  }

  checked(): any {
    return this.news.filter(item => {
      return (item.isChecked);
    });
  }

  getItems(ev: any) {
    const val = ev.target.value;
    if (val && val.trim() != '') {
      this.filter = this.news.filter((item) => {
        return (item.nome.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
}
