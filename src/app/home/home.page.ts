import { Component } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFireAuth} from '@angular/fire/auth';
import { LoadingController } from '@ionic/angular';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
declare var google;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private statusBar: StatusBar,private geolocation: Geolocation,private route: Router,private storage: Storage,public actionSheetController: ActionSheetController,private auth: AngularFireAuth,public loadingController: LoadingController) {
    // this.statusBar.styleDefault();
    this.statusBar.styleLightContent();

  }

  //towing
  towing(){
    this.route.navigate(['/towing']);
  }


  async ionViewDidEnter(){
    this.storage.get("email").then(x=>{
      // loading.dismiss();//disable this when connection available
      if(x == null){
        this.route.navigate(['/login']);
      }
      console.log("email is", x);
      this.storage.get("password").then(p=>{
        this.auth.auth.signInWithEmailAndPassword(x, p).then(b=>{
          console.log(b);

        }).catch(()=>{
        });
      });
    })    
  }

}
