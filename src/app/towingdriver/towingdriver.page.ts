import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { AngularFireAuth} from '@angular/fire/auth';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingController } from '@ionic/angular';
import { AngularFireDatabase} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-towingdriver',
  templateUrl: './towingdriver.page.html',
  styleUrls: ['./towingdriver.page.scss'],
})
export class TowingdriverPage implements OnInit {
  vehicle_size: string;
  min_price;
  drivers = [];
  users: Observable<any[]>;
  private headers = new Headers({ 'Accept': 'application/json' })
  constructor(private route: Router,private storage: Storage,private auth: AngularFireAuth,public loadingController: LoadingController,private geolocation: Geolocation,private database: AngularFireDatabase,private http: HttpClient) { 
    this.users = this.database.list("Users").valueChanges()
    this.storage.get("towingSize").then(x=>{
      console.log(x);
      this.vehicle_size = x +" Truck";
      if(x == "Small"){
        this.min_price = "Minimum price: " + 580;
      }else if(x == "Medium"){
        this.min_price = "Minimum price: " + 680;
      }else{
        this.min_price = "Minimum price: " + 760;
      }
    });
  }

  ngOnInit() {
  }

  async ionViewDidEnter(){
    const loading = await this.loadingController.create({
      message: 'Finding tow truck drivers..',
    });
    loading.present();

    this.geolocation.getCurrentPosition().then((resp) => {
      console.log(resp.coords.latitude, resp.coords.longitude);
      this.users.subscribe(x=>{
        //get location and price of drivers
        for(var c = 0; c < x.length; c++){
          var url = "https://jalome-api-python.herokuapp.com/distance-matrix/";
          // var url = "https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins="+-26.270759299999998+","+28.1122679+"&destinations=Pretoria&key=AIzaSyD7FkGPNnb-TnwiweIfGPgVGy3N3A0O6Mk&";
          if(x[c].driver == true){
            console.log(x[c]);
            this.http.get(url, {params: {"origins": resp.coords.latitude+","+resp.coords.longitude, "dest":x[c].location,"name":x[c].fullname,"location":x[c].location,"image":x[c].image} } ).subscribe(re=>{
              console.log(re)
              this.drivers.push(re);
            });
          }
        }
        loading.dismiss();
      })
     })
  }

}
