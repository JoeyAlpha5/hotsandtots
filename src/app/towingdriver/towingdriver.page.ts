import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFireAuth} from '@angular/fire/auth';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
import { AngularFireDatabase} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MenuController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Location } from "@angular/common";
declare var google;
@Component({
  selector: 'app-towingdriver',
  templateUrl: './towingdriver.page.html',
  styleUrls: ['./towingdriver.page.scss'],
})
export class TowingdriverPage implements OnInit {
  places: Observable<any>;
  destination = "";
  location;
  places_data;
  fare_price;
  constructor(private Location: Location,private menu: MenuController,private statusBar: StatusBar,private route: Router,private storage: Storage,private auth: AngularFireAuth,public loadingController: LoadingController,private geolocation: Geolocation,private database: AngularFireDatabase,private http: HttpClient,private platform: Platform) { 
    this.platform.backButton.subscribeWithPriority(0, ()=>{
      this.location.back();
    });
  }

  ngOnInit() {
  }

  autocomplete(){
    console.log(this.location);
    var url = "https://jalome-api-python.herokuapp.com/distance-matrix/";
    this.http.get(url, {params:{"type":"getPlaces", "input":this.location} }).subscribe(x=>{
      console.log(x);
      this.places_data = x;
      this.places = this.places_data.data;
    });
  }



 async  SetDestination(destination){
    const loading = await this.loadingController.create({
      message: 'Please wait...',
      duration: 3000
    });
    await loading.present();
    this.places = null;
    var url = "https://jalome-api-python.herokuapp.com/distance-matrix/";
    this.geolocation.getCurrentPosition().then((resp) => {
      console.log(resp.coords.latitude, resp.coords.longitude);
      this.http.get(url, {params:{"type":"getTowFare","origins": resp.coords.latitude+","+resp.coords.longitude,"dest":destination}}).subscribe(re=>{
        console.log(re);
        this.fare_price = re;
        this.storage.set("prices", re);
        this.storage.set("destination", destination);
        loading.dismiss();
        this.route.navigate(["/towing"]);
      });
    });

  }


  ionViewDidEnter(){
    this.menu.enable(true);
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
  }

}
