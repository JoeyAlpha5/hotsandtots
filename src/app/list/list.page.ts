import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFireAuth} from '@angular/fire/auth';
import { LoadingController } from '@ionic/angular';
import { AngularFireDatabase} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { DataService  } from '../services/data.service';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
declare var google;
@Component({
  selector: 'app-list',
  templateUrl: 'list.page.html',
  styleUrls: ['list.page.scss']
})
export class ListPage implements OnInit {

  fullname: string;
  mobile: string;
  location: string;
  drive: boolean = false;
  user: Observable<any>;
  users: Observable<any>;
  places: Observable<any>;
  profile_url =  'https://uploaded.herokuapp.com/users/users';
  constructor(private statusBar: StatusBar,private geolocation: Geolocation,private requests: DataService,private database: AngularFireDatabase,private route: Router,private storage: Storage,public actionSheetController: ActionSheetController,private auth: AngularFireAuth,public loadingController: LoadingController) {
    // this.statusBar.styleDefault();
    this.users = this.database.list("Users").valueChanges();
    this.statusBar.styleLightContent();
  }


  ngOnInit() {
  }


  update(){
    if(this.fullname != undefined && this.mobile != undefined && this.location != undefined && this.drive != undefined){
      console.log(this.drive)
      this.storage.get("email").then(x=>{
        var user_details = {fullname: this.fullname, mobile: this.mobile, location: this.location, email:x,driver:this.drive};  
        this.database.object("Users/"+this.mobile).set(user_details);
        // this.storage.set("mobile", this.mobile);
      });
    }
  }


  locations(){
    this.geolocation.getCurrentPosition().then((resp) => {
      // resp.coords.latitude
      // resp.coords.longitude
      console.log(resp.coords.latitude, resp.coords.longitude);
      var pyrmont = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      var map = new google.maps.Map(document.getElementById('map'), {
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


  async ionViewDidEnter(){
    //get user details
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
          }
        }
      });
    });
    //

    this.geolocation.getCurrentPosition().then((resp) => {
      console.log(resp.coords.latitude, resp.coords.longitude);
      var pyrmont = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      var map = new google.maps.Map(document.getElementById('map'), {
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



    const loading = await this.loadingController.create({
      message: 'Loading, please wait..',
    });
    
    loading.present();
    this.storage.get("email").then(x=>{
      if(x == null){
        loading.dismiss();
        this.route.navigate(['/login']);
      }
      console.log("email is", x);
      this.storage.get("password").then(p=>{
        this.auth.auth.signInWithEmailAndPassword(x, p).then(b=>{
          console.log(b);
          loading.dismiss();
        })
      });
    })    
  }
}
