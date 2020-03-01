import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase} from '@angular/fire/database';
import { AngularFireAuth} from '@angular/fire/auth';
import { LoadingController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: "";
  password: "";
  users: Observable<any>;
  constructor(private statusBar: StatusBar,private route: Router,private storage: Storage,private alert: AlertController,private database: AngularFireDatabase,private auth: AngularFireAuth,public loadingController: LoadingController) {
    // this.statusBar.styleDefault();
    this.users = this.database.list("Users").valueChanges();
    this.statusBar.styleLightContent();

   }

  ngOnInit() {
  }

  async signIn(){
    // this.route.navigate(['/home']);//disable this when developing using internet connection
    if(this.email != undefined, this.password != undefined){
      const loading = await this.loadingController.create({
        message: 'Signing in please wait',
      });
      loading.present();
      this.auth.auth.signInWithEmailAndPassword(this.email, this.password).then(x=>{
        console.log(x);
        this.storage.set("email", this.email);
        this.storage.set("password", this.password);
        //save the user's data in local database
        this.users.subscribe(users=>{
          for(var u = 0; u < users.length; u++){
            if(users[u].email == this.email){
              // console.log(users[u]);
              // console.log(users[u].fullname)
              // console.log(users[u].mobile)
              this.storage.set("mobile", users[u].mobile)
              this.storage.set("name", users[u].fullname)
              loading.dismiss();
              this.route.navigate(['/home']);
            }
          }
        });


      }).catch(()=>{
        this.errorLogin();
        loading.dismiss();
      });
    }

  
  }


  async errorLogin(){
    const alert = await this.alert.create({
      subHeader: 'Error',
      message: 'Login error, please enter a valid email and password',
      buttons: ['OK']
    });
    await alert.present();
  }

  async ionViewDidEnter(){
    const loading = await this.loadingController.create({
      message: 'Signing in please wait',
    });
    
    loading.present();
    this.storage.get("email").then(x=>{
      if(x == null){
        loading.dismiss();
      }
      console.log("email is", x);
      this.storage.get("password").then(p=>{
        this.auth.auth.signInWithEmailAndPassword(x, p).then(b=>{
          console.log(b);
          this.route.navigate(['/home']);
          loading.dismiss();
        }).catch(()=>{
        });
      });
    })    
  }
}
