import { Component, ViewChild } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { AlertController, LoadingController, ActionSheetController, ModalController, InfiniteScroll, PopoverController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ListClubePage } from '../list-clube/list-clube.page';
import { ListJogadorPage } from '../list-jogador/list-jogador.page';
import { PopoverJogadorPage } from '../popover-jogador/popover-jogador.page';



@Component({
  selector: 'app-jogo',
  templateUrl: 'jogo.page.html'
})
export class JogoPage {
  public user: any;
  public form: FormGroup;
  public editar: boolean = false;
  public anos: Array<number> = [];
  public itemsRef: AngularFireList<any>;
  public items: Observable<any[]>;
  public campoRef: AngularFireList<any>;
  public campos: Array<any> = [];
  public nomeMandante: string;
  public nomeVisitante: string;
  public nomeCampo: string;
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
    public actionSheetCtrl: ActionSheetController,
    public modalCtl: ModalController,
    public popoverController: PopoverController
  ) {
    this.form = this.fb.group({
      key: [''],
      data: ['', Validators.compose([
        Validators.required
      ])],
      campo: ['', Validators.compose([
        Validators.required
      ])],
      mandante: ['', Validators.compose([
        Validators.required
      ])],
      visitante: ['', Validators.compose([
        Validators.required
      ])],
      observacao: ['', Validators.compose([
        Validators.required
      ])],
      golsVisitante: [''],
      golsMandante: [''],
      jogadores: [''],
    });


    loadingCtrl.create({
      message: 'Hellooo',
      duration: 2000
    }).then(res => res.present());

    this.itemsRef = db.list('jogos');
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes => {
        return changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      })
    );

    this.items.subscribe(list => {
      console.log(list)
      this.newsTemp = list;
      this.totalData = list.length;
      this.getTopStories()
    });

    this.campoRef = db.list('campos');
    this.campoRef.snapshotChanges(['child_added']).subscribe(actions => {
      actions.forEach(action => {
        const object2 = Object.assign({ key: action.key }, action.payload.val());
        this.campos.push(object2);
      });
      // console.log(this.campos)
    });

    var ano = new Date().getFullYear();
    for (let index = 2009; index <= ano; index++) {
      this.anos.push(index);
    }

    this.form.controls['campo'].valueChanges.subscribe(res => {
      if (res)
        this.nomeCampo = res.bairro
    });
  }

  async listJogadores() {
    console.log(this.form.controls['jogadores'].valid, this.form.controls['jogadores'])
    console.log(this.form.controls['jogadores'].dirty, this.form.controls['jogadores'].pristine)
    const popover = await this.popoverController.create({
      component: PopoverJogadorPage,
      // event: ,
      componentProps: { list: this.form.controls["jogadores"].value },
      translucent: true
    });
    return await popover.present();
  }

  getTopStories() {
    this.news = this.newsTemp.filter((item, indx, array) => {
      if (indx <= 5)
        return item;
    });
    this.perPage = 5;
    this.totalPage = 6;
    console.log(this.news)
  }

  doInfinite(infiniteScroll) {
    this.totalPage = this.page * 5;
    setTimeout(() => {
      let result = this.newsTemp.slice(this.page * 5);
      for (let i = 1; i <= this.perPage; i++) {
        if (result[i] != undefined) {
          var n = {
            campo: result[i].campo,
            data: result[i].data,
            golsMandante: result[i].golsMandante,
            golsVisitante: result[i].golsVisitante,
            key: result[i].key,
            jogadores: result[i].jogadores,
            mandante: result[i].mandante,
            visitante: result[i].visitante,
            observacao: result[i].observacao,

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

    console.log(res)

    if (res && res.trim() != '') {
      this.items.subscribe(list => {
        this.news = list.filter((r) => {
          return (r.visitante.nome.toLowerCase().indexOf(res.toLowerCase()) > -1);
        })
      });
    } else {
      if (this.totalData > 10)
        this.infiniteScroll.disabled = false;

      this.news.length = 0;
      this.getTopStories();
    }
  }

  async addClubes() {
    const modal = await this.modalCtl.create({
      component: ListClubePage
    });

    modal.onDidDismiss()
      .then((res) => {
        console.log(res)
        this.form.patchValue({
          mandante: res.data[0],
          visitante: res.data[1]
        });
        this.nomeMandante = res.data[0].nome;
        this.nomeVisitante = res.data[1].nome;

      });

    return await modal.present();
  }

  async addPlayers() {
    const modal = await this.modalCtl.create({
      component: ListJogadorPage
    });

    modal.onDidDismiss()
      .then((res) => {
        this.form.patchValue({
          jogadores: res.data
        });
        console.log(this.form.value, res.data)
      });

    return await modal.present();
  }

  async addItem() {
    // console.log(this.form.value)
    const loading = await this.loadingCtrl.create({
      message: 'Salvando jogo...',
      duration: 2000
    });
    await loading.present();
    this.db.list('/jogos').push(this.form.value).then(res => {
      this.form.reset();
      this.nomeMandante = '';
      this.nomeVisitante = '';
      this.nomeCampo = ''
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
      this.nomeMandante = '';
      this.nomeVisitante = '';
      this.nomeCampo = ''
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

  async acao(newText: any) {
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
              key: newText.key,
              data: newText.data,
              campo: newText.campo,
              mandante: newText.mandante,
              visitante: newText.visitante,
              observacao: newText.observacao,
              golsVisitante: newText.golsVisitante,
              golsMandante: newText.golsMandante,
              jogadores: newText.jogadores
            });
            this.nomeMandante = newText.mandante.nome;
            this.nomeVisitante = newText.visitante.nome;
            this.nomeCampo = newText.campo.nome;
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


  clear() {
    this.form.reset();
    this.editar = false;
    this.nomeMandante = '';
    this.nomeVisitante = '';
    this.nomeCampo = ''
  }

  addJogador(): any {
    throw new Error("Method not implemented.");
  }
  getJogadores(): any {
    throw new Error("Method not implemented.");
  }
  delete(item: any): any {
    throw new Error("Method not implemented.");
  }
}
