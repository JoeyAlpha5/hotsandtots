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
import { MenuController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
declare var google;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  users: Observable<any>;
  user_mobile: string;
  display_home;
  //driver content
  fullname: string;
  mobile: string;
  location: string;
  mail:string;
  drive: boolean = false;
  constructor(private menu: MenuController,private statusBar: StatusBar,private geolocation: Geolocation,private route: Router,private storage: Storage,public actionSheetController: ActionSheetController,private auth: AngularFireAuth,public loadingController: LoadingController,private platform: Platform,private oneSignal: OneSignal,private database: AngularFireDatabase) {
    // this.statusBar.styleDefault();
    this.users = this.database.list("Users").valueChanges();
    //close app on back press
    this.platform.backButton.subscribeWithPriority(0, ()=>{
      navigator['app'].exitApp();
    });

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
            console.log("user is driver", users[u].driver);
            if(users[u].driver == true){
            //
            this.storage.get("passenger_fullname").then(v=>{
                console.log("passenger is ", v);
                if(v != null){
                  this.route.navigate(['/driver-in-transit']);
                }
            })
              this.display_home = false;
              this.setDriverContent();
            }else{
              this.display_home = true;
            }
            console.log("users email ", users[u].email, " mobile number is ", this.user_mobile);
            this.database.object("Users/"+this.user_mobile).update({device_id:id});
          }
        }
      });
      //
    }).catch(err=>{
      console.log("error ", err);
      this.display_home = true;
    });
  }

  ionViewDidEnter(){
    this.platform.backButton.subscribeWithPriority(0, ()=>{
      navigator['app'].exitApp();
    });
    this.menu.enable(true);
    this.statusBar.backgroundColorByHexString('#ffffff');
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



  //driver content
  update(){
    if(this.fullname != undefined && this.mobile != undefined && this.location != undefined && this.drive != undefined){
      console.log(this.drive)
      this.storage.get("email").then(x=>{
        var user_details = {fullname: this.fullname, mobile: this.mobile, location: this.location, email:x,driver:this.drive};  
        this.database.object("Users/"+this.mobile).set(user_details);
        // this.storage.set("mobile", this.mobile);
        this.ionViewDidEnter();
      });
    }
  }


  locations(){
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      console.log(resp.coords.latitude, resp.coords.longitude);
      var pyrmont = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      var map = new google.maps.Map(document.getElementById('drivermap'), {
          center: pyrmont,
          zoom: 15,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false
        });
        var uluru = {lat: resp.coords.latitude, lng: resp.coords.longitude};
        var marker = new google.maps.Marker({position: uluru, map: map});

        var request = {
          query: this.location,
          fields: ['name', 'geometry'],
        };
    
        var service = new google.maps.places.PlacesService(map);
        service.findPlaceFromQuery(request, function(results, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            for (var i = 0; i < results.length; i++) {
              var coords = {lat: results[i].geometry.location.lat(), lng: results[i].geometry.location.lng()}
              var marker = new google.maps.Marker({position: coords , map: map});
            }
            map.setCenter(results[0].geometry.location);
          }
        });

     })
  }

  setDriverContent(){
    this.storage.get("email").then(x=>{
      this.users.subscribe(val=>{
        console.log(val);
        for(var a =0; a < val.length; a++){
          if(val[a].email == x){
            console.log(val[a]);
            this.fullname = val[a].fullname;
            this.mobile = val[a].mobile;
            this.drive = val[a].driver;
            this.location = val[a].location;
            this.mail = val[a].email;
          }
        }
      });
    });
    //

    this.geolocation.getCurrentPosition().then((resp) => {
      console.log(resp.coords.latitude, resp.coords.longitude);
      var pyrmont = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      var map = new google.maps.Map(document.getElementById('drivermap'), {
          center: pyrmont,
          zoom: 15,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false
        });
        var uluru = {lat: resp.coords.latitude, lng: resp.coords.longitude};
        var marker = new google.maps.Marker({position: uluru, map: map});
     })
  }


}
