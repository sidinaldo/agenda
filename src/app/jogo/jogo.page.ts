import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertController, LoadingController, ActionSheetController, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ListClubePage } from '../list-clube/list-clube.page';


@Component({
  selector: 'app-jogo',
  templateUrl: 'jogo.page.html'
})
export class JogoPage {
  public user: any;
  public form: FormGroup;
  public formFilter: FormGroup;
  public editar: boolean = false;
  public anos: Array<number> = [];
  public listFilter: any;
  public jogoRef: AngularFireList<any>;
  public jogos: Observable<any[]>;
  public campoRef: AngularFireList<any>;
  public campos: Array<any> = [];
  public clubes: any;

  constructor(
    private fb: FormBuilder,
    private db: AngularFireDatabase,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    public actionSheetCtrl: ActionSheetController,
    public modalCtl: ModalController
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
      nomeMandante: [''],
      visitante: ['', Validators.compose([
        Validators.required
      ])],
      nomeVisitante: [''],
      status: ['', Validators.compose([
        Validators.required
      ])],
      observacao: ['', Validators.compose([
        Validators.required
      ])],
      golsVisitante: [''],
      golsMandante: [''],
      jogadores: ['']
    });


    loadingCtrl.create({
      message: 'Hellooo',
      duration: 2000
    }).then(res => res.present());

    this.jogoRef = db.list('jogos');
    this.jogos = this.jogoRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.campoRef = db.list('campos');
    this.campoRef.snapshotChanges(['child_added']).subscribe(actions => {
      actions.forEach(action => {
        var obj = { key: action.key, campo: action.payload.val() }
        this.campos.push(obj);
      });
      console.log(this.campos)
    });

    var ano = new Date().getFullYear();
    for (let index = 2009; index <= ano; index++) {
      this.anos.push(index);
    }
  }


  async addClubes() {
    const modal = await this.modalCtl.create({
      component: ListClubePage
    });

    modal.onDidDismiss()
      .then((data) => {
       this.form.patchValue({
        mandante: data.data.clubes[0].key,
        visitante: data.data.clubes[1].key,
        nomeMandante: data.data.clubes[0].clube.nome,
        nomeVisitante: data.data.clubes[1].clube.nome
       });
    });

    return await modal.present();
  }

  async addItem() {
    console.log(this.form.value)
    // const loading = await this.loadingCtrl.create({
    //   message: 'Salvando jogo...',
    //   duration: 2000
    // });
    // await loading.present();
    // this.db.list('/jogos').push(this.form.value).then(res => {
    //   this.form.reset();
    //   return loading.dismiss();
    // }, async (err) => {
    //   loading.dismiss();
    //   let alert = await this.alertCtrl.create({
    //     header: 'Alert',
    //     subHeader: 'Ops, algo deu errado',
    //     message: 'Você não tem permissão.',
    //     buttons: ['OK']
    //   });
    //   return alert.present();
    // });
  }

  async updateItem() {
    this.jogoRef.update(this.form.controls['key'].value, this.form.value).then(res => {
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
    this.jogoRef.remove(this.form.controls['key'].value);
  }

  submit() {
    if (this.editar) {
      this.updateItem();
    } else {
      this.addItem();
    }
  }

  async acao(key: string, newText: any) {
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
              status: newText.status,
              observacao: newText.observacao,
              golsVisitante: newText.golsVisitante,
              golsMandante: newText.golsMandante,
              jogadores: newText.jogadores
            });
            console.log(this.form.value)
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
