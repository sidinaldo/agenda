import { Component, ViewChild } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertController, LoadingController, ActionSheetController, InfiniteScroll, Item } from '@ionic/angular';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



@Component({
  selector: 'app-jogador',
  templateUrl: 'jogador.page.html'
})
export class JogadorPage {
  public user: any;
  public form: FormGroup;
  public editar: boolean = false;
  public itemsRef: AngularFireList<any>;
  public items: Observable<any[]>;
  public posicao: string;
  public news: Array<any> = [];
  public newsTemp: Array<any> = [];
  public page = 1;
  public perPage = 0;
  public totalData = 0;
  public totalPage = 0;
  @ViewChild(InfiniteScroll) infiniteScroll: InfiniteScroll;

  constructor(
    private fb: FormBuilder,
    private db: AngularFireDatabase,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.form = this.fb.group({
      key: [''],
      nome: ['', Validators.compose([
        Validators.required
      ])],
      posicao: ['', Validators.compose([
        Validators.required
      ])],
      apelido: ['', Validators.compose([
        Validators.required
      ])],
      ativo: [true, Validators.compose([
        Validators.required
      ])]
    });

    loadingCtrl.create({
      message: 'Aguarde...',
      duration: 2000
    }).then(res => res.present());

    this.itemsRef = db.list('jogadores');
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

    this.form.controls['nome'].valueChanges.subscribe(res => {
      this.filterNome(null, res);
    });

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
            key: result[i].key
          }
          this.news.push(n);
        }
      }
      this.page += 1;

      infiniteScroll.target.complete();

    }, 2000);
  }

  filterNome(val1: any, val2) {
    if (this.totalData > 10)
      this.infiniteScroll.disabled = true;

    var res: string;
    if (val1)
      res = val1.target.value;

    if (val2)
      res = val2;

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

  async acao(key: string, item: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Ações',
      animated: true,
      buttons: [
        {
          text: 'Edit',
          icon: 'create',
          handler: () => {
            this.editar = true;
            this.form.patchValue({
              nome: item.nome,
              apelido: item.apelido,
              posicao: item.posicao,
              ativo: item.ativo,
              key: item.key
            });
            this.posicao = item.posicao
            console.log(this.form.value, key)
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deleteItem();
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    return await actionSheet.present();
  }

  async addItem() {
    const loading = await this.loadingCtrl.create({
      message: 'Salvando jogo...',
      duration: 2000
    });
    await loading.present();
    this.itemsRef.push(this.form.value).then(res => {
      this.form.reset();
      return loading.dismiss();
    }, async (err) => {
      loading.dismiss();
      let alert = await this.alertCtrl.create({
        header: 'Alert',
        subHeader: 'Ops, algo deu errado',
        message: 'Você não tem permissão.',
        buttons: ['OK']
      });
      return alert.present();
    });
  }

  async updateItem() {
    this.itemsRef.update(this.form.controls['key'].value, this.form.value).then(res => {
      this.editar = false;
      this.form.reset();
    }).catch(err => {
      let alert = this.alertCtrl.create({
        header: 'Alert',
        subHeader: 'Ops, algo deu errado',
        message: 'Você não tem permissão.',
        buttons: ['OK']
      });
      this.editar = true;
      return alert.then(res => res.present());
    });
  }

  deleteItem() {
    this.itemsRef.remove(this.form.controls['key'].value);
  }

  submit() {
    if (this.editar) {
      this.updateItem();
    } else {
      this.addItem();
    }
  }

  clear() {
    this.form.reset();
    this.editar = false;
    this.posicao = null;
  }


}
