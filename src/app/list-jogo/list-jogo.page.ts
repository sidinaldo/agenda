import { Component } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { ActionSheetController, ModalController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';



@Component({
  selector: 'app-list-jogo',
  templateUrl: 'list-jogo.page.html'
})
export class ListJogoPage {
  public form: FormGroup;
  public itemsRef: AngularFireList<any>;
  public items: Array<any> = [];
  public anos: Array<number> = [];
  public listFilter: any;
  constructor(
    private db: AngularFireDatabase,
    private modalContl: ModalController,
    private loadingContl: LoadingController,
    private fb: FormBuilder,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.form = this.fb.group({
      ano: [new Date().getFullYear()],
      mes: new FormControl().disable()
    });
    loadingContl.create({
      message: 'Hellooo',
      duration: 2000
    }).then(res => res.present());

    this.itemsRef = db.list('jogos');
    this.itemsRef.snapshotChanges(['child_added'])
      .subscribe(actions => {
        actions.forEach(action => {
          var obj = { key: action.key, jogo: action.payload.val() }
          this.items.push(obj);
        });
        loadingContl.dismiss();
      });

    var ano = new Date().getFullYear();
    for (let index = 2009; index <= ano; index++) {
      this.anos.push(index);
    }

    this.form.controls['ano'].valueChanges.subscribe(res => {
      this.filter(res, 'ano');
    });

  }

   filter(res, tipo) {
    if (tipo === 'ano') {
      this.listFilter = this.items.filter(item => {
        this.form.controls['mes'].enable();
        return new Date(item.jogo.data).getFullYear() == res;
      });
    }

  }

  async acao(item: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Ações',
      animated: true,
      buttons: [
        {
          text: 'Edit',
          icon: 'create',
          handler: () => {
            // this.form.patchValue({
            //   key: item.key,
            //   data: item.jogo.data,
            //   campo: item.jogo.campo,
            //   mandante: item.jogo.mandante,
            //   visitante: item.jogo.visitante,
            //   status: item.jogo.status,
            //   observacao: item.jogo.observacao,
            //   golsVisitante: item.jogo.golsVisitante,
            //   golsMandante: item.jogo.golsVisitante,
            //   jogadores: item.jogo.jogadores
            // });
            console.log(item)
            //  this.router.navigate(['/jogo', { jogo: item }]);
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            // this.jogos = this.db.list('jogos');
            // this.items = this.items.snapshotChanges().pipe(changes => {
            //   console.log(changes);
            // });
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
    return actionSheet.present();
  }

  dismiss() {
    this.modalContl.dismiss();
  }

  // add back when alpha.4 is out
  // navigate(item) {
  //   this.router.navigate(['/list', JSON.stringify(item)]);
  // }
}
