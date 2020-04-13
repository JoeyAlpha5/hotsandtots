import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { AngularFireDatabase} from '@angular/fire/database';
import { AlertController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  data: Observable<any>;
  public appPages = [
    {
      title: 'Home',
      url: '/home',
      icon: 'home'
    },
    {
      title: 'Profile',
      url: '/list',
      icon: 'person'
    },
    {
      title:'Logout',
      // url:'/login',
      icon:'unlock'
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private oneSignal: OneSignal,
    private route: Router,
    private database:AngularFireDatabase,
    private router: Router,
    public alertController: AlertController,
    private http: HttpClient,
    public loadingController: LoadingController
  ) {
    this.initializeApp();
  }


  appFunc(title){
    console.log(title);
    if(title == "Logout"){
      // this.storage.clear();
      this.storage.remove("email");
      this.router.navigate(["/login"]);
    }
  }

setupPush(){
    this.oneSignal.startInit("3149b696-f959-4881-8cb3-4e9de3059598","790445352664");

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationOpened().subscribe((data) => {
      // do something when a notification is opened
      //got to notifications page
      // this.route.navigate(['/home/tabs/tab3']);
      var notif = data.notification.payload.notificationID;
      this.showNotification(notif);
      

    });

    this.oneSignal.handleNotificationReceived().subscribe(() => {
      this.storage.get("current_userID").then(val=>{
        this.database.object("userReceivedNotification/"+val).set(true);
      });
    // do something when notification is received
    // let msg = data.payload.body;
    // let title = data.payload.title;
    // let additionalData = data.payload.additionalData;
    // this.presentAlert(title,msg,additionalData)
    });

    this.oneSignal.endInit();
  }

  async showNotification(notif){
    const loading = await this.loadingController.create({
      message: 'Loading, please wait..',
    });
    loading.present()
    var url = "https://jalome-api-python.herokuapp.com/distance-matrix/";
    this.data = this.http.get(url, {params:{"type":"getNotif","notif_id":notif} });
    //
    this.data.subscribe(re=>{
      console.log("result ", re);
      this.storage.set("passenger_fullname", re.Response.fullname);
      this.storage.set("passenger_mobile", re.Response.mobile);
      this.storage.set("destination", re.Response.destination);
      loading.dismiss();
      this.route.navigate(['/driver-in-transit']);
    })

    // const alert = await this.alertController.create({
    //   header: 'Alert',
    //   subHeader: 'Subtitle',
    //   message: JSON.stringify(notif),
    //   buttons: ['OK']
    // });
    // await alert.present();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString('#000000');
      this.router.navigateByUrl('home');
      this.splashScreen.hide();
      this.setupPush();
    });
  }
}
