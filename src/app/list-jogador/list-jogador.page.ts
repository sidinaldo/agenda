import { Component, ViewChild } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoadingController, ModalController, InfiniteScroll, NavParams } from '@ionic/angular';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-list-jogador',
  templateUrl: 'list-jogador.page.html'
})
export class ListJogadorPage {
  public user: any;
  public itemsRef: AngularFireList<any>;
  public items: Observable<any[]>;
  public news: Array<any> = [];
  public newsTemp: Array<any> = [];
  public page = 1;
  public perPage = 0;
  public totalData = 0;
  public totalPage = 0;
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;
  public listPlayers: Array<any> = [];

  constructor(
    private db: AngularFireDatabase,
    private loadingCtrl: LoadingController,
    public modalCtl: ModalController,
    public navParams: NavParams
  ) {

    loadingCtrl.create({
      message: 'Aguarde...',
      duration: 2000
    }).then(res => res.present());

    this.listPlayers = navParams.get("jogadores");

    this.itemsRef = db.list('jogadores');
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      })
    );

    this.items.subscribe(list => {
      if (this.listPlayers) {
        list.forEach(l => {
          var n = {
            nome: l.nome,
            apelido: l.apelido,
            posicao: l.posicao,
            ativo: l.ativo,
            key: l.key,
            gol: l.gol || 0,
            isChecked: l.isChecked || false
          }

          console.log(n)

        });
        
      } else {
        this.newsTemp = list;
        console.log("não tem players", this.listPlayers, this.newsTemp)
      }

      this.totalData = list.length;
      this.getTopStories()
    });
  }

  includeCheked(players: Array<any>): Array<any> {
    players.forEach(r => {
      this.listPlayers.forEach(l => {
        if (l.key == r.key) {
          r.gol = l.gol;
          r.isChecked = true;
        }
        console.log(players)
      });
    })
    return players;
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
            apelido: result[i].apelido,
            posicao: result[i].posicao,
            ativo: result[i].ativo,
            key: result[i].key,
            gol: result[i].gol || 0,
            isChecked: result[i].isChecked || false
          }
          console.log(n)
          this.news.push(n);
          // console.log(this.newsTemp, this.news);
        }
      }
      this.page += 1;

      infiniteScroll.target.complete();

    }, 2000);
  }


  filterNome(val: any) {
    if (this.totalData > 10)
      this.infiniteScroll.disabled = true;

    var res = val.target.value;
    if (res && res.trim() != '') {
      this.items.subscribe(list => {
        this.news = list.filter((r) => {
          return (r.nome.toLowerCase().indexOf(res.toLowerCase()) > -1);
        })
      });
    } else {
      if (this.totalData > 10)
        this.infiniteScroll.disabled = false;

      this.news.length = 0;
      this.getTopStories();
    }
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
}
