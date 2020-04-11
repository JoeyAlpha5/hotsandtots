import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { AlertController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { AngularFireDatabase} from '@angular/fire/database';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MenuController } from '@ionic/angular';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Location } from "@angular/common";
import { Platform } from '@ionic/angular';
import { Router } from '@angular/router';
declare var google;
@Component({
  selector: 'app-driver-in-transit',
  templateUrl: './driver-in-transit.page.html',
  styleUrls: ['./driver-in-transit.page.scss'],
})
export class DriverInTransitPage implements OnInit {

    fullname = "---";
    mobile = "---";
  constructor(private route: Router,private location: Location,private statusBar: StatusBar,private menu: MenuController,private storage: Storage,private geolocation: Geolocation,private alert: AlertController,public loadingController: LoadingController,private database: AngularFireDatabase,private http: HttpClient,private platform: Platform) {
    this.platform.backButton.subscribeWithPriority(0, ()=>{
        this.location.back();
      });
    
   }

  ngOnInit() {
  }


  async presentalert(){
    this.storage.remove("passenger_fullname");
    const alert = await this.alert.create({
        header: 'Confirm Request',
        message: 'A user has requested a ride.',
        buttons: [
            {
                text: 'Reject',
                handler: () => {
                    //set the driver's passenger
                    console.log('Rejected');
                    this.storage.get("mobile").then(mobile=>{
                        console.log("my mobile");
                        this.database.object("Users/"+mobile).update({"picking_up":"none"});
                        this.route.navigate(['/home']);
                    });
                }
              },{
                text: 'Confirm',
                handler: () => {
                    //set the driver's passenger
                    console.log('Confirm Okay');
                    this.storage.get("mobile").then(mobile=>{
                        console.log("my mobile");
                        this.database.object("Users/"+mobile).update({"picking_up":this.fullname});
                    });
                }
          }

        ]
      });
  
      await alert.present();
  }
  

  completed(){
    this.storage.remove("passenger_fullname");
    this.storage.get("mobile").then(mobile=>{
        console.log("my mobile");
        this.database.object("Users/"+mobile).update({"picking_up":"none"});
        this.route.navigate(['/home']);
    });
  }



  async ionViewDidEnter(){
    this.menu.enable(true);
    //display alert to driver
    this.storage.get("passenger_fullname").then(fn=>{
        this.fullname = fn;
        console.log("fullname is ", fn);
        this.presentalert();
        this.storage.remove("passenger_fullname");
    });
    this.storage.get("passenger_mobile").then(mb=>{
        this.mobile = mb;
        console.log("mobile is ", mb);
     });

    this.geolocation.getCurrentPosition().then((resp) => {
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
      console.log(resp.coords.latitude, resp.coords.longitude);
      var pyrmont = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      var map = new google.maps.Map(document.getElementById('mappp'), {
          center: pyrmont,
          zoom: 15,
          zoomControl: false,
          mapTypeControl: false,
          scaleControl: false,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: false,
                      styles: [{
                "elementType": "geometry",
                "stylers": [{
                    "color": "#f5f5f5"
                }]
            }, {
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#616161"
                }]
            }, {
                "elementType": "labels.text.stroke",
                "stylers": [{
                    "color": "#f5f5f5"
                }]
            }, {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "administrative.land_parcel",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#bdbdbd"
                }]
            }, {
                "featureType": "poi",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#eeeeee"
                }]
            }, {
                "featureType": "poi",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#757575"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e5e5e5"
                }]
            }, {
                "featureType": "poi.park",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            }, {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#ffffff"
                }]
            }, {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "road.arterial",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#757575"
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#dadada"
                }]
            }, {
                "featureType": "road.highway",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#616161"
                }]
            }, {
                "featureType": "road.local",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            }, {
                "featureType": "transit",
                "stylers": [{
                    "visibility": "off"
                }]
            }, {
                "featureType": "transit.line",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#e5e5e5"
                }]
            }, {
                "featureType": "transit.station",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#eeeeee"
                }]
            }, {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{
                    "color": "#c9c9c9"
                }]
            }, {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{
                    "color": "#9e9e9e"
                }]
            }],
        });
        var uluru = {lat: resp.coords.latitude, lng: resp.coords.longitude};
        var marker = new google.maps.Marker({position: uluru, map: map});
        //set destination
        this.storage.get("destination").then(dest=>{
            var destination = dest;
            var marker = new google.maps.Marker({position: destination, map: map});
            this.showRoute(map,uluru,destination);
        });
    });
  }

  showRoute(map,uluru,destination){
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    //add your map to direction service
    directionsDisplay.setMap(map);
    var start = uluru;
    var end = destination;
    var request = {
        origin: start,
        destination: end,
        travelMode: 'DRIVING'
    };
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
        }
    });
  }

}
