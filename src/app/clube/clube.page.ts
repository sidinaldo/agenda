import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { AlertController, LoadingController, ActionSheetController } from '@ionic/angular';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';



@Component({
  selector: 'app-clube',
  templateUrl: 'clube.page.html'
})
export class ClubePage {
  public user: any;
  public form: FormGroup;
  public editar: boolean = false;
  public itemsRef: AngularFireList<any>;
  public items: Observable<any[]>;

  constructor(
    private fb: FormBuilder,
    private db: AngularFireDatabase,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.form = this.fb.group({
      nome: ['', Validators.compose([
        Validators.required
      ])],
      bairro: ['', Validators.compose([
        Validators.required
      ])],
      cidade: ['', Validators.compose([
        Validators.required
      ])]
    });

    loadingCtrl.create({
      message: 'Aguarde...',
      duration: 2000
    }).then(res => res.present());

    this.itemsRef = db.list('clubes');
    this.items = this.itemsRef.snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    );
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
              bairro: item.bairro
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
    this.itemsRef.update(this.form.controls['key'].value, this.form.value ).then(res => {
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
  }
}
