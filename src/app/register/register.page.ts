import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase} from '@angular/fire/database';
import { AngularFireAuth} from '@angular/fire/auth';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Observable } from 'rxjs';
import { MenuController } from '@ionic/angular';
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  email = "";
  password = "";
  password_2 = "";
  mobilenum = 0;
  users;
  constructor(private menu: MenuController,private statusBar: StatusBar,private route: Router,private storage: Storage,private alert: AlertController,private database: AngularFireDatabase,private auth: AngularFireAuth,public loadingController: LoadingController) {
    this.users = this.database.list("Users").valueChanges();

   }

  ngOnInit() {
  }


  signIn(){
    this.route.navigate(['/login']);
  }


  signUp(){
    if( this.password != "" && this.password == this.password_2 && this.mobilenum != 0){
      this.auth.auth.createUserWithEmailAndPassword(this.email,this.password).then(x=>{
        console.log("registered ", x["message"]);
        this.createNewDatabaseEntry();
      this.route.navigate(['/login']);
      }).catch(err=>{
        this.errorSignUp(err["message"]);
      });
    }else{
      this.errorLogin();
    }

  }

  createNewDatabaseEntry(){
    this.database.object("Users/"+this.mobilenum).set({"mobile":this.mobilenum,"email":this.email,"fullname":"","driver":false,"location":""});
  }


  ionViewDidEnter(){
    this.statusBar.backgroundColorByHexString('#ffffff');
    this.menu.enable(false);
  }

  async errorSignUp(message){
    const alert = await this.alert.create({
      subHeader: 'Error',
      message: message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async errorLogin(){
    const alert = await this.alert.create({
      subHeader: 'Error',
      message: 'Sign up error, please fill in all fields and ensure passwords match.',
      buttons: ['OK']
    });
    await alert.present();
  }

}
