import { Component } from '@angular/core';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';


@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html'
})
export class LoginPage {
  public form: FormGroup;
  public authGmail: boolean = false;
  public user: any;
  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private loadingCtrl: LoadingController,
    private route: ActivatedRoute,
    private router: Router,
    private alertCtl: AlertController

  ) {
    this.form = this.fb.group({
      email: ['', Validators.compose([
        Validators.minLength(5),
        Validators.maxLength(160),
        Validators.required
      ])],
      password: ['', Validators.compose([
        Validators.minLength(6),
        Validators.maxLength(20),
        Validators.required
      ])]
    });

    // afAuth.authState.subscribe(user => {
    //   if (user) {
    //     this.user = user;
    //     this.router.navigate(['/home']);
    //   } else {
    //     this.user = null;
    //   }
    // });
  }

  loginFacebook() {
    var provider = new firebase.auth.FacebookAuthProvider();
    this.afAuth.auth.signInWithPopup(provider)
      .then(res => {
        this.router.navigate(['/home']);
      }).catch(error => {
        console.log(error)
      })
  }

  // logout() {
  //   this.afAuth.auth.signOut();
  //   this.user = null;
  // }

  async submit() {
    const loading = await this.loadingCtrl.create({
      message: 'Autenticando...'
    });
    loading.present();
    // this.afAuth
    //   .auth.signInWithEmailAndPassword(this.form.controls['email'].value, this.form.controls['password'].value)
    //   .then(async () => {
        await loading.dismiss();
        this.router.navigate(['/home']);
      // })
      // .catch(async (error) => {
      //   console.log(error);
      //   await loading.dismiss();
      //   const alert = await this.alertCtl.create({
      //     header: 'Autenticação Inválida',
      //     message: 'Usuário ou senha incorretos.',
      //     buttons: ['OK']
      //   });
      //   alert.present();
      // });
  }
}
