import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFireAuth} from '@angular/fire/auth';
import { LoadingController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { AngularFireDatabase} from '@angular/fire/database';
import { Observable } from 'rxjs';
declare var google;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  users: Observable<any>;
  user_mobile: string;
  constructor(private statusBar: StatusBar,private geolocation: Geolocation,private route: Router,private storage: Storage,public actionSheetController: ActionSheetController,private auth: AngularFireAuth,public loadingController: LoadingController,    private oneSignal: OneSignal,private database: AngularFireDatabase) {
    // this.statusBar.styleDefault();
    this.users = this.database.list("Users").valueChanges();
    this.statusBar.styleLightContent();

  }

  //towing
  towing(){
    this.route.navigate(['/towingdriver']);
  }


  saveToken(email:string){
    this.oneSignal.getIds().then(identity => {
      let id = identity.userId;
      console.log("user's device id is ", id," the email address is ", email);
      //get user's mobile number
      this.users.subscribe(users=>{
        for(var u =0; u < users.length; u++){
          if(users[u].email == email){
            this.user_mobile = users[u].mobile
            console.log("users email ", users[u].email, " mobile number is ", this.user_mobile);
            this.database.object("Users/"+this.user_mobile).update({device_id:id});
          }
        }
      });
      //
    });
  }

  ionViewDidEnter(){
    this.storage.get("email").then(x=>{
      // loading.dismiss();//disable this when connection available
      //save the user's device id
      this.saveToken(x);
      if(x == null){
        this.route.navigate(['/login']);
      }
      this.storage.get("password").then(p=>{
        this.auth.auth.signInWithEmailAndPassword(x, p).then(b=>{
          console.log(b);
        }).catch(()=>{
        });
      });
    })    
  }

}
