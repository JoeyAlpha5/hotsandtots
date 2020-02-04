import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { AngularFireDatabase} from '@angular/fire/database';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
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
    private router: Router
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
    this.oneSignal.startInit("213117e1-5258-44df-9de4-7206c18669b9","929396145480");

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationOpened().subscribe(() => {
      // do something when a notification is opened
      //got to notifications page
      // this.route.navigate(['/home/tabs/tab3']);
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


  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
}
