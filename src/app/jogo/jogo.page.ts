import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
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
  public nomeMandante: string;
  public nomeVisitante: string;
  public nomeCampo: string;
  public status: boolean = false;

  constructor(
    private fb: FormBuilder,
    private db: AngularFireDatabase,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
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
      visitante: ['', Validators.compose([
        Validators.required
      ])],
      status: [false, Validators.compose([
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

    this.jogoRef = db.list('jogos');
    this.jogos = this.jogoRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );

    this.campoRef = db.list('campos');
    this.campoRef.snapshotChanges(['child_added']).subscribe(actions => {
      actions.forEach(action => {
        const object2 = Object.assign({ key: action.key }, action.payload.val());
        this.campos.push(object2);
      });
      console.log(this.campos)
    });

    var ano = new Date().getFullYear();
    for (let index = 2009; index <= ano; index++) {
      this.anos.push(index);
    }

    this.form.controls['campo'].valueChanges.subscribe(res => {
      console.log(res)
      this.nomeCampo = res.bairro
    });

  }

  getStatus(ev: any) {
    const val = ev.detail.checked;  
      this.form.patchValue({
        status: val
      });
  
    console.log(this.form.value);
  }


  async addClubes() {
    const modal = await this.modalCtl.create({
      component: ListClubePage
    });

    modal.onDidDismiss()
      .then((res) => {
        this.form.patchValue({
          mandante: res.data[0].clube,
          visitante: res.data[1].clube
        });
        this.nomeMandante = res.data[0].clube.nome;
        this.nomeVisitante = res.data[1].clube.nome;

      });

    return await modal.present();
  }

  async addItem() {
    console.log(this.form.value)
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
    this.jogoRef.update(this.form.controls['key'].value, this.form.value).then(res => {
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
            console.log(newText, key)
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
            this.nomeMandante = newText.mandante.nome;
            this.nomeVisitante = newText.visitante.nome;
            this.nomeCampo = newText.campo.nome;
            this.status = newText.status;
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
