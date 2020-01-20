import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFireAuth} from '@angular/fire/auth';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-towing',
  templateUrl: './towing.page.html',
  styleUrls: ['./towing.page.scss'],
})
export class TowingPage implements OnInit {

  constructor(private route: Router,private storage: Storage,private auth: AngularFireAuth,public loadingController: LoadingController) { }

  ngOnInit() {
  }


  async ionViewDidEnter(){
    this.storage.get("email").then(x=>{
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


  towing(size){
    console.log(size);
    this.storage.set("towingSize", size);
    this.route.navigate(['/towingdriver']);
  }

}
