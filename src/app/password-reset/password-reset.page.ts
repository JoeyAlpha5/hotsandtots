import { Component, OnInit } from '@angular/core';
import { AngularFireAuth} from '@angular/fire/auth';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.page.html',
  styleUrls: ['./password-reset.page.scss'],
})
export class PasswordResetPage implements OnInit {
  email = "";
  constructor(private auth: AngularFireAuth,private alert: AlertController) { }

  ngOnInit() {
  }


  reset(){
    this.auth.auth.sendPasswordResetEmail(this.email).then(re=>{
      console.log(re);
      this.showError("Please check your inbox","Email sent");
    }).catch(err=>{
      this.showError(err,"Error");
    });
  }


    //show msg
    async showError(err,head){
      const alert = await this.alert.create({
        header: head,
        // subHeader: 'check email:',
        message: err,
        buttons: ['OK']
      });
      await alert.present();
    }

}
